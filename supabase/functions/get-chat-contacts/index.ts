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
      console.error('[get-chat-contacts] Authentication failed');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user role from server-side
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('[get-chat-contacts] Role lookup failed');
      return new Response(
        JSON.stringify({ error: 'Unable to determine user role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let contacts = [];

    if (roleData.role === 'parent') {
      // Get paired children
      const { data: pairings, error: pairingsError } = await supabaseClient
        .from('device_pairings')
        .select('child_id, profiles!device_pairings_child_id_fkey(name)')
        .eq('parent_id', user.id)
        .eq('is_active', true);

      if (pairingsError) {
        console.error('[get-chat-contacts] Pairings query failed:', pairingsError);
        return new Response(
          JSON.stringify({ error: 'Unable to fetch contacts' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      contacts = (pairings || []).map((p: any) => ({
        id: p.child_id,
        name: p.profiles?.name || 'Child',
      }));
    } else {
      // Get paired parents
      const { data: pairings, error: pairingsError } = await supabaseClient
        .from('device_pairings')
        .select('parent_id, profiles!device_pairings_parent_id_fkey(name)')
        .eq('child_id', user.id)
        .eq('is_active', true);

      if (pairingsError) {
        console.error('[get-chat-contacts] Pairings query failed:', pairingsError);
        return new Response(
          JSON.stringify({ error: 'Unable to fetch contacts' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      contacts = (pairings || []).map((p: any) => ({
        id: p.parent_id,
        name: p.profiles?.name || 'Parent',
      }));
    }

    console.log('[get-chat-contacts] Success for user:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        contacts,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[get-chat-contacts] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});