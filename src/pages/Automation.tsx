import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Zap, Plus, MessageSquare, Clock, Users, Filter, GitBranch, Mail, Bot, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface AutomationFlow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  channel: string;
  active: boolean;
  executions: number;
  successRate: number;
  lastRun: string;
  steps: number;
}

const mockFlows: AutomationFlow[] = [
  { id: "1", name: "Boas-vindas WhatsApp", description: "Envia mensagem de boas-vindas para novos contatos via WhatsApp", trigger: "Novo contato", channel: "WhatsApp", active: true, executions: 1284, successRate: 98.5, lastRun: "Há 5 min", steps: 4 },
  { id: "2", name: "Follow-up Proposta", description: "Envia follow-up automático 3 dias após envio de proposta", trigger: "Mudança de etapa", channel: "E-mail", active: true, executions: 342, successRate: 95.2, lastRun: "Há 2h", steps: 6 },
  { id: "3", name: "Qualificação de Lead", description: "Chatbot de qualificação com perguntas automáticas", trigger: "Novo lead", channel: "Instagram", active: false, executions: 856, successRate: 87.3, lastRun: "Há 1 dia", steps: 8 },
  { id: "4", name: "Recuperação de Carrinho", description: "Sequência de mensagens para carrinhos abandonados", trigger: "Carrinho abandonado", channel: "WhatsApp", active: true, executions: 2156, successRate: 92.1, lastRun: "Há 15 min", steps: 5 },
  { id: "5", name: "Pesquisa de Satisfação", description: "Envia NPS após fechamento de atendimento", trigger: "Atendimento fechado", channel: "WhatsApp", active: true, executions: 967, successRate: 96.8, lastRun: "Há 30 min", steps: 3 },
  { id: "6", name: "Nutrição de Leads", description: "Sequência de conteúdos educativos por e-mail", trigger: "Tag adicionada", channel: "E-mail", active: false, executions: 445, successRate: 88.9, lastRun: "Há 3 dias", steps: 10 },
];

const triggerIcons: Record<string, React.ElementType> = {
  "Novo contato": Users,
  "Mudança de etapa": GitBranch,
  "Novo lead": Users,
  "Carrinho abandonado": Clock,
  "Atendimento fechado": MessageSquare,
  "Tag adicionada": Filter,
};

const Automation = () => {
  const [activeNav, setActiveNav] = useState("automation");
  const [flows, setFlows] = useState(mockFlows);
  const [selectedFlow, setSelectedFlow] = useState<AutomationFlow | null>(null);
  const isMobile = useIsMobile();

  const toggleFlow = (id: string) => {
    setFlows((prev) => prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)));
  };

  const activeFlows = flows.filter((f) => f.active).length;
  const totalExec = flows.reduce((s, f) => s + f.executions, 0);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar activeItem={activeNav} onItemClick={setActiveNav} />
      <div className={`flex flex-1 flex-col overflow-hidden ${isMobile ? "pt-14" : ""}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border bg-card px-4 sm:px-6 py-3 sm:py-4">
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Automações</h1>
            <p className="text-xs text-muted-foreground">{activeFlows} ativas · {totalExec.toLocaleString()} execuções totais</p>
          </div>
          <Button size="sm" className="gap-1.5 h-8 text-xs w-fit">
            <Plus size={13} />
            Nova Automação
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid gap-3">
              {flows.map((flow) => {
                const TriggerIcon = triggerIcons[flow.trigger] || Zap;
                return (
                  <div
                    key={flow.id}
                    onClick={() => setSelectedFlow(flow)}
                    className={`group cursor-pointer rounded-xl border bg-card p-3 sm:p-4 shadow-card transition-all hover:shadow-elevated ${selectedFlow?.id === flow.id ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary flex-shrink-0">
                          <Zap size={18} className="text-primary-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-semibold text-sm text-foreground">{flow.name}</h3>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${flow.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                              {flow.active ? "Ativa" : "Inativa"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{flow.description}</p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <TriggerIcon size={11} /> {flow.trigger}
                            </span>
                            <span className="text-[10px] text-muted-foreground hidden sm:inline">·</span>
                            <span className="text-[10px] text-muted-foreground">{flow.channel}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFlow(flow.id); }}
                        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                      >
                        {flow.active ? <ToggleRight size={24} className="text-primary" /> : <ToggleLeft size={24} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{flow.executions.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Execuções</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{flow.successRate}%</p>
                        <p className="text-[10px] text-muted-foreground">Sucesso</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-muted-foreground">{flow.lastRun}</p>
                        <p className="text-[10px] text-muted-foreground">Última exec.</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flow detail - overlay on mobile */}
          {selectedFlow && !isMobile && (
            <div className="w-96 border-l border-border bg-card p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-foreground">{selectedFlow.name}</h2>
                <button onClick={() => setSelectedFlow(null)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
              </div>
              <p className="text-xs text-muted-foreground mb-6">{selectedFlow.description}</p>
              <h3 className="font-display font-semibold text-xs text-foreground mb-3">Fluxo Visual</h3>
              <div className="space-y-0">
                {[
                  { icon: Zap, label: "Gatilho", desc: selectedFlow.trigger, color: "hsl(262 83% 58%)" },
                  { icon: Filter, label: "Condição", desc: "Verificar canal de origem", color: "hsl(199 89% 48%)" },
                  { icon: Clock, label: "Esperar", desc: "Aguardar 5 minutos", color: "hsl(45 93% 47%)" },
                  { icon: MessageSquare, label: "Mensagem", desc: "Enviar boas-vindas", color: "hsl(142 70% 45%)" },
                  ...(selectedFlow.steps > 4 ? [{ icon: Bot, label: "IA", desc: "Classificar intenção", color: "hsl(340 82% 52%)" }] : []),
                  ...(selectedFlow.steps > 5 ? [{ icon: Mail, label: "E-mail", desc: "Enviar follow-up", color: "hsl(262 83% 58%)" }] : []),
                ].map((step, i, arr) => (
                  <div key={i}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: step.color }}>
                        <step.icon size={14} className="text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{step.label}</p>
                        <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                    {i < arr.length - 1 && <div className="ml-4 h-6 w-px bg-border" />}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button size="sm" className="flex-1 text-xs h-8">Editar Fluxo</Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8">Duplicar</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {selectedFlow && isMobile && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setSelectedFlow(null)}>
          <div className="absolute right-0 top-0 h-full w-[85vw] max-w-sm bg-card p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-foreground">{selectedFlow.name}</h2>
              <button onClick={() => setSelectedFlow(null)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{selectedFlow.description}</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 text-xs h-8">Editar Fluxo</Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8">Duplicar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automation;
