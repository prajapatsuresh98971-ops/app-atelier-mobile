import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera, ScanLine } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onError?: (error: Error) => void;
}

export const QRCodeScanner = ({ onScan, onError }: QRCodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const startScanning = async () => {
      try {
        setError(null);
        
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Initialize QR code reader
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        if (videoRef.current) {
          setIsScanning(true);
          
          try {
            const controls = await reader.decodeFromVideoElement(videoRef.current, (result, error) => {
              if (result) {
                const scannedText = result.getText();
                console.log('QR Code scanned:', scannedText);
                onScan(scannedText);
                
                // Stop scanning after successful scan
                if (controls) {
                  controls.stop();
                }
                setIsScanning(false);
              }
              
              if (error && error.name !== 'NotFoundException') {
                console.error('QR Scan error:', error);
              }
            });
            
            controlsRef.current = controls;
          } catch (err) {
            console.error('Decode error:', err);
          }
        }
      } catch (err) {
        const error = err as Error;
        console.error('Camera access error:', error);
        setError(error.message || "Failed to access camera");
        if (onError) onError(error);
      }
    };

    startScanning();

    // Cleanup
    return () => {
      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
        } catch (e) {
          console.log('Error stopping controls:', e);
        }
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, onError]);

  return (
    <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {/* Scanning Overlay */}
      {isScanning && (
        <>
          <div className="absolute inset-0 border-4 border-primary/50 rounded-lg m-8">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
          </div>
          
          {/* Animated Scan Line */}
          <div className="absolute inset-x-8 top-8 h-1 bg-primary animate-scan-line" />
          
          {/* Scanning Indicator */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/90 px-4 py-2 rounded-full flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-primary-foreground animate-pulse" />
            <span className="text-sm font-medium text-primary-foreground">Scanning...</span>
          </div>
        </>
      )}
      
      {/* No Camera Fallback */}
      {!isScanning && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <Camera className="h-16 w-16 text-muted-foreground animate-pulse" />
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-sm">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};
