import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  child_id: z.string().uuid(),
  action: z.enum(['lock', 'unlock']),
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
      console.error('[device-lock] Authentication failed');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('[device-lock] Invalid input:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { child_id, action } = validation.data;

    // Verify user is the parent of this child
    const { data: pairingData, error: pairingError } = await supabaseClient
      .from('device_pairings')
      .select('*')
      .eq('parent_id', user.id)
      .eq('child_id', child_id)
      .eq('is_active', true)
      .maybeSingle();

    if (pairingError || !pairingData) {
      console.warn('[device-lock] Unauthorized access attempt by:', user.id);
      return new Response(
        JSON.stringify({ error: 'Unauthorized action' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the activity
    await supabaseClient
      .from('activity_logs')
      .insert({
        user_id: child_id,
        activity_type: 'device_control',
        description: `Device ${action}ed by parent`,
        metadata: { action, parent_id: user.id },
      });

    console.log('[device-lock] Success for parent:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        action,
        message: `Command sent successfully`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[device-lock] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});