import { Camera, MapPin, Mic, Monitor, Bell, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PermissionStatusIndicatorProps {
  permissions: {
    camera?: boolean;
    location?: boolean;
    microphone?: boolean;
    screen_recording?: boolean;
    notifications?: boolean;
  } | null;
  compact?: boolean;
}

export const PermissionStatusIndicator = ({ permissions, compact = false }: PermissionStatusIndicatorProps) => {
  const permissionItems = [
    { key: 'camera', name: 'Camera', icon: Camera },
    { key: 'location', name: 'Location', icon: MapPin },
    { key: 'microphone', name: 'Microphone', icon: Mic },
    { key: 'screen_recording', name: 'Screen', icon: Monitor },
    { key: 'notifications', name: 'Notifications', icon: Bell },
  ];

  if (compact) {
    return (
      <div className="flex gap-1">
        {permissionItems.map(({ key, name, icon: Icon }) => {
          const status = permissions?.[key as keyof typeof permissions];
          return (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger>
                  <div className={`p-1.5 rounded-md ${
                    status === true ? 'bg-green-500/10 text-green-500' :
                    status === false ? 'bg-red-500/10 text-red-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}: {status === true ? 'Granted' : status === false ? 'Denied' : 'Not Set'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {permissionItems.map(({ key, name, icon: Icon }) => {
        const status = permissions?.[key as keyof typeof permissions];
        return (
          <div key={key} className="flex items-center justify-between p-2 rounded-lg border bg-card">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{name}</span>
            </div>
            {status === true ? (
              <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Granted
              </Badge>
            ) : status === false ? (
              <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                <XCircle className="h-3 w-3 mr-1" />
                Denied
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                <MinusCircle className="h-3 w-3 mr-1" />
                Not Set
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
};
