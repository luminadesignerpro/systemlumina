import { MessageSquare, Zap, Bot, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function EmptyChat() {
  const cards = [
    { icon: Zap, label: "Automação", desc: "Respostas rápidas", color: "bg-whatsapp/10", iconColor: "text-whatsapp" },
    { icon: Bot, label: "Agentes IA", desc: "Atendimento 24/7", color: "bg-primary/10", iconColor: "text-primary" },
    { icon: TrendingUp, label: "Analytics", desc: "Métricas em tempo real", color: "bg-secondary/10", iconColor: "text-secondary" },
    { icon: Sparkles, label: "Smart Reply", desc: "Sugestões com IA", color: "bg-accent/10", iconColor: "text-accent" },
  ];

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center bg-background px-8 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl gradient-primary shadow-elevated"
      >
        <MessageSquare size={40} className="text-primary-foreground" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-2 text-2xl font-display font-bold text-foreground"
      >
        Central de Atendimento
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mb-10 max-w-md text-sm text-muted-foreground leading-relaxed"
      >
        Selecione uma conversa para começar a atender seus clientes via WhatsApp, Instagram e Messenger.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="grid grid-cols-2 gap-3 w-full max-w-sm"
      >
        {cards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card hover:shadow-elevated transition-shadow cursor-pointer border border-border"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
              <card.icon size={18} className={card.iconColor} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-card-foreground">{card.label}</p>
              <p className="text-[10px] text-muted-foreground">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-8 flex items-center gap-2 rounded-full gradient-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-elevated"
      >
        <Sparkles size={14} />
        Agentes IA disponíveis para ajudar
      </motion.div>
    </div>
  );
}
