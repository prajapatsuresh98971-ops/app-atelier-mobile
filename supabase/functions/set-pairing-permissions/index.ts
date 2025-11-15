import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-service-key',
};

const RequestSchema = z.object({
  pairing_id: z.string().uuid(),
  permissions: z.object({
    camera: z.boolean().optional(),
    location: z.boolean().optional(),
    microphone: z.boolean().optional(),
    screen_recording: z.boolean().optional(),
  }).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Service key check - requires callers to present a server-side secret
    const serviceKey = Deno.env.get('SERVICE_KEY') ?? '';
    const incomingKey = req.headers.get('x-service-key') ?? '';

    if (!serviceKey || incomingKey !== serviceKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE') ?? '', // requires service role key
    );

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid request format', details: parsed.error.flatten() }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { pairing_id, permissions } = parsed.data;

    const update = {
      ...(permissions ? { permissions } : {}),
      status: 'active',
      is_active: true,
      activated_at: new Date().toISOString(),
    } as any;

    const { data: updated, error } = await supabaseClient
      .from('device_pairings')
      .update(update)
      .eq('id', pairing_id)
      .select()
      .single();

    if (error) {
      console.error('[set-pairing-permissions] update failed:', error);
      return new Response(JSON.stringify({ error: 'Failed to update pairing' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, pairing: updated }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[set-pairing-permissions] unexpected error:', err);
    return new Response(JSON.stringify({ error: 'An error occurred' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
