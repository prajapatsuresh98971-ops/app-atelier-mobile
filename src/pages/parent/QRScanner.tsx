import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePairing } from "@/hooks/usePairing";

import { supabase } from "@/integrations/supabase/client";
import { useRealtimePairing } from "@/hooks/useRealtimePairing";

export default function QRScanner() {
  const navigate = useNavigate();
  const { validatePairingCode, isLoading } = usePairing();
  const [manualCode, setManualCode] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [waitingPairingId, setWaitingPairingId] = useState<string | null>(null);
  const [showWaiting, setShowWaiting] = useState(false);

  const handlePairDevice = async () => {
    if (!manualCode.trim()) return;
    
    try {
      // Clean and uppercase the code
      const cleanCode = manualCode.replace(/[^A-Z0-9]/g, '').toUpperCase();
      
      // Validate format
      if (cleanCode.length !== 15) {
        return;
      }
      
      const data = await validatePairingCode(cleanCode);
      // validatePairingCode returns pairing info; keep pairing id and show waiting UI
      const pairingId = data?.pairing?.id ?? null;
      if (pairingId) {
        setWaitingPairingId(pairingId);
        setShowWaiting(true);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Pairing failed:', error);
    }
  };

  // Realtime listener: when pairing for this parent becomes active, navigate to live monitoring
  useRealtimePairing(async () => {
    try {
      if (!waitingPairingId) return;
      const { data, error } = await supabase
        .from('device_pairings')
        .select('*')
        .eq('id', waitingPairingId)
        .single();

      if (error) return;

      if (data?.status === 'active') {
        setShowWaiting(false);
        navigate('/parent/live-monitoring');
      }
    } catch (err) {
      console.error('Realtime pairing check failed:', err);
    }
  });

  const handleCancelWaiting = async () => {
    try {
      if (!waitingPairingId) {
        setShowWaiting(false);
        return;
      }
      // Optionally clear parent_id from pairing so it returns to pending without a parent
      await supabase.from('device_pairings').update({ parent_id: null }).eq('id', waitingPairingId);
    } catch (err) {
      console.error('Failed to cancel waiting pairing:', err);
    } finally {
      setWaitingPairingId(null);
      setShowWaiting(false);
    }
  };

  return (
    <Layout title="Pair Device" showHeader={false}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader className="text-center">
              <QrCode className="h-16 w-16 mx-auto mb-4 text-primary" />
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>
                Scan your child's QR code to pair their device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Camera Viewfinder */}
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="h-16 w-16 text-muted-foreground" />
                </div>
                {/* Scanning Overlay */}
                <div className="absolute inset-0 border-4 border-primary rounded-lg m-8">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
                </div>
                {/* Scan Line Animation */}
                <div className="absolute inset-x-8 top-8 h-1 bg-primary animate-pulse" />
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Position the QR code within the frame
                </p>
                {showWaiting && (
                  <div className="p-4 border rounded-lg bg-card space-y-3">
                    <p className="font-medium">Waiting for child to accept pairing...</p>
                    <p className="text-xs text-muted-foreground">Pairing id: {waitingPairingId}</p>
                    <div className="flex gap-2">
                      <Button onClick={handleCancelWaiting} variant="outline">Cancel</Button>
                    </div>
                  </div>
                )}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Enter Code Manually
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enter Pairing Code</DialogTitle>
                      <DialogDescription>
                        Enter the 15-character alphanumeric code from your child's device
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="code">Pairing Code</Label>
                        <Input
                          id="code"
                          placeholder="ABCD-EFGH-JKLM-NPQ"
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                          maxLength={19}
                        />
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handlePairDevice}
                        disabled={isLoading || !manualCode.trim()}
                      >
                        {isLoading ? "Pairing..." : "Pair Device"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
