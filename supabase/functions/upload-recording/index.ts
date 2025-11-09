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
    const { file_path, media_type, file_size, duration } = await req.json();

    if (!file_path || !media_type) {
      throw new Error('file_path and media_type are required');
    }

    if (!['recording', 'screenshot'].includes(media_type)) {
      throw new Error('media_type must be recording or screenshot');
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

    // Insert media record
    const { data, error } = await (supabaseClient as any)
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

    if (error) throw error;

    // Log the activity
    await (supabaseClient as any)
      .from('activity_logs')
      .insert({
        user_id: user.id,
        activity_type: 'media_upload',
        description: `${media_type} uploaded`,
        metadata: { media_type, file_path, file_size },
      });

    console.log(`Media uploaded:`, data);

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
    console.error('Error in upload-recording:', error);
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
