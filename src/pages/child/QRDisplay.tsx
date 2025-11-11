import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePairing } from "@/hooks/usePairing";
import { useRealtimePairing } from "@/hooks/useRealtimePairing";
import { QRCodeSVG } from "qrcode.react";
import { PairingTimer } from "@/components/PairingTimer";

const QRDisplay = () => {
  const { toast } = useToast();
  const { generatePairingCode, isLoading } = usePairing();
  const [pairingCode, setPairingCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useRealtimePairing();

  useEffect(() => {
    const loadPairingCode = async () => {
      try {
        const data = await generatePairingCode();
        // Format the code with dashes
        const formattedCode = data.pairing_code.match(/.{1,3}/g)?.join('-') || data.pairing_code;
        setPairingCode(formattedCode);
        setExpiresAt(data.expires_at);
      } catch (error) {
        console.error('Failed to generate pairing code:', error);
      }
    };

    loadPairingCode();
  }, []);

  const handleExpire = () => {
    toast({
      title: "Code expired",
      description: "Your pairing code has expired. Generating a new one...",
      variant: "destructive",
    });
    handleRegenerateCode();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pairingCode.replace(/-/g, ''));
    toast({
      title: "Code Copied",
      description: "Pairing code copied to clipboard",
    });
  };

  const handleRegenerateCode = async () => {
    setIsGenerating(true);
    try {
      const data = await generatePairingCode();
      const formattedCode = data.pairing_code.match(/.{1,3}/g)?.join('-') || data.pairing_code;
      setPairingCode(formattedCode);
      setExpiresAt(data.expires_at);
      
      toast({
        title: "Code Regenerated",
        description: "New pairing code has been generated",
      });
    } catch (error) {
      console.error('Failed to regenerate code:', error);
      toast({
        title: "Error",
        description: "Failed to generate new code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout title="Device Pairing" showHeader={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect with Parent</CardTitle>
            <CardDescription>
              Share this code with your parent to pair devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code Display */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                {pairingCode ? (
                  <QRCodeSVG
                    value={pairingCode.replace(/-/g, '')}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                ) : (
                  <div className="w-64 h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Generating QR Code...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pairing Code */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Or enter this 15-character code manually:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-2xl font-mono font-bold tracking-wider" data-testid="pairing-code">
                    {pairingCode}
                  </p>
                </div>
              </div>

              {/* Copy Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyCode}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </div>

            {/* Timer */}
            {expiresAt && (
              <PairingTimer expiresAt={expiresAt} onExpire={handleExpire} />
            )}

            {/* Regenerate Button */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleRegenerateCode}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? "Generating..." : "Regenerate Code"}
            </Button>

            {/* Instructions */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Ask your parent to open Mobiprotect</li>
                <li>They should navigate to "Pair Device"</li>
                <li>Scan this QR code or enter the code manually</li>
                <li>Accept the pairing request when it appears</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default QRDisplay;
