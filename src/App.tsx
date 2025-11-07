import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import QRScanner from "./pages/parent/QRScanner";
import LiveMonitoring from "./pages/parent/LiveMonitoring";
import DeviceControls from "./pages/parent/DeviceControls";
import Location from "./pages/parent/Location";
import ChildDashboard from "./pages/child/Dashboard";
import QRDisplay from "./pages/child/QRDisplay";
import Permissions from "./pages/pairing/Permissions";
import Privacy from "./pages/settings/Privacy";
import Devices from "./pages/settings/Devices";
import About from "./pages/help/About";
import Support from "./pages/help/Support";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/profile/settings" element={<Settings />} />
          
          {/* Parent Routes */}
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/qr-scanner" element={<QRScanner />} />
          <Route path="/parent/live-monitoring" element={<LiveMonitoring />} />
          <Route path="/parent/device-controls" element={<DeviceControls />} />
          <Route path="/parent/location" element={<Location />} />
          
          {/* Child Routes */}
          <Route path="/child/dashboard" element={<ChildDashboard />} />
          <Route path="/child/qr-display" element={<QRDisplay />} />
          
          {/* Pairing Routes */}
          <Route path="/pairing/permissions" element={<Permissions />} />
          
          {/* Settings Routes */}
          <Route path="/settings/privacy" element={<Privacy />} />
          <Route path="/settings/devices" element={<Devices />} />
          
          {/* Help Routes */}
          <Route path="/help/about" element={<About />} />
          <Route path="/help/support" element={<Support />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
