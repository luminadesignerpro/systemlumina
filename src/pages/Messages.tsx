import { useState, useEffect, useRef } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Search, Filter, Phone, Instagram, Facebook, MoreVertical, Image, Paperclip, Smile, CheckCheck, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Channel = "whatsapp" | "instagram" | "messenger";

interface Conversation {
  id: string;
  contact_name: string;
  contact_identifier: string;
  channel: Channel;
  status: string;
  last_message_at: string;
  tags: string[] | null;
  unread_count?: number;
  last_message?: string;
}

interface Message {
  id: string;
  content: string;
  direction: "incoming" | "outgoing";
  created_at: string;
  status: string;
  message_type: string;
  read: boolean;
}

const channelIcons = {
  whatsapp: Phone,
  instagram: Instagram,
  messenger: Facebook,
};

const channelColors = {
  whatsapp: "text-green-500",
  instagram: "text-pink-500",
  messenger: "text-blue-500",
};

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", user?.id, channelFilter],
    queryFn: async () => {
      let query = supabase
        .from("conversations")
        .select("*, messages(content, created_at, direction)")
        .eq("user_id", user!.id)
        .order("last_message_at", { ascending: false });

      if (channelFilter !== "all") {
        query = query.eq("channel", channelFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process to add last message and unread count
      return (data || []).map((conv: any) => {
        const lastMsg = conv.messages?.[0];
        return {
          ...conv,
          last_message: lastMsg?.content || "",
          unread_count: conv.messages?.filter((m: any) => m.direction === "incoming" && !m.read).length || 0,
        };
      });
    },
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConversation!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedConversation,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, conversationId }: { content: string; conversationId: string }) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) throw new Error("Conversation not found");

      if (conversation.channel === "whatsapp") {
        const { data, error } = await supabase.functions.invoke("whatsapp-send", {
          body: {
            action: "send_message",
            to: conversation.contact_identifier,
            message: content,
            conversationId,
          },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        return data;
      } else {
        // For Instagram/Messenger, save directly to DB
        // (In production, you'd call respective APIs)
        const { error } = await supabase.from("messages").insert({
          conversation_id: conversationId,
          user_id: user!.id,
          content,
          direction: "outgoing",
          message_type: "text",
          status: "sent",
          read: true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setMessageText("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao enviar mensagem");
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    sendMessageMutation.mutate({ content: messageText, conversationId: selectedConversation });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredConversations = conversations.filter((conv) =>
    conv.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contact_identifier.includes(searchQuery)
  );

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className={`flex flex-1 overflow-hidden ${isMobile ? "pt-14" : ""}`}>
        {/* Conversations List */}
        <div className={cn(
          "w-full sm:w-80 border-r border-border bg-card flex flex-col",
          isMobile && selectedConversation && "hidden"
        )}>
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">Mensagens</h2>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MoreVertical size={16} />
              </Button>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm h-9"
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={channelFilter === "all" ? "default" : "outline"}
                onClick={() => setChannelFilter("all")}
                className="text-xs flex-1"
              >
                Todos
              </Button>
              <Button
                size="sm"
                variant={channelFilter === "whatsapp" ? "default" : "outline"}
                onClick={() => setChannelFilter("whatsapp")}
                className="text-xs"
              >
                <Phone size={14} />
              </Button>
              <Button
                size="sm"
                variant={channelFilter === "instagram" ? "default" : "outline"}
                onClick={() => setChannelFilter("instagram")}
                className="text-xs"
              >
                <Instagram size={14} />
              </Button>
              <Button
                size="sm"
                variant={channelFilter === "messenger" ? "default" : "outline"}
                onClick={() => setChannelFilter("messenger")}
                className="text-xs"
              >
                <Facebook size={14} />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {filteredConversations.map((conv) => {
                const ChannelIcon = channelIcons[conv.channel];
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-accent/50 transition-colors",
                      selectedConversation === conv.id && "bg-accent"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm">
                          {conv.contact_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm truncate">{conv.contact_name}</p>
                          <ChannelIcon size={14} className={channelColors[conv.channel]} />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(conv.last_message_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {(conv.unread_count || 0) > 0 && (
                            <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px]">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Nenhuma conversa encontrada
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col bg-background",
          isMobile && !selectedConversation && "hidden"
        )}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedConversation(null)}
                      className="h-8 w-8"
                    >
                      ←
                    </Button>
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm">
                      {selectedConv.contact_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{selectedConv.contact_name}</p>
                    <div className="flex items-center gap-1.5">
                      {React.createElement(channelIcons[selectedConv.channel], {
                        size: 12,
                        className: channelColors[selectedConv.channel],
                      })}
                      <span className="text-xs text-muted-foreground">
                        {selectedConv.contact_identifier}
                      </span>
                    </div>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVertical size={16} />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.direction === "outgoing" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-4 py-2",
                          msg.direction === "outgoing"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] opacity-70">
                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.direction === "outgoing" && (
                            <>
                              {msg.status === "read" && <CheckCheck size={12} className="opacity-70" />}
                              {msg.status === "delivered" && <CheckCheck size={12} className="opacity-70" />}
                              {msg.status === "sent" && <Check size={12} className="opacity-70" />}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0">
                    <Paperclip size={18} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0">
                    <Image size={18} />
                  </Button>
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 text-sm"
                  />
                  <Button size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0">
                    <Smile size={18} />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="h-9 w-9 flex-shrink-0"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MessageCircle size={40} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Mensagens Unificadas</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Selecione uma conversa para começar a responder mensagens do WhatsApp, Instagram e Messenger em um só lugar
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
