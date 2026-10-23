import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ParticlesBackground } from "@/components/ui/ParticlesBackground";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BackgroundMusicProvider } from "@/contexts/BackgroundMusicContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { useKeyboardAvoidance } from "@/hooks/useKeyboardAvoidance";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => {
  useKeyboardAvoidance();

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <BackgroundMusicProvider>
          <TooltipProvider>
            <div className="min-h-screen">
              <ParticlesBackground />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/join/:roomCode" element={<Index />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </BackgroundMusicProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
};

export default App;
