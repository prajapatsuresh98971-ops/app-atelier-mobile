import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  file_path: z.string().max(500),
  media_type: z.enum(['recording', 'screenshot']),
  file_size: z.number().positive().optional().nullable(),
  duration: z.number().positive().optional().nullable(),
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
      console.error('[upload-recording] Authentication failed');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('[upload-recording] Invalid input:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid upload data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { file_path, media_type, file_size, duration } = validation.data;

    // Insert media record
    const { data, error } = await supabaseClient
      .from('media_records')
      .insert({
        user_id: user.id,
        media_type,
        file_path,
        file_size,
        duration,
      })
      .select()
      .single();

    if (error) {
      console.error('[upload-recording] Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Unable to save media record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the activity
    await supabaseClient
      .from('activity_logs')
      .insert({
        user_id: user.id,
        activity_type: 'media_upload',
        description: `${media_type} uploaded`,
        metadata: { media_type, file_path, file_size },
      });

    console.log('[upload-recording] Success for user:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[upload-recording] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});