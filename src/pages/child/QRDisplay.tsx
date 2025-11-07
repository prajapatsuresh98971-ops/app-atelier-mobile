import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QRDisplay = () => {
  const { toast } = useToast();
  const [pairingCode, setPairingCode] = useState("123-456-789-012-345");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const handleRegenerateCode = () => {
    // Generate new random code
    const newCode = Array.from({ length: 15 }, () => 
      Math.floor(Math.random() * 10)
    ).join('').match(/.{1,3}/g)?.join('-') || '';
    
    setPairingCode(newCode);
    setTimeLeft(300);
    
    toast({
      title: "Code Regenerated",
      description: "New pairing code has been generated",
    });
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
            {/* QR Code Placeholder */}
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-card border-2 border-border rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-48 h-48 mx-auto bg-muted/50 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">QR Code</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pairing Code */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Or enter this 15-digit code manually:
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
              disabled={timeLeft > 0}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Code
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
