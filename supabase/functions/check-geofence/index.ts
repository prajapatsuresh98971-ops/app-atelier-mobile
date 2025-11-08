import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, zones } = await req.json();

    if (!latitude || !longitude || !zones) {
      throw new Error('latitude, longitude, and zones are required');
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

    // Check each geofence zone
    const alerts: Array<{ zone: GeofenceZone; status: 'entered' | 'exited'; distance: number }> = [];

    for (const zone of zones as GeofenceZone[]) {
      const distance = calculateDistance(latitude, longitude, zone.latitude, zone.longitude);
      
      if (distance <= zone.radius) {
        alerts.push({ zone, status: 'entered', distance });
      } else if (distance > zone.radius && distance <= zone.radius + 50) {
        // 50m buffer zone for "exited" status
        alerts.push({ zone, status: 'exited', distance });
      }
    }

    // Log alerts to activity logs
    for (const alert of alerts) {
      await (supabaseClient as any)
        .from('activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'geofence_alert',
          description: `${alert.status === 'entered' ? 'Entered' : 'Exited'} ${alert.zone.name}`,
          metadata: {
            zone_id: alert.zone.id,
            zone_name: alert.zone.name,
            status: alert.status,
            distance: alert.distance,
            latitude,
            longitude,
          },
        });
    }

    console.log(`Geofence check for user ${user.id}:`, alerts.length, 'alerts');

    return new Response(
      JSON.stringify({
        success: true,
        alerts,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in check-geofence:', error);
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
