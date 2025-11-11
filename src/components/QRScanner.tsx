import { useState, useEffect } from "react";
import { useZxing } from "react-zxing";
import { Camera } from "lucide-react";

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export const QRCodeScanner = ({ onScan, onError }: QRCodeScannerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const { ref } = useZxing({
    onDecodeResult(result) {
      if (!hasScanned) {
        setHasScanned(true);
        onScan(result.getText());
      }
    },
    onError(err) {
      if (err) {
        const error = err as any;
        if (error.name !== 'NotFoundException') {
          const errorMessage = error.message || "Failed to access camera";
          setError(errorMessage);
          onError?.(errorMessage);
        }
      }
    },
  });

  useEffect(() => {
    // Request camera permission on mount
    const requestCamera = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (err: any) {
        const errorMessage = err.message || "Camera permission denied";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    };
    requestCamera();
  }, [onError]);

  if (error) {
    return (
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center p-4">
          <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Please enable camera permissions to scan QR codes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
      <video
        ref={ref}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      {!error && (
        <>
          {/* Scanning Overlay */}
          <div className="absolute inset-0 border-4 border-primary rounded-lg m-8">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
          </div>
          {/* Scan Line Animation */}
          <div className="absolute inset-x-8 top-8 h-1 bg-primary animate-scan-line" />
        </>
      )}
    </div>
  );
};
