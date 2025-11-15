import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all active report preferences
    const { data: preferences, error: prefError } = await (supabaseClient as any)
      .from('report_preferences')
      .select('*')
      .eq('is_active', true);

    if (prefError) throw prefError;

    console.log(`Processing ${preferences?.length || 0} report preferences`);

    for (const pref of preferences || []) {
      // Get paired children
      const { data: pairings } = await (supabaseClient as any)
        .from('device_pairings')
        .select('child_id')
        .eq('parent_id', pref.user_id)
        .eq('is_active', true);

      if (!pairings || pairings.length === 0) continue;

      const childIds = pairings.map((p: any) => p.child_id);

      // Get activity logs for the past week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: activities } = await (supabaseClient as any)
        .from('activity_logs')
        .select('*')
        .in('user_id', childIds)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false });

      // Get location history
      const { data: locations } = await (supabaseClient as any)
        .from('location_history')
        .select('*')
        .in('user_id', childIds)
        .gte('timestamp', weekAgo.toISOString());

      // Calculate screen time from activities
      const screenTime = activities?.filter((a: any) => 
        a.activity_type === 'app_usage'
      ).reduce((acc: number, curr: any) => {
        return acc + (curr.metadata?.duration || 0);
      }, 0) || 0;

      // Generate report HTML
      const reportHtml = generateReportHtml({
        activities: activities || [],
        locations: locations || [],
        screenTime,
        childCount: childIds.length,
      });

      // Send email
      const { error: emailError } = await resend.emails.send({
        from: 'Mobiprotect <reports@resend.dev>',
        to: [pref.email],
        subject: 'Weekly Activity Report - Mobiprotect',
        html: reportHtml,
      });

      if (emailError) {
        console.error(`Failed to send email to ${pref.email}:`, emailError);
      } else {
        // Update last_sent_at
        await (supabaseClient as any)
          .from('report_preferences')
          .update({ last_sent_at: new Date().toISOString() })
          .eq('id', pref.id);
        
        console.log(`Report sent to ${pref.email}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: preferences?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-weekly-report:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateReportHtml(data: any): string {
  const { activities, locations, screenTime, childCount } = data;
  
  const screenTimeHours = Math.floor(screenTime / 3600);
  const screenTimeMinutes = Math.floor((screenTime % 3600) / 60);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563EB, #1E40AF); color: white; padding: 30px; border-radius: 10px; text-align: center; }
          .section { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .stat { display: inline-block; margin: 10px 20px; }
          .stat-value { font-size: 32px; font-weight: bold; color: #2563EB; }
          .stat-label { font-size: 14px; color: #6b7280; }
          .activity-item { padding: 10px; border-left: 3px solid #2563EB; margin: 10px 0; background: white; }
          .footer { text-align: center; color: #6b7280; margin-top: 40px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Weekly Activity Report</h1>
            <p>Your child's digital activity summary</p>
          </div>

          <div class="section">
            <h2>Overview</h2>
            <div class="stat">
              <div class="stat-value">${childCount}</div>
              <div class="stat-label">Monitored Children</div>
            </div>
            <div class="stat">
              <div class="stat-value">${screenTimeHours}h ${screenTimeMinutes}m</div>
              <div class="stat-label">Total Screen Time</div>
            </div>
            <div class="stat">
              <div class="stat-value">${activities.length}</div>
              <div class="stat-label">Activities Logged</div>
            </div>
            <div class="stat">
              <div class="stat-value">${locations.length}</div>
              <div class="stat-label">Location Updates</div>
            </div>
          </div>

          <div class="section">
            <h2>Recent Activities</h2>
            ${activities.slice(0, 10).map((activity: any) => `
              <div class="activity-item">
                <strong>${activity.activity_type}</strong>
                <p>${activity.description}</p>
                <small>${new Date(activity.created_at).toLocaleString()}</small>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>This is an automated report from Mobiprotect</p>
            <p>To manage your report preferences, visit your account settings</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
