import { ReactNode, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, Settings, LogOut, Info, Shield, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificationCenter } from "@/components/NotificationCenter";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export const Layout = ({ children, title = "Mobiprotect", showHeader = true }: LayoutProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [userName, setUserName] = useState<string>("User");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('profiles')
          .select('name, profile_picture_url')
          .eq('id', user.id)
          .single();

        if (data) {
          setUserName(data.name || 'User');
          setProfilePicture(data.profile_picture_url || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate('/auth/login');
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showHeader && (
        <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
          <div className="container flex h-16 items-center justify-between px-4">
            <Avatar 
              className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all" 
              onClick={() => navigate("/profile/settings")}
            >
              <AvatarImage src={profilePicture} alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none hover:bg-accent rounded-md p-1 transition-colors">
                <Menu className="h-6 w-6 text-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/profile/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings/privacy")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Privacy Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/help/about")}>
                  <Info className="mr-2 h-4 w-4" />
                  About
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/help/support")}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
