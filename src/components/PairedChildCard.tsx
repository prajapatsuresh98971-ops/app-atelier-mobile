import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lock, Unlock, MapPin, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PermissionStatusIndicator } from "./PermissionStatusIndicator";

interface PairedChildCardProps {
  child: {
    id: string;
    name: string;
    email: string;
    is_online: boolean;
    last_seen: string;
    permissions?: {
      camera?: boolean;
      location?: boolean;
      microphone?: boolean;
      screen_recording?: boolean;
      notifications?: boolean;
    } | null;
  };
  onViewLocation: () => void;
  onViewActivity: () => void;
  onLockDevice: () => void;
  onUnlockDevice: () => void;
}

export const PairedChildCard = ({
  child,
  onViewLocation,
  onViewActivity,
  onLockDevice,
  onUnlockDevice,
}: PairedChildCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{getInitials(child.name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{child.name}</h3>
                <p className="text-sm text-muted-foreground">{child.email}</p>
              </div>
              
              <Badge variant={child.is_online ? "default" : "secondary"}>
                {child.is_online ? "Online" : "Offline"}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              Last seen {formatDistanceToNow(new Date(child.last_seen), { addSuffix: true })}
            </p>

            {/* Permission Status */}
            {child.permissions && (
              <div className="pt-1">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Permissions</p>
                <PermissionStatusIndicator permissions={child.permissions} compact />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onViewLocation}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Location
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={onViewActivity}
              >
                <Eye className="h-4 w-4 mr-1" />
                Activity
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={onLockDevice}
              >
                <Lock className="h-4 w-4 mr-1" />
                Lock
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={onUnlockDevice}
              >
                <Unlock className="h-4 w-4 mr-1" />
                Unlock
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
