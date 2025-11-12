import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting store (in-memory, resets on function restart)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const limit = rateLimitStore.get(userId);
  
  if (!limit || limit.resetAt < now) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 5) { // Max 5 generations per minute
    return false;
  }
  
  limit.count++;
  return true;
};

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
      console.error('[generate-pairing-code] Authentication failed');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is a child
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleData?.role !== 'child') {
      console.warn('[generate-pairing-code] Non-child user attempted generation:', user.id);
      return new Response(
        JSON.stringify({ error: 'Unauthorized action' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      console.warn('[generate-pairing-code] Rate limit exceeded:', user.id);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Invalidate any existing unused codes for this child
    const { error: revokeError } = await supabaseClient
      .rpc('revoke_child_pairing_codes', { _child_id: user.id });
    
    if (revokeError) {
      console.error('[generate-pairing-code] Failed to revoke old codes:', revokeError);
    }

    // Generate pairing code using the database function
    const { data: codeData, error: codeError } = await supabaseClient
      .rpc('generate_pairing_code');

    if (codeError) {
      console.error('[generate-pairing-code] RPC error:', codeError);
      return new Response(
        JSON.stringify({ error: 'Unable to generate code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pairingCode = codeData;

    // Create a new pairing entry
    const { data: pairingData, error: pairingError } = await supabaseClient
      .from('device_pairings')
      .insert({
        child_id: user.id,
        parent_id: null, // Will be set when parent validates the code
        pairing_code: pairingCode,
        status: 'pending',
        is_used: false,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      })
      .select()
      .single();

    if (pairingError) {
      console.error('[generate-pairing-code] Database error:', pairingError);
      return new Response(
        JSON.stringify({ error: 'Unable to create pairing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-pairing-code] Success for user:', user.id);

    return new Response(
      JSON.stringify({
        pairing_code: pairingCode,
        expires_at: pairingData.expires_at,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[generate-pairing-code] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});