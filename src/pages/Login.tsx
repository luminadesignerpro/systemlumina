import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-32 right-16 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md px-8 text-center"
        >
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <MessageSquare size={24} className="text-white" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-3">OmniChannel Platform</h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Gerencie todos os seus canais de comunicação, CRM e automações em um só lugar.
          </p>
        </motion.div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <MessageSquare size={20} className="text-primary-foreground" />
              </div>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Bem-vindo de volta</h2>
            <p className="mt-1 text-sm text-muted-foreground">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">E-mail</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-9 h-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium">Senha</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 h-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-10 gap-2" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
