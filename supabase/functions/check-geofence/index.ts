import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GeofenceZoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive().max(50000), // Max 50km
});

const RequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  zones: z.array(GeofenceZoneSchema).max(50), // Max 50 zones
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
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
      console.error('[check-geofence] Authentication failed');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('[check-geofence] Invalid input:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid geofence data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { latitude, longitude, zones } = validation.data;

    const alerts = [];

    for (const zone of zones) {
      const distance = calculateDistance(latitude, longitude, zone.latitude, zone.longitude);
      
      if (distance <= zone.radius) {
        alerts.push({
          zone,
          status: 'entered',
          distance: Math.round(distance),
        });

        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: user.id,
            activity_type: 'geofence_alert',
            description: `Entered geofence: ${zone.name}`,
            metadata: { zone_id: zone.id, distance: Math.round(distance) },
          });
      } else if (distance > zone.radius && distance <= zone.radius + 50) {
        alerts.push({
          zone,
          status: 'exited',
          distance: Math.round(distance),
        });

        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: user.id,
            activity_type: 'geofence_alert',
            description: `Exited geofence: ${zone.name}`,
            metadata: { zone_id: zone.id, distance: Math.round(distance) },
          });
      }
    }

    console.log('[check-geofence] Processed for user:', user.id);

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
    console.error('[check-geofence] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});