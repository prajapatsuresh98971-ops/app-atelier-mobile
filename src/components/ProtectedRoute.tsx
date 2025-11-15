import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "parent" | "child";
}

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!role) {
    return <Navigate to="/auth/role-selection" replace />;
  }

  if (requireRole && role !== requireRole) {
    return <Navigate to={role === "parent" ? "/parent/dashboard" : "/child/dashboard"} replace />;
  }

  return <>{children}</>;
};
