import { Conversation } from "@/lib/mockData";
import { ChannelBadge } from "./ChannelBadge";
import { User, Tag, Clock, MessageSquare, X, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ContactPanelProps {
  conversation: Conversation;
  onClose: () => void;
}

export function ContactPanel({ conversation, onClose }: ContactPanelProps) {
  const { contact } = conversation;

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex h-full w-72 flex-col border-l border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-display font-bold text-card-foreground">Detalhes do Contato</h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X size={15} />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Avatar & name */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col items-center text-center"
        >
          <div className="flex h-18 w-18 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-primary-foreground mb-3 shadow-elevated h-[72px] w-[72px]">
            {contact.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <h4 className="font-display font-bold text-card-foreground text-lg">{contact.name}</h4>
          <div className="mt-1">
            <ChannelBadge channel={contact.channel} size="md" />
          </div>
        </motion.div>

        {/* Info cards */}
        <div className="space-y-3">
          {[
            {
              icon: User,
              title: "Informações",
              content: (
                <>
                  {contact.phone && <p className="text-sm text-card-foreground font-medium">{contact.phone}</p>}
                  <p className="text-xs text-muted-foreground mt-1">Canal: {contact.channel}</p>
                </>
              ),
            },
            {
              icon: Clock,
              title: "Status",
              content: (
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  conversation.status === "open" ? "bg-whatsapp/10 text-whatsapp" :
                  conversation.status === "pending" ? "bg-secondary/10 text-secondary" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {conversation.status === "open" ? "🟢 Aberta" : conversation.status === "pending" ? "🟡 Pendente" : "✅ Resolvida"}
                </span>
              ),
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="rounded-xl bg-muted/40 border border-border/50 p-3.5"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <card.icon size={12} />
                <span className="font-medium">{card.title}</span>
              </div>
              {card.content}
            </motion.div>
          ))}

          {conversation.tags && conversation.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="rounded-xl bg-muted/40 border border-border/50 p-3.5"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2.5">
                <Tag size={12} />
                <span className="font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {conversation.tags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="rounded-xl bg-muted/40 border border-border/50 p-3.5"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2.5">
              <MessageSquare size={12} />
              <span className="font-medium">Ações Rápidas</span>
            </div>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl gradient-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                Atribuir Agente IA
                <ExternalLink size={11} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-xs font-semibold text-accent hover:bg-accent/10 transition-colors"
              >
                Encerrar Conversa
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
