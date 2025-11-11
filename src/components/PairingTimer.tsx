import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PairingTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export const PairingTimer = ({ expiresAt, onExpire }: PairingTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
        onExpire?.();
        return;
      }

      setTimeLeft(Math.floor(diff / 1000));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isExpired) {
    return (
      <Alert variant="destructive">
        <Clock className="h-4 w-4" />
        <AlertDescription>
          This pairing code has expired. Please generate a new one.
        </AlertDescription>
      </Alert>
    );
  }

  const percentage = (timeLeft / (15 * 60)) * 100;
  const isUrgent = timeLeft < 120; // Less than 2 minutes

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Time remaining:</span>
        <span className={`font-mono font-bold ${isUrgent ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isUrgent ? 'bg-destructive' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
