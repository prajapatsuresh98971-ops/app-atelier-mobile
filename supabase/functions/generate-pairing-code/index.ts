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

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user is a child
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'child') {
      throw new Error('Only children can generate pairing codes');
    }

    // Generate pairing code using the database function
    const { data: codeData, error: codeError } = await supabaseClient
      .rpc('generate_pairing_code');

    if (codeError) throw codeError;

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

    if (pairingError) throw pairingError;

    console.log('Generated pairing code:', pairingCode);

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
    console.error('Error generating pairing code:', error);
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
