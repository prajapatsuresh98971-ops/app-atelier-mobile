import { Home, Eye, Shield, MapPin, MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Dashboard", path: "/parent/dashboard" },
  { icon: Eye, label: "Monitor", path: "/parent/live-monitoring" },
  { icon: MessageCircle, label: "Chat", path: "/family-chat", glow: true },
  { icon: Shield, label: "Controls", path: "/parent/device-controls" },
  { icon: MapPin, label: "Location", path: "/parent/location" },
];

export const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-lg glass-card">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ icon: Icon, label, path, glow }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all",
                isActive 
                  ? glow ? "text-primary glow-primary" : "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
