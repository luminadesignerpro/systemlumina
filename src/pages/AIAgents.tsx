import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Bot, Plus, MessageSquare, Brain, Sparkles, ToggleLeft, ToggleRight, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface Agent {
  id: string;
  name: string;
  description: string;
  type: "atendimento" | "vendas" | "suporte" | "qualificacao";
  active: boolean;
  conversations: number;
  satisfaction: number;
  resolutionRate: number;
  avgResponseTime: string;
  channels: string[];
}

const mockAgents: Agent[] = [
  { id: "1", name: "Assistente de Vendas", description: "Qualifica leads, apresenta produtos e agenda reuniões automaticamente", type: "vendas", active: true, conversations: 2450, satisfaction: 4.7, resolutionRate: 78, avgResponseTime: "< 3s", channels: ["WhatsApp", "Instagram"] },
  { id: "2", name: "Suporte Técnico", description: "Resolve dúvidas frequentes e escala problemas complexos para humanos", type: "suporte", active: true, conversations: 3820, satisfaction: 4.8, resolutionRate: 85, avgResponseTime: "< 2s", channels: ["WhatsApp", "Messenger"] },
  { id: "3", name: "Qualificador de Leads", description: "Coleta informações e classifica leads por potencial de compra", type: "qualificacao", active: false, conversations: 1200, satisfaction: 4.5, resolutionRate: 92, avgResponseTime: "< 4s", channels: ["Instagram", "Site"] },
  { id: "4", name: "Atendimento Geral", description: "Primeiro ponto de contato, direciona para o setor correto", type: "atendimento", active: true, conversations: 5100, satisfaction: 4.6, resolutionRate: 70, avgResponseTime: "< 1s", channels: ["WhatsApp", "Instagram", "Messenger"] },
];

const typeColors: Record<string, string> = {
  vendas: "hsl(262 83% 58%)",
  suporte: "hsl(199 89% 48%)",
  qualificacao: "hsl(142 70% 45%)",
  atendimento: "hsl(340 82% 52%)",
};

const typeLabels: Record<string, string> = {
  vendas: "Vendas",
  suporte: "Suporte",
  qualificacao: "Qualificação",
  atendimento: "Atendimento",
};

const AIAgents = () => {
  const [activeNav, setActiveNav] = useState("ai-agents");
  const [agents, setAgents] = useState(mockAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const isMobile = useIsMobile();

  const toggleAgent = (id: string) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar activeItem={activeNav} onItemClick={setActiveNav} />
      <div className={`flex flex-1 flex-col overflow-hidden ${isMobile ? "pt-14" : ""}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border bg-card px-4 sm:px-6 py-3 sm:py-4">
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Agentes de IA</h1>
            <p className="text-xs text-muted-foreground">{agents.filter((a) => a.active).length} agentes ativos · {agents.reduce((s, a) => s + a.conversations, 0).toLocaleString()} conversas totais</p>
          </div>
          <Button size="sm" className="gap-1.5 h-8 text-xs w-fit">
            <Plus size={13} />
            Novo Agente
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`cursor-pointer rounded-xl border bg-card p-4 sm:p-5 shadow-card transition-all hover:shadow-elevated ${selectedAgent?.id === agent.id ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl flex-shrink-0" style={{ background: typeColors[agent.type] }}>
                        <Bot size={18} className="text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-semibold text-sm text-foreground truncate">{agent.name}</h3>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{typeLabels[agent.type]}</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleAgent(agent.id); }} className="flex-shrink-0">
                      {agent.active ? <ToggleRight size={24} className="text-primary" /> : <ToggleLeft size={24} className="text-muted-foreground" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{agent.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-border/50 pt-3">
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{agent.conversations.toLocaleString()}</p>
                      <p className="text-[9px] text-muted-foreground">Conversas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">⭐ {agent.satisfaction}</p>
                      <p className="text-[9px] text-muted-foreground">Satisfação</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{agent.resolutionRate}%</p>
                      <p className="text-[9px] text-muted-foreground">Resolução</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{agent.avgResponseTime}</p>
                      <p className="text-[9px] text-muted-foreground">Resposta</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {agent.channels.map((ch) => (
                      <span key={ch} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{ch}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedAgent && !isMobile && (
            <div className="w-96 border-l border-border bg-card p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-foreground">{selectedAgent.name}</h2>
                <button onClick={() => setSelectedAgent(null)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
              </div>
              <p className="text-xs text-muted-foreground mb-6">{selectedAgent.description}</p>
              <h3 className="font-display font-semibold text-xs text-foreground mb-3">Configurações</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2"><Brain size={14} className="text-primary" /><span className="text-xs text-foreground">Personalidade</span></div>
                  <span className="text-xs text-muted-foreground">Profissional e amigável</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2"><Sparkles size={14} className="text-primary" /><span className="text-xs text-foreground">Modelo IA</span></div>
                  <span className="text-xs text-muted-foreground">GPT-5</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2"><MessageSquare size={14} className="text-primary" /><span className="text-xs text-foreground">Escalação humana</span></div>
                  <span className="text-xs text-muted-foreground">Após 3 tentativas</span>
                </div>
              </div>
              <h3 className="font-display font-semibold text-xs text-foreground mb-3">Treinamento</h3>
              <div className="rounded-lg border border-border p-3 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground font-medium">Base de conhecimento</span>
                  <span className="text-[10px] text-primary font-semibold">24 documentos</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-3/4 rounded-full gradient-primary" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Último treino: há 2 horas</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 text-xs h-8 gap-1"><Settings size={12} />Configurar</Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8 gap-1"><BarChart3 size={12} />Métricas</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedAgent && isMobile && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setSelectedAgent(null)}>
          <div className="absolute right-0 top-0 h-full w-[85vw] max-w-sm bg-card p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-foreground">{selectedAgent.name}</h2>
              <button onClick={() => setSelectedAgent(null)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{selectedAgent.description}</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 text-xs h-8 gap-1"><Settings size={12} />Configurar</Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8 gap-1"><BarChart3 size={12} />Métricas</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgents;
