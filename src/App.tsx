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
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
