import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePairing } from "@/hooks/usePairing";
import { useRealtimePairing } from "@/hooks/useRealtimePairing";
import { QRCodeSVG } from "qrcode.react";

const QRDisplay = () => {
  const { toast } = useToast();
  const { generatePairingCode, isLoading } = usePairing();
  const [pairingCode, setPairingCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  // Auto-navigate to permissions when parent validates code
  useRealtimePairing({
    autoNavigateChild: true,
    onPairingUpdate: () => {
      toast({
        title: "Pairing Status Updated",
        description: "Check your dashboard for details",
      });
    }
  });

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

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = Math.floor((expires.getTime() - now.getTime()) / 1000);
      return Math.max(0, diff);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pairingCode.replace(/-/g, ''));
    toast({
      title: "Code Copied",
      description: "Pairing code copied to clipboard",
    });
  };

  const handleRegenerateCode = async () => {
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
                  <p className="text-2xl font-mono font-bold tracking-wider">
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
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Code expires in {formatTime(timeLeft)}</span>
            </div>

            {/* Regenerate Button */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleRegenerateCode}
              disabled={timeLeft > 0 || isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isLoading ? "Generating..." : "Regenerate Code"}
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
