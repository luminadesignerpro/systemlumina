import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Link to="/login" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={14} /> Voltar ao login
        </Link>

        <h2 className="font-display text-2xl font-bold text-foreground">Recuperar senha</h2>
        <p className="mt-1 text-sm text-muted-foreground mb-6">
          {sent ? "E-mail enviado! Verifique sua caixa de entrada." : "Informe seu e-mail para receber o link de recuperação."}
        </p>

        {!sent && (
          <form onSubmit={handleReset} className="space-y-4">
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
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
