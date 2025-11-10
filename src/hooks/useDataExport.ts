import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ExportFormat = 'csv' | 'json';
type DataType = 'activity' | 'location' | 'media';

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportData = async (
    childId: string,
    format: ExportFormat,
    dataTypes: DataType[]
  ) => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-data', {
        body: { childId, format, dataTypes },
      });

      if (error) throw error;

      // Create download
      const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data)], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `child-data-export-${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Data exported successfully as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return { exportData, isExporting };
};
