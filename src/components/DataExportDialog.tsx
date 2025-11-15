import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download } from "lucide-react";
import { useDataExport } from "@/hooks/useDataExport";

interface DataExportDialogProps {
  childId: string;
  childName: string;
}

export function DataExportDialog({ childId, childName }: DataExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'json'>('json');
  const [dataTypes, setDataTypes] = useState({
    activity: true,
    location: true,
    media: true,
  });
  const { exportData, isExporting } = useDataExport();

  const handleExport = async () => {
    const selectedTypes = Object.entries(dataTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => type as 'activity' | 'location' | 'media');

    if (selectedTypes.length === 0) return;

    await exportData(childId, format, selectedTypes);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Data for {childName}</DialogTitle>
          <DialogDescription>
            Download your child's activity history, location data, and media files
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'csv' | 'json')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON (Structured data)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV (Spreadsheet compatible)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Data Types</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="activity"
                  checked={dataTypes.activity}
                  onCheckedChange={(checked) => 
                    setDataTypes(prev => ({ ...prev, activity: !!checked }))
                  }
                />
                <Label htmlFor="activity">Activity Logs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="location"
                  checked={dataTypes.location}
                  onCheckedChange={(checked) => 
                    setDataTypes(prev => ({ ...prev, location: !!checked }))
                  }
                />
                <Label htmlFor="location">Location History</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="media"
                  checked={dataTypes.media}
                  onCheckedChange={(checked) => 
                    setDataTypes(prev => ({ ...prev, media: !!checked }))
                  }
                />
                <Label htmlFor="media">Media Files</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
