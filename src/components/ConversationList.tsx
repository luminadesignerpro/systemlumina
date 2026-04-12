import { Conversation, Channel } from "@/lib/mockData";
import { ChannelBadge } from "./ChannelBadge";
import { Search, Inbox, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

type StatusFilter = "all" | "open" | "pending" | "resolved";
type ChannelFilter = "all" | Channel;

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");

  const filtered = conversations.filter((c) => {
    const matchSearch = c.contact.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchChannel = channelFilter === "all" || c.contact.channel === channelFilter;
    return matchSearch && matchStatus && matchChannel;
  });

  const statusTabs: { key: StatusFilter; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "Todas", icon: <Inbox size={13} /> },
    { key: "open", label: "Abertas", icon: <Inbox size={13} /> },
    { key: "pending", label: "Pendentes", icon: <Clock size={13} /> },
    { key: "resolved", label: "Resolvidas", icon: <CheckCircle2 size={13} /> },
  ];

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-bold text-card-foreground">Conversas</h2>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full gradient-primary px-1.5 text-[10px] font-bold text-primary-foreground">
            {conversations.filter(c => c.unreadCount > 0).length}
          </span>
        </div>
        <div className="relative group">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-border px-3 py-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`relative flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
              statusFilter === tab.key
                ? "gradient-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Channel filter */}
      <div className="flex gap-1.5 border-b border-border px-3 py-2">
        {(["all", "whatsapp", "instagram", "messenger"] as ChannelFilter[]).map((ch) => (
          <button
            key={ch}
            onClick={() => setChannelFilter(ch)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200 ${
              channelFilter === ch
                ? "bg-foreground text-background shadow-sm scale-105"
                : "bg-muted text-muted-foreground hover:bg-border"
            }`}
          >
            {ch === "all" ? "Todos" : ch === "whatsapp" ? "💬 WA" : ch === "instagram" ? "📸 IG" : "💭 MSG"}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filtered.map((conv, i) => (
            <motion.button
              key={conv.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              onClick={() => onSelect(conv.id)}
              className={`w-full border-b border-border px-4 py-3.5 text-left transition-all duration-200 ${
                selectedId === conv.id
                  ? "bg-primary/8 border-l-[3px] border-l-primary"
                  : "hover:bg-muted/40 border-l-[3px] border-l-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-primary-foreground transition-transform duration-200 ${
                      selectedId === conv.id ? "gradient-primary shadow-elevated scale-105" : "gradient-primary"
                    }`}>
                      {conv.contact.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    {conv.unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow-sm"
                      >
                        {conv.unreadCount}
                      </motion.span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold truncate ${conv.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                        {conv.contact.name}
                      </span>
                      <ChannelBadge channel={conv.contact.channel} />
                    </div>
                    <p className={`mt-0.5 truncate text-xs leading-relaxed ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
                <span className="flex-shrink-0 text-[10px] text-muted-foreground mt-0.5">{conv.lastMessageTime}</span>
              </div>
              {conv.tags && conv.tags.length > 0 && (
                <div className="mt-2 flex gap-1.5 pl-14">
                  {conv.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-muted-foreground"
          >
            <Search size={36} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">Nenhuma conversa encontrada</p>
            <p className="text-xs mt-1 opacity-60">Tente outro filtro ou termo</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
