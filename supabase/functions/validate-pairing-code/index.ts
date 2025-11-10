import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  pairing_code: z.string().length(15, 'Invalid code format').regex(/^\d+$/, 'Invalid code format'),
});

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const key = `${userId}:${Math.floor(now / 60000)}`; // per minute
  const limit = rateLimitStore.get(key);
  
  if (limit) {
    if (limit.count >= 5) {
      return false;
    }
    limit.count++;
  } else {
    rateLimitStore.set(key, { count: 1, resetAt: now + 60000 });
    // Cleanup old entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetAt < now) rateLimitStore.delete(k);
    }
  }
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('[validate-pairing-code] Authentication failed');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      console.warn('[validate-pairing-code] Rate limit exceeded for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('[validate-pairing-code] Invalid input:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { pairing_code } = validation.data;

    // Verify user is a parent
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleData?.role !== 'parent') {
      console.warn('[validate-pairing-code] Non-parent user attempted validation:', user.id);
      return new Response(
        JSON.stringify({ error: 'Unauthorized action' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the pairing
    const { data: pairingData, error: findError } = await supabaseClient
      .from('device_pairings')
      .select('*, profiles!device_pairings_child_id_fkey(name, email)')
      .eq('pairing_code', pairing_code)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (findError || !pairingData) {
      console.error('[validate-pairing-code] Pairing lookup failed');
      return new Response(
        JSON.stringify({ error: 'Unable to validate code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the pairing with parent_id
    const { data: updatedPairing, error: updateError } = await supabaseClient
      .from('device_pairings')
      .update({ parent_id: user.id })
      .eq('id', pairingData.id)
      .select('*, profiles!device_pairings_child_id_fkey(name, email)')
      .single();

    if (updateError) {
      console.error('[validate-pairing-code] Update failed:', updateError);
      return new Response(
        JSON.stringify({ error: 'Unable to complete pairing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[validate-pairing-code] Success for user:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        pairing: updatedPairing,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[validate-pairing-code] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});