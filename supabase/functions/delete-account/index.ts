import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting account deletion for user: ${user.id}`);

    // Delete all user data in correct order
    // This ensures referential integrity and prevents orphaned records
    
    // 1. Delete notifications
    await supabaseAdmin.from('notifications').delete().eq('user_id', user.id);
    console.log('Deleted notifications');

    // 2. Delete notification preferences
    await supabaseAdmin.from('notification_preferences').delete().eq('user_id', user.id);
    console.log('Deleted notification preferences');

    // 3. Delete support tickets
    await supabaseAdmin.from('support_tickets').delete().eq('user_id', user.id);
    console.log('Deleted support tickets');

    // 4. Delete chat messages (sent and received)
    await supabaseAdmin.from('chat_messages').delete().or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
    console.log('Deleted chat messages');
    
    // 5. Delete activity logs
    await supabaseAdmin.from('activity_logs').delete().eq('user_id', user.id);
    console.log('Deleted activity logs');
    
    // 6. Delete location history
    await supabaseAdmin.from('location_history').delete().eq('user_id', user.id);
    console.log('Deleted location history');
    
    // 7. Delete media records
    await supabaseAdmin.from('media_records').delete().eq('user_id', user.id);
    console.log('Deleted media records');
    
    // 8. Delete geofences (as parent or child)
    await supabaseAdmin.from('geofences').delete().or(`parent_id.eq.${user.id},child_id.eq.${user.id}`);
    console.log('Deleted geofences');
    
    // 9. Delete device pairings (as parent or child)
    // Important: This removes the pairing relationship but doesn't delete the other user's account
    await supabaseAdmin.from('device_pairings').delete().or(`parent_id.eq.${user.id},child_id.eq.${user.id}`);
    console.log('Deleted device pairings');
    
    // 10. Delete devices
    await supabaseAdmin.from('devices').delete().eq('user_id', user.id);
    console.log('Deleted devices');
    
    // 11. Delete onboarding progress
    await supabaseAdmin.from('onboarding_progress').delete().eq('user_id', user.id);
    console.log('Deleted onboarding progress');
    
    // 12. Delete report preferences
    await supabaseAdmin.from('report_preferences').delete().eq('user_id', user.id);
    console.log('Deleted report preferences');

    // 13. Delete user role
    await supabaseAdmin.from('user_roles').delete().eq('user_id', user.id);
    console.log('Deleted user roles');
    
    // 14. Delete profile
    await supabaseAdmin.from('profiles').delete().eq('id', user.id);
    console.log('Deleted profile');

    // 15. Delete storage files (recordings, screenshots)
    const { data: recordings } = await supabaseAdmin.storage
      .from('recordings')
      .list(user.id);
    
    if (recordings && recordings.length > 0) {
      const recordingPaths = recordings.map(file => `${user.id}/${file.name}`);
      await supabaseAdmin.storage.from('recordings').remove(recordingPaths);
      console.log('Deleted recordings');
    }

    const { data: screenshots } = await supabaseAdmin.storage
      .from('screenshots')
      .list(user.id);
    
    if (screenshots && screenshots.length > 0) {
      const screenshotPaths = screenshots.map(file => `${user.id}/${file.name}`);
      await supabaseAdmin.storage.from('screenshots').remove(screenshotPaths);
      console.log('Deleted screenshots');
    }

    // 16. Finally, delete the auth user account
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      throw deleteUserError;
    }

    console.log(`Successfully deleted account for user: ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Account and all associated data deleted successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in delete-account function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: 'Failed to delete account',
        details: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
