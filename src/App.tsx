import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AnimatePresence, motion } from "framer-motion";

// CRM Pages
import Index from "./pages/Index";
import CRM from "./pages/CRM";
import Analytics from "./pages/Analytics";
import Automation from "./pages/Automation";
import AIAgents from "./pages/AIAgents";
import EmailMarketing from "./pages/EmailMarketing";
import SocialMedia from "./pages/SocialMedia";
import Settings from "./pages/Settings";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// OnTheLine / Social IA Pages
import CriarComIA from "./pages/CriarComIA";
import Agendar from "./pages/Agendar";
import Historico from "./pages/Historico";
import Automacoes from "./pages/Automacoes";
import InstagramConfig from "./pages/InstagramConfig";
import InstagramCallback from "./pages/InstagramCallback";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="h-screen"
      >
        <Routes location={location}>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/instagram/callback" element={<InstagramCallback />} />

          {/* CRM Protected routes */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/automation" element={<ProtectedRoute><Automation /></ProtectedRoute>} />
          <Route path="/ai-agents" element={<ProtectedRoute><AIAgents /></ProtectedRoute>} />
          <Route path="/email-marketing" element={<ProtectedRoute><EmailMarketing /></ProtectedRoute>} />
          <Route path="/social-media" element={<ProtectedRoute><SocialMedia /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Social IA Protected routes */}
          <Route path="/criar" element={<ProtectedRoute><CriarComIA /></ProtectedRoute>} />
          <Route path="/agendar" element={<ProtectedRoute><Agendar /></ProtectedRoute>} />
          <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
          <Route path="/automacoes" element={<ProtectedRoute><Automacoes /></ProtectedRoute>} />
          <Route path="/instagram-config" element={<ProtectedRoute><InstagramConfig /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
