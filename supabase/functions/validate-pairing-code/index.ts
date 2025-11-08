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
    const { pairing_code } = await req.json();

    if (!pairing_code) {
      throw new Error('Pairing code is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user (parent)
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user is a parent
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'parent') {
      throw new Error('Only parents can validate pairing codes');
    }

    // Find the pairing with the code
    const { data: pairingData, error: findError } = await supabaseClient
      .from('device_pairings')
      .select('*, profiles!device_pairings_child_id_fkey(name, email)')
      .eq('pairing_code', pairing_code)
      .eq('status', 'pending')
      .single();

    if (findError || !pairingData) {
      throw new Error('Invalid or expired pairing code');
    }

    // Check if code is expired
    const expiresAt = new Date(pairingData.expires_at);
    if (expiresAt < new Date()) {
      throw new Error('Pairing code has expired');
    }

    // Update the pairing with parent's ID
    const { data: updatedPairing, error: updateError } = await supabaseClient
      .from('device_pairings')
      .update({
        parent_id: user.id,
      })
      .eq('id', pairingData.id)
      .select('*, profiles!device_pairings_child_id_fkey(name, email)')
      .single();

    if (updateError) throw updateError;

    console.log('Pairing validated successfully for parent:', user.id);

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
    console.error('Error validating pairing code:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
