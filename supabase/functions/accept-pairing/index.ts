import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PermissionsSchema = z.object({
  camera: z.boolean(),
  location: z.boolean(),
  microphone: z.boolean(),
  screen_recording: z.boolean(),
});

const RequestSchema = z.object({
  pairing_id: z.string().uuid(),
  permissions: PermissionsSchema.optional(),
});

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
      console.error('[accept-pairing] Authentication failed');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('[accept-pairing] Invalid input:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { pairing_id, permissions } = validation.data;

    // Verify user is a child and owns this pairing
    const { data: pairingData, error: findError } = await supabaseClient
      .from('device_pairings')
      .select('*')
      .eq('id', pairing_id)
      .eq('child_id', user.id)
      .maybeSingle();

    if (findError || !pairingData) {
      console.warn('[accept-pairing] Unauthorized access attempt by:', user.id);
      return new Response(
        JSON.stringify({ error: 'Unauthorized action' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the pairing status and permissions
    const { data: updatedPairing, error: updateError } = await supabaseClient
      .from('device_pairings')
      .update({
        status: 'active',
        is_active: true,
        activated_at: new Date().toISOString(),
        permissions: permissions || {
          camera: false,
          location: false,
          microphone: false,
          screen_recording: false,
        },
      })
      .eq('id', pairing_id)
      .select()
      .single();

    if (updateError) {
      console.error('[accept-pairing] Update failed:', updateError);
      return new Response(
        JSON.stringify({ error: 'Unable to complete pairing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[accept-pairing] Success for user:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        pairing: updatedPairing,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[accept-pairing] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});