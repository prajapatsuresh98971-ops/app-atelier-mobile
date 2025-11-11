import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePairing } from "@/hooks/usePairing";
import { QRCodeScanner } from "@/components/QRScanner";
import { toast } from "sonner";

export default function QRScanner() {
  const navigate = useNavigate();
  const { validatePairingCode, isLoading } = usePairing();
  const [manualCode, setManualCode] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQRScan = async (scannedCode: string) => {
    setIsProcessing(true);
    try {
      // Clean and validate the scanned code
      const cleanCode = scannedCode.replace(/[^A-Z0-9]/g, '').toUpperCase();
      
      if (cleanCode.length !== 15) {
        toast.error("Invalid QR code format");
        setIsProcessing(false);
        return;
      }
      
      await validatePairingCode(cleanCode);
      
      toast.success("Device paired successfully!");
      setTimeout(() => {
        navigate('/parent/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Pairing failed:', error);
      setIsProcessing(false);
    }
  };

  const handlePairDevice = async () => {
    if (!manualCode.trim()) return;
    
    try {
      // Clean and uppercase the code
      const cleanCode = manualCode.replace(/[^A-Z0-9]/g, '').toUpperCase();
      
      // Validate format
      if (cleanCode.length !== 15) {
        toast.error("Code must be exactly 15 characters");
        return;
      }
      
      await validatePairingCode(cleanCode);
      setDialogOpen(false);
      
      toast.success("Device paired successfully!");
      setTimeout(() => {
        navigate('/parent/dashboard');
      }, 1500);
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
              {/* QR Scanner */}
              {isProcessing ? (
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Processing pairing...</p>
                  </div>
                </div>
              ) : (
                <QRCodeScanner onScan={handleQRScan} />
              )}

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
                        disabled={isLoading || isProcessing || !manualCode.trim()}
                      >
                        {isLoading || isProcessing ? "Pairing..." : "Pair Device"}
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
