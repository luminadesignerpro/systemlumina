import { useState } from "react";
import { Rocket, CheckCircle2, Instagram, Link2, Shield, Loader2, LogOut } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const InstagramConfig = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const { data: igConnection } = useQuery({
    queryKey: ["instagram_connection", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("instagram_connections").select("*").eq("is_active", true).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const handleConnectInstagram = async () => {
    setConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/instagram/callback`;
      const { data, error } = await supabase.functions.invoke("instagram-auth", {
        body: { action: "get_auth_url", redirect_uri: redirectUri },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      window.location.href = data.authUrl;
    } catch (err: any) {
      toast.error(err.message || "Erro ao iniciar conexão com Instagram");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const { error } = await supabase.from("instagram_connections").update({ is_active: false }).eq("user_id", user!.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["instagram_connection"] });
      toast.success("Instagram desconectado");
    } catch (err: any) {
      toast.error(err.message || "Erro ao desconectar");
    } finally { setDisconnecting(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className={`flex flex-1 flex-col overflow-hidden ${isMobile ? "pt-14" : ""}`}>
        <div className="border-b border-border bg-card px-6 py-4">
          <h1 className="font-display text-lg font-bold flex items-center gap-2"><Instagram size={18} className="text-primary" />Configurar Instagram</h1>
          <p className="text-xs text-muted-foreground">Conecte sua conta para publicar e agendar posts</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-lg space-y-5">
            {igConnection ? (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Instagram size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">@{igConnection.instagram_username || "conta conectada"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" />Conectado com sucesso</p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDisconnect} disabled={disconnecting} className="gap-2">
                  {disconnecting ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />} Desconectar
                </Button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Instagram size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold">Conectar Instagram</h3>
                    <p className="text-xs text-muted-foreground">Autorize o acesso à sua conta Business</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: Link2, text: "Publicação e agendamento automático" },
                    { icon: Shield, text: "Conexão segura via OAuth oficial do Meta" },
                    { icon: Rocket, text: "Análise de desempenho e métricas" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Icon size={14} className="text-primary flex-shrink-0" />{text}
                    </div>
                  ))}
                </div>

                <Button onClick={handleConnectInstagram} disabled={connecting} className="w-full gradient-button border-0 py-5 font-bold">
                  {connecting ? <><Loader2 size={16} className="mr-2 animate-spin" />Conectando...</> : <><Instagram size={16} className="mr-2" />Conectar com Instagram</>}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">Você precisa de uma conta Instagram Business ou Creator</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramConfig;
