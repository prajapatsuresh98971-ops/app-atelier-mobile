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
    const { child_id, action } = await req.json();

    if (!child_id || !action) {
      throw new Error('child_id and action are required');
    }

    if (!['lock', 'unlock'].includes(action)) {
      throw new Error('action must be lock or unlock');
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

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user is the parent of this child
    const { data: pairingData, error: pairingError } = await (supabaseClient as any)
      .from('device_pairings')
      .select('*')
      .eq('parent_id', user.id)
      .eq('child_id', child_id)
      .eq('is_active', true)
      .single();

    if (pairingError || !pairingData) {
      throw new Error('No active pairing found');
    }

    // Log the activity
    await (supabaseClient as any)
      .from('activity_logs')
      .insert({
        user_id: child_id,
        activity_type: 'device_control',
        description: `Device ${action}ed by parent`,
        metadata: { action, parent_id: user.id },
      });

    console.log(`Device ${action} requested for child:`, child_id);

    return new Response(
      JSON.stringify({
        success: true,
        action,
        message: `Device ${action} command sent`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in device-lock:', error);
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
