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
    const { pairing_id, permissions } = await req.json();

    if (!pairing_id) {
      throw new Error('Pairing ID is required');
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

    // Get the authenticated user (child)
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user is a child and owns this pairing
    const { data: pairingData, error: findError } = await supabaseClient
      .from('device_pairings')
      .select('*')
      .eq('id', pairing_id)
      .eq('child_id', user.id)
      .single();

    if (findError || !pairingData) {
      throw new Error('Pairing not found or unauthorized');
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

    if (updateError) throw updateError;

    console.log('Pairing accepted by child:', user.id);

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
    console.error('Error accepting pairing:', error);
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
