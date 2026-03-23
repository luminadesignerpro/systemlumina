import { Conversation, Message, mockMessages } from "@/lib/mockData";
import { ChannelBadge } from "./ChannelBadge";
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Bot } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatAreaProps {
  conversation: Conversation;
}

export function ChatArea({ conversation }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockMessages[conversation.id] || []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(mockMessages[conversation.id] || []);
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `new-${Date.now()}`,
      conversationId: conversation.id,
      content: input,
      direction: "outgoing",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      read: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-11 w-11 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground shadow-elevated"
          >
            {conversation.contact.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-display font-bold text-card-foreground">{conversation.contact.name}</h3>
              <ChannelBadge channel={conversation.contact.channel} size="md" />
            </div>
            <p className="text-xs text-muted-foreground">
              {conversation.contact.phone || `via ${conversation.contact.channel}`}
            </p>
          </motion.div>
        </div>
        <div className="flex items-center gap-0.5">
          {[Phone, Video, Bot, MoreVertical].map((Icon, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:scale-110"
            >
              <Icon size={17} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mx-auto max-w-2xl space-y-2">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className={`flex ${msg.direction === "outgoing" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.direction === "outgoing"
                      ? "gradient-primary text-primary-foreground rounded-br-md shadow-elevated"
                      : "bg-card text-card-foreground shadow-card rounded-bl-md border border-border"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`mt-1 text-[10px] text-right ${
                      msg.direction === "outgoing" ? "text-primary-foreground/50" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-card/80 backdrop-blur-xl px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Paperclip size={19} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Smile size={19} />
          </motion.button>
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-elevated transition-all disabled:opacity-30 disabled:shadow-none"
          >
            <Send size={17} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
