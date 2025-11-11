import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { Camera } from "lucide-react";

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export const QRCodeScanner = ({ onScan, onError }: QRCodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const initScanner = async () => {
      try {
        setIsScanning(true);
        const codeReader = new BrowserQRCodeReader();

        const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
          throw new Error("No camera found on this device");
        }

        // Use the first available camera (usually back camera on mobile)
        const selectedDeviceId = videoInputDevices[0].deviceId;

        const controls = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const scannedText = result.getText();
              onScan(scannedText);
              // Stop scanning after successful scan
              if (controlsRef.current) {
                controlsRef.current.stop();
              }
              setIsScanning(false);
            }
            if (error && error.name !== 'NotFoundException') {
              console.error('QR Scanner error:', error);
            }
          }
        );
        
        controlsRef.current = controls;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to access camera";
        setError(errorMessage);
        onError?.(errorMessage);
        setIsScanning(false);
      }
    };

    initScanner();

    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, [onScan, onError]);

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
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
      />
      {isScanning && (
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
