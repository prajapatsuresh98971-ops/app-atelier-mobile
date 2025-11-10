import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { initSentry } from "@/lib/sentry";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Intro1 from "./pages/onboarding/Intro1";
import Intro2 from "./pages/onboarding/Intro2";
import Intro3 from "./pages/onboarding/Intro3";
import Intro4 from "./pages/onboarding/Intro4";
import Intro5 from "./pages/onboarding/Intro5";
import Intro6 from "./pages/onboarding/Intro6";
import Intro7 from "./pages/onboarding/Intro7";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RoleSelection from "./pages/auth/RoleSelection";
import Settings from "./pages/profile/Settings";
import ParentDashboard from "./pages/parent/Dashboard";
import ParentOnboarding from "./pages/parent/Onboarding";
import QRScanner from "./pages/parent/QRScanner";
import LiveMonitoring from "./pages/parent/LiveMonitoring";
import DeviceControls from "./pages/parent/DeviceControls";
import Location from "./pages/parent/Location";
import ChildDashboard from "./pages/child/Dashboard";
import QRDisplay from "./pages/child/QRDisplay";
import Permissions from "./pages/pairing/Permissions";
import Privacy from "./pages/settings/Privacy";
import Devices from "./pages/settings/Devices";
import Geofencing from "./pages/settings/Geofencing";
import Reports from "./pages/settings/Reports";
import About from "./pages/help/About";
import Support from "./pages/help/Support";
import FamilyChat from "./pages/FamilyChat";
import AdminDashboard from "./pages/admin/Dashboard";

// Initialize Sentry
initSentry();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Onboarding Routes */}
          <Route path="/onboarding/intro-1" element={<Intro1 />} />
          <Route path="/onboarding/intro-2" element={<Intro2 />} />
          <Route path="/onboarding/intro-3" element={<Intro3 />} />
          <Route path="/onboarding/intro-4" element={<Intro4 />} />
          <Route path="/onboarding/intro-5" element={<Intro5 />} />
          <Route path="/onboarding/intro-6" element={<Intro6 />} />
          <Route path="/onboarding/intro-7" element={<Intro7 />} />
          
          {/* Authentication Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/role-selection" element={<RoleSelection />} />
          
          {/* Profile Routes */}
          <Route path="/profile/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          {/* Parent Routes */}
          <Route path="/parent/dashboard" element={<ProtectedRoute requireRole="parent"><ParentDashboard /></ProtectedRoute>} />
          <Route path="/parent/onboarding" element={<ProtectedRoute requireRole="parent"><ParentOnboarding /></ProtectedRoute>} />
          <Route path="/parent/qr-scanner" element={<ProtectedRoute requireRole="parent"><QRScanner /></ProtectedRoute>} />
          <Route path="/parent/live-monitoring" element={<ProtectedRoute requireRole="parent"><LiveMonitoring /></ProtectedRoute>} />
          <Route path="/parent/device-controls" element={<ProtectedRoute requireRole="parent"><DeviceControls /></ProtectedRoute>} />
          <Route path="/parent/location" element={<ProtectedRoute requireRole="parent"><Location /></ProtectedRoute>} />
          
          {/* Child Routes */}
          <Route path="/child/dashboard" element={<ProtectedRoute requireRole="child"><ChildDashboard /></ProtectedRoute>} />
          <Route path="/child/qr-display" element={<ProtectedRoute requireRole="child"><QRDisplay /></ProtectedRoute>} />
          
          {/* Pairing Routes */}
          <Route path="/pairing/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
          
          {/* Communication Routes */}
          <Route path="/family-chat" element={<ProtectedRoute><FamilyChat /></ProtectedRoute>} />
          
          {/* Settings Routes */}
          <Route path="/settings/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
          <Route path="/settings/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
          <Route path="/settings/geofencing" element={<ProtectedRoute requireRole="parent"><Geofencing /></ProtectedRoute>} />
          <Route path="/settings/reports" element={<ProtectedRoute requireRole="parent"><Reports /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          
          {/* Help Routes */}
          <Route path="/help/about" element={<About />} />
          <Route path="/help/support" element={<Support />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
