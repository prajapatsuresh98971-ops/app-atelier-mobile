import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePairing } from "@/hooks/usePairing";

export default function QRScanner() {
  const navigate = useNavigate();
  const { validatePairingCode, isLoading } = usePairing();
  const [manualCode, setManualCode] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePairDevice = async () => {
    if (!manualCode.trim()) return;
    
    try {
      // Clean and uppercase the code
      const cleanCode = manualCode.replace(/[^A-Z0-9]/g, '').toUpperCase();
      
      // Validate format
      if (cleanCode.length !== 15) {
        return;
      }
      
      await validatePairingCode(cleanCode);
      setDialogOpen(false);
      navigate('/pairing/permissions');
    } catch (error) {
      console.error('Pairing failed:', error);
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
