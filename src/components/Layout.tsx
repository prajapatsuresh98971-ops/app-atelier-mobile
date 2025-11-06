import { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export const Layout = ({ children, title = "Mobiprotect", showHeader = true }: LayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showHeader && (
        <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
          <div className="container flex h-16 items-center justify-between px-4">
            <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate("/profile/settings")}>
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
            </Avatar>
            
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Menu className="h-6 w-6 text-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover">
                <DropdownMenuItem onClick={() => navigate("/help/about")}>
                  About
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings/privacy")}>
                  Privacy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/help/support")}>
                  Help
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/auth/login")}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )}
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
