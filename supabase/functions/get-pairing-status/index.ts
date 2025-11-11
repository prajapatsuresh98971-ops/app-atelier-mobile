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
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the pairing ID from query params
    const url = new URL(req.url);
    const pairingId = url.searchParams.get('pairing_id');

    if (!pairingId) {
      return new Response(
        JSON.stringify({ error: 'Pairing ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query the pairing status
    const { data: pairing, error: queryError } = await supabaseClient
      .from('device_pairings')
      .select('id, status, is_used, is_active, expires_at, created_at')
      .eq('id', pairingId)
      .or(`child_id.eq.${user.id},parent_id.eq.${user.id}`)
      .maybeSingle();

    if (queryError) {
      console.error('[get-pairing-status] Query error:', queryError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pairing status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pairing) {
      return new Response(
        JSON.stringify({ error: 'Pairing not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    const isExpired = new Date(pairing.expires_at) < new Date();

    return new Response(
      JSON.stringify({
        ...pairing,
        is_expired: isExpired,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[get-pairing-status] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
