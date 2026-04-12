import { motion } from "framer-motion";
import {
  MessageSquare, Users, Zap, TrendingUp, ArrowUpRight, ArrowDownRight,
  Inbox, Clock, CheckCircle2, Bot, Sparkles, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const hourlyData = [
  { h: "08h", msgs: 12 }, { h: "09h", msgs: 28 }, { h: "10h", msgs: 45 },
  { h: "11h", msgs: 52 }, { h: "12h", msgs: 38 }, { h: "13h", msgs: 30 },
  { h: "14h", msgs: 55 }, { h: "15h", msgs: 62 }, { h: "16h", msgs: 48 },
  { h: "17h", msgs: 35 }, { h: "18h", msgs: 20 },
];

const weeklyData = [
  { day: "Seg", wa: 45, ig: 22, msg: 15 },
  { day: "Ter", wa: 52, ig: 28, msg: 18 },
  { day: "Qua", wa: 38, ig: 35, msg: 12 },
  { day: "Qui", wa: 60, ig: 30, msg: 20 },
  { day: "Sex", wa: 55, ig: 25, msg: 16 },
  { day: "Sáb", wa: 30, ig: 40, msg: 10 },
  { day: "Dom", wa: 20, ig: 35, msg: 8 },
];

const channelPie = [
  { name: "WhatsApp", value: 48, fill: "hsl(142 70% 45%)" },
  { name: "Instagram", value: 32, fill: "hsl(330 80% 55%)" },
  { name: "Messenger", value: 20, fill: "hsl(221 80% 55%)" },
];

const recentActivity = [
  { name: "Maria Silva", action: "Nova mensagem", channel: "whatsapp", time: "2 min" },
  { name: "João Santos", action: "Lead qualificado", channel: "instagram", time: "8 min" },
  { name: "Ana Costa", action: "Conversa encerrada", channel: "messenger", time: "15 min" },
  { name: "Pedro Oliveira", action: "Aguardando resposta", channel: "whatsapp", time: "22 min" },
];

interface KPIProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  gradient: string;
}

function KPICard({ title, value, change, icon: Icon, gradient }: KPIProps) {
  const positive = change >= 0;
  return (
    <motion.div variants={item} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all duration-300 cursor-default">
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-2xl ${gradient}`} />
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${gradient}`}>
          <Icon size={20} className="text-primary-foreground" />
        </div>
        <div className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${positive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-display font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{title}</p>
    </motion.div>
  );
}

const channelIcon = (ch: string) => {
  if (ch === "whatsapp") return "💬";
  if (ch === "instagram") return "📸";
  return "💭";
};

interface Props {
  onGoToInbox: () => void;
}

export function DashboardOverview({ onGoToInbox }: Props) {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Operador";

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-display font-bold text-foreground"
            >
              Olá, {firstName} 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xs text-muted-foreground mt-0.5"
            >
              Resumo da operação · Hoje
            </motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={onGoToInbox}
            className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elevated hover:opacity-90 transition-opacity"
          >
            <Inbox size={16} />
            Ir para Inbox
            <ChevronRight size={14} />
          </motion.button>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="p-6 space-y-6"
      >
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Atendimentos Hoje" value="127" change={12.5} icon={MessageSquare} gradient="gradient-primary" />
          <KPICard title="Tempo Médio Resposta" value="2m 34s" change={-8.2} icon={Clock} gradient="bg-secondary" />
          <KPICard title="Taxa de Resolução" value="94.2%" change={3.1} icon={CheckCircle2} gradient="bg-whatsapp" />
          <KPICard title="Leads Novos" value="18" change={22.0} icon={Users} gradient="bg-accent" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hourly traffic */}
          <motion.div variants={item} className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-sm text-foreground">Fluxo de Mensagens</h3>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">Hoje</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="h" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(v: number) => [`${v} mensagens`, ""]}
                />
                <Area type="monotone" dataKey="msgs" stroke="hsl(262 83% 58%)" fill="url(#msgGrad)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Channel distribution */}
          <motion.div variants={item} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Canais</h3>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={channelPie} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={4} strokeWidth={0}>
                  {channelPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(v: number) => [`${v}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-2">
              {channelPie.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: c.fill }} />
                    <span className="text-xs text-foreground font-medium">{c.name}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">{c.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Weekly bar chart */}
          <motion.div variants={item} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Atendimentos da Semana</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="wa" fill="hsl(142 70% 45%)" radius={[4, 4, 0, 0]} name="WhatsApp" />
                <Bar dataKey="ig" fill="hsl(330 80% 55%)" radius={[4, 4, 0, 0]} name="Instagram" />
                <Bar dataKey="msg" fill="hsl(221 80% 55%)" radius={[4, 4, 0, 0]} name="Messenger" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={item} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-sm text-foreground">Atividade Recente</h3>
              <Sparkles size={14} className="text-primary" />
            </div>
            <div className="space-y-1">
              {recentActivity.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted/50 transition-colors group cursor-default"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground flex-shrink-0">
                    {a.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>{channelIcon(a.channel)}</span>
                      {a.action}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{a.time}</span>
                </motion.div>
              ))}
            </div>
            <button
              onClick={onGoToInbox}
              className="mt-3 w-full rounded-xl border border-border py-2.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
            >
              Ver todas as conversas
              <ChevronRight size={12} />
            </button>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Inbox, label: "Inbox", desc: "4 não lidas", gradient: "gradient-primary", action: onGoToInbox },
            { icon: Bot, label: "Agentes IA", desc: "3 ativos", gradient: "bg-secondary", action: () => {} },
            { icon: Zap, label: "Automações", desc: "12 regras", gradient: "bg-whatsapp", action: () => {} },
            { icon: TrendingUp, label: "Analytics", desc: "Ver relatórios", gradient: "bg-accent", action: () => {} },
          ].map((q, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={q.action}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card hover:shadow-elevated transition-all text-left"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${q.gradient} flex-shrink-0`}>
                <q.icon size={18} className="text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{q.label}</p>
                <p className="text-[10px] text-muted-foreground">{q.desc}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
