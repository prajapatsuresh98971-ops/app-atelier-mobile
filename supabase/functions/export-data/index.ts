import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  childId: string;
  format: 'csv' | 'json';
  dataTypes: ('activity' | 'location' | 'media')[];
}

Deno.serve(async (req) => {
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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { childId, format, dataTypes }: ExportRequest = await req.json();

    // Verify parent has access to this child
    const { data: pairing } = await supabaseClient
      .from('device_pairings')
      .select('*')
      .eq('parent_id', user.id)
      .eq('child_id', childId)
      .eq('is_active', true)
      .eq('status', 'active')
      .single();

    if (!pairing) {
      throw new Error('Access denied to this child data');
    }

    const exportData: any = {};

    // Export activity logs
    if (dataTypes.includes('activity')) {
      const { data: activities } = await supabaseClient
        .from('activity_logs')
        .select('*')
        .eq('user_id', childId)
        .order('timestamp', { ascending: false });
      exportData.activities = activities || [];
    }

    // Export location history
    if (dataTypes.includes('location')) {
      const { data: locations } = await supabaseClient
        .from('location_history')
        .select('*')
        .eq('user_id', childId)
        .order('timestamp', { ascending: false });
      exportData.locations = locations || [];
    }

    // Export media records
    if (dataTypes.includes('media')) {
      const { data: media } = await supabaseClient
        .from('media_records')
        .select('*')
        .eq('user_id', childId)
        .order('created_at', { ascending: false });
      exportData.media = media || [];
    }

    if (format === 'json') {
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="child-data-export-${new Date().toISOString()}.json"`,
        },
      });
    } else {
      // Convert to CSV format
      const csvData: string[] = [];
      
      for (const [type, records] of Object.entries(exportData)) {
        if (Array.isArray(records) && records.length > 0) {
          csvData.push(`\n=== ${type.toUpperCase()} ===\n`);
          const headers = Object.keys(records[0]).join(',');
          csvData.push(headers);
          
          for (const record of records) {
            const values = Object.values(record).map(v => 
              typeof v === 'object' ? JSON.stringify(v) : String(v)
            ).join(',');
            csvData.push(values);
          }
        }
      }

      return new Response(csvData.join('\n'), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="child-data-export-${new Date().toISOString()}.csv"`,
        },
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: errorMessage === 'Unauthorized' ? 401 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
