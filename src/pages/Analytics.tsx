import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TrendingUp, TrendingDown, Users, MessageSquare, DollarSign, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

const revenueData = [
  { month: "Set", value: 32000 }, { month: "Out", value: 45000 }, { month: "Nov", value: 38000 },
  { month: "Dez", value: 52000 }, { month: "Jan", value: 48000 }, { month: "Fev", value: 61000 }, { month: "Mar", value: 58000 },
];

const conversationsData = [
  { day: "Seg", whatsapp: 45, instagram: 22, messenger: 15 },
  { day: "Ter", whatsapp: 52, instagram: 28, messenger: 18 },
  { day: "Qua", whatsapp: 38, instagram: 35, messenger: 12 },
  { day: "Qui", whatsapp: 60, instagram: 30, messenger: 20 },
  { day: "Sex", whatsapp: 55, instagram: 25, messenger: 16 },
  { day: "Sáb", whatsapp: 30, instagram: 40, messenger: 10 },
  { day: "Dom", whatsapp: 20, instagram: 35, messenger: 8 },
];

const funnelData = [
  { name: "Leads", value: 1200, fill: "hsl(262 83% 58%)" },
  { name: "Qualificados", value: 680, fill: "hsl(199 89% 48%)" },
  { name: "Propostas", value: 320, fill: "hsl(142 70% 45%)" },
  { name: "Negociação", value: 180, fill: "hsl(45 93% 47%)" },
  { name: "Fechados", value: 95, fill: "hsl(340 82% 52%)" },
];

const channelPieData = [
  { name: "WhatsApp", value: 45, fill: "hsl(142 70% 45%)" },
  { name: "Instagram", value: 30, fill: "hsl(330 80% 55%)" },
  { name: "Messenger", value: 15, fill: "hsl(221 80% 55%)" },
  { name: "E-mail", value: 7, fill: "hsl(45 93% 47%)" },
  { name: "Site", value: 3, fill: "hsl(262 83% 58%)" },
];

const agentPerformance = [
  { name: "Carlos", atendimentos: 142, conversao: 32, satisfacao: 4.8 },
  { name: "Ana", atendimentos: 128, conversao: 28, satisfacao: 4.9 },
  { name: "Pedro", atendimentos: 98, conversao: 18, satisfacao: 4.5 },
  { name: "Julia", atendimentos: 85, conversao: 22, satisfacao: 4.7 },
];

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}

function KPICard({ title, value, change, icon: Icon, color }: KPICardProps) {
  const isPositive = change >= 0;
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-card">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg" style={{ background: color }}>
          <Icon size={16} className="text-primary-foreground" />
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-500"}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-display font-bold text-foreground">{value}</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{title}</p>
    </div>
  );
}

const Analytics = () => {
  const [activeNav, setActiveNav] = useState("analytics");
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar activeItem={activeNav} onItemClick={setActiveNav} />
      <div className={`flex flex-1 flex-col overflow-hidden ${isMobile ? "pt-14" : ""}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border bg-card px-4 sm:px-6 py-3 sm:py-4">
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Visão geral da sua operação · Últimos 30 dias</p>
          </div>
          <select className="h-8 rounded-lg border border-input bg-background px-3 text-xs text-foreground w-fit">
            <option>Últimos 7 dias</option>
            <option defaultValue="selected">Últimos 30 dias</option>
            <option>Últimos 90 dias</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <KPICard title="Receita Total" value="R$ 61.000" change={17.5} icon={DollarSign} color="hsl(262 83% 58%)" />
            <KPICard title="Novos Leads" value="284" change={12.3} icon={Users} color="hsl(199 89% 48%)" />
            <KPICard title="Conversões" value="95" change={-3.2} icon={Target} color="hsl(142 70% 45%)" />
            <KPICard title="Atendimentos" value="1.847" change={8.7} icon={MessageSquare} color="hsl(340 82% 52%)" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 shadow-card">
              <h3 className="font-display font-semibold text-sm text-foreground mb-4">Receita Mensal</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 89%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]} />
                  <Area type="monotone" dataKey="value" stroke="hsl(262 83% 58%)" fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Channel Distribution */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <h3 className="font-display font-semibold text-sm text-foreground mb-4">Canais de Origem</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={channelPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {channelPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {channelPieData.map((c) => (
                  <div key={c.name} className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full" style={{ background: c.fill }} />
                    <span className="text-[10px] text-muted-foreground">{c.name} {c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Conversations per channel */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <h3 className="font-display font-semibold text-sm text-foreground mb-4">Atendimentos por Canal</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={conversationsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 89%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} />
                  <Tooltip />
                  <Bar dataKey="whatsapp" fill="hsl(142 70% 45%)" radius={[3, 3, 0, 0]} name="WhatsApp" />
                  <Bar dataKey="instagram" fill="hsl(330 80% 55%)" radius={[3, 3, 0, 0]} name="Instagram" />
                  <Bar dataKey="messenger" fill="hsl(221 80% 55%)" radius={[3, 3, 0, 0]} name="Messenger" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Funnel */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <h3 className="font-display font-semibold text-sm text-foreground mb-4">Funil de Vendas</h3>
              <div className="space-y-3">
                {funnelData.map((stage) => {
                  const pct = (stage.value / funnelData[0].value) * 100;
                  return (
                    <div key={stage.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground font-medium">{stage.name}</span>
                        <span className="text-muted-foreground">{stage.value} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-6 w-full rounded-md bg-muted overflow-hidden">
                        <div className="h-full rounded-md transition-all" style={{ width: `${pct}%`, background: stage.fill }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Agent performance */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-card overflow-x-auto">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Performance dos Agentes</h3>
            <table className="w-full text-xs min-w-[400px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">Agente</th>
                  <th className="text-center py-2 font-medium">Atendimentos</th>
                  <th className="text-center py-2 font-medium">Conversões</th>
                  <th className="text-center py-2 font-medium">Satisfação</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.map((a) => (
                  <tr key={a.name} className="border-b border-border/50">
                    <td className="py-2.5 font-medium text-foreground">{a.name}</td>
                    <td className="text-center text-foreground">{a.atendimentos}</td>
                    <td className="text-center text-foreground">{a.conversao}</td>
                    <td className="text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-foreground font-semibold">
                        ⭐ {a.satisfacao}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
