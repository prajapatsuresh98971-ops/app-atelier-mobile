import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
        parent_id: user.id, // Temporary, will be updated when parent scans
        pairing_code: pairingCode,
        status: 'pending',
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