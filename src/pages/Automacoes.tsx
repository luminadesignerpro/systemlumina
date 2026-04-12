import { useState, useEffect } from "react";
import { Zap, Film, Calendar, Hash, MessageCircle, BarChart3, RefreshCw, Loader2 } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const automationDefs = [
  { id: "reels", icon: Film, iconBg: "bg-primary/15 text-primary", title: "Geração Semanal de Reels", desc: "IA cria roteiro, legenda e hashtags toda semana com Gemini automaticamente.", defaultActive: true },
  { id: "agendamento", icon: Calendar, iconBg: "bg-green-500/15 text-green-500", title: "Agendamento Inteligente", desc: "Publica nos melhores horários baseado no engajamento do seu perfil.", defaultActive: true },
  { id: "hashtags", icon: Hash, iconBg: "bg-blue-500/15 text-blue-400", title: "Hashtags Automáticas", desc: "Hashtags segmentadas e otimizadas para cada tipo de conteúdo.", defaultActive: true },
  { id: "respostas", icon: MessageCircle, iconBg: "bg-accent/15 text-accent", title: "Respostas Automáticas", desc: "Responde comentários frequentes com mensagens personalizadas pela IA.", defaultActive: false },
  { id: "relatorio", icon: BarChart3, iconBg: "bg-yellow-500/15 text-yellow-500", title: "Relatório Semanal", desc: "Resumo de desempenho toda segunda via WhatsApp ou Email.", defaultActive: false },
  { id: "repost", icon: RefreshCw, iconBg: "bg-green-500/15 text-green-500", title: "Repost de Menções", desc: "Reposta automaticamente quando marcam você em conteúdos relevantes.", defaultActive: false },
];

const Automacoes = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [states, setStates] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("automations").select("*").eq("user_id", user.id);
      const initial: Record<string, boolean> = {};
      automationDefs.forEach((a) => { initial[a.id] = a.defaultActive; });
      data?.forEach((row: any) => { initial[row.type] = row.enabled; });
      setStates(initial);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleToggle = async (id: string, value: boolean) => {
    if (!user) return;
    setStates((prev) => ({ ...prev, [id]: value }));
    setSaving(id);
    try {
      const { data: existing } = await supabase.from("automations").select("id").eq("user_id", user.id).eq("type", id).maybeSingle();
      if (existing) {
        await supabase.from("automations").update({ enabled: value, updated_at: new Date().toISOString() }).eq("id", existing.id);
      } else {
        await supabase.from("automations").insert({ user_id: user.id, type: id, enabled: value });
      }
      toast.success(value ? "Automação ativada!" : "Automação desativada");
    } catch {
      toast.error("Erro ao salvar automação");
      setStates((prev) => ({ ...prev, [id]: !value }));
    } finally { setSaving(null); }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className={`flex flex-1 flex-col overflow-hidden ${isMobile ? "pt-14" : ""}`}>
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2"><Zap size={18} className="text-primary" />Automações Social</h1>
            <p className="text-xs text-muted-foreground">{Object.values(states).filter(Boolean).length} automações ativas</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-4 max-w-2xl">
              {automationDefs.map((auto, i) => {
                const Icon = auto.icon;
                const isActive = states[auto.id] ?? auto.defaultActive;
                const isSavingThis = saving === auto.id;
                return (
                  <motion.div
                    key={auto.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`glass-card p-5 flex items-start gap-4 transition-all ${isActive ? "ring-1 ring-primary/30" : ""}`}
                  >
                    <div className={`p-3 rounded-xl ${auto.iconBg} flex-shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-display font-semibold text-sm">{auto.title}</h3>
                        {isSavingThis ? (
                          <Loader2 size={16} className="animate-spin text-primary" />
                        ) : (
                          <Switch checked={isActive} onCheckedChange={(v) => handleToggle(auto.id, v)} />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{auto.desc}</p>
                      <div className="mt-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"}`}>
                          {isActive ? "● Ativa" : "○ Inativa"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Automacoes;
