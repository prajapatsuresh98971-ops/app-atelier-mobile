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
import { QRCodeScanner } from "@/components/QRCodeScanner";
import { PairingSuccessAnimation } from "@/components/PairingSuccessAnimation";
import { toast } from "sonner";

export default function QRScanner() {
  const navigate = useNavigate();
  const { validatePairingCode, isLoading } = usePairing();
  const [manualCode, setManualCode] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQRScan = async (code: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      const cleanCode = code.replace(/[^A-Z0-9]/g, '').toUpperCase();
      
      if (cleanCode.length !== 15) {
        toast.error("Invalid QR code format");
        setIsProcessing(false);
        return;
      }
      
      await validatePairingCode(cleanCode);
      
      // Show success animation
      setShowSuccess(true);
      toast.success("Pairing request sent!");
      
      // Wait for animation then navigate
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/parent/dashboard');
      }, 2500);
    } catch (error) {
      console.error('QR scan pairing failed:', error);
      setIsProcessing(false);
    }
  };

  const handlePairDevice = async () => {
    if (!manualCode.trim()) return;
    
    try {
      setIsProcessing(true);
      const cleanCode = manualCode.replace(/[^A-Z0-9]/g, '').toUpperCase();
      
      if (cleanCode.length !== 15) {
        toast.error("Invalid code format. Please enter a 15-character code.");
        setIsProcessing(false);
        return;
      }
      
      await validatePairingCode(cleanCode);
      setDialogOpen(false);
      
      // Show success animation
      setShowSuccess(true);
      toast.success("Pairing request sent!");
      
      // Wait for animation then navigate
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/parent/dashboard');
      }, 2500);
    } catch (error) {
      console.error('Manual pairing failed:', error);
      setIsProcessing(false);
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
              {/* Real QR Code Scanner */}
              {!isProcessing ? (
                <QRCodeScanner 
                  onScan={handleQRScan}
                  onError={(error) => {
                    console.error("Scanner error:", error);
                    toast.error("Camera access failed. Please use manual entry.");
                  }}
                />
              ) : (
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Processing pairing code...</p>
                  </div>
                </div>
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
                        {isLoading || isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Pairing...
                          </>
                        ) : (
                          "Pair Device"
                        )}
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
      
      {/* Success Animation Overlay */}
      {showSuccess && <PairingSuccessAnimation />}
    </Layout>
  );
}
