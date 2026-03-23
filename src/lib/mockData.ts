export type Channel = "whatsapp" | "instagram" | "messenger";
export type MessageDirection = "incoming" | "outgoing";

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  channel: Channel;
  lastSeen?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  direction: MessageDirection;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "open" | "pending" | "resolved";
  assignedTo?: string;
  tags?: string[];
}

export const mockConversations: Conversation[] = [
  {
    id: "1",
    contact: { id: "c1", name: "Maria Silva", channel: "whatsapp", phone: "+55 11 99999-1234" },
    lastMessage: "Olá, gostaria de saber sobre o plano empresarial",
    lastMessageTime: "10:32",
    unreadCount: 3,
    status: "open",
    tags: ["vendas", "lead"],
  },
  {
    id: "2",
    contact: { id: "c2", name: "João Santos", channel: "instagram" },
    lastMessage: "Vocês fazem entrega para SP?",
    lastMessageTime: "09:45",
    unreadCount: 1,
    status: "open",
    tags: ["suporte"],
  },
  {
    id: "3",
    contact: { id: "c3", name: "Ana Costa", channel: "messenger" },
    lastMessage: "Obrigada pelo atendimento! 😊",
    lastMessageTime: "Ontem",
    unreadCount: 0,
    status: "resolved",
  },
  {
    id: "4",
    contact: { id: "c4", name: "Pedro Oliveira", channel: "whatsapp", phone: "+55 21 98888-5678" },
    lastMessage: "Preciso de ajuda com minha assinatura",
    lastMessageTime: "Ontem",
    unreadCount: 0,
    status: "pending",
    tags: ["billing"],
  },
  {
    id: "5",
    contact: { id: "c5", name: "Carla Mendes", channel: "instagram" },
    lastMessage: "Qual o prazo de entrega?",
    lastMessageTime: "Seg",
    unreadCount: 0,
    status: "open",
  },
  {
    id: "6",
    contact: { id: "c6", name: "Lucas Ferreira", channel: "messenger" },
    lastMessage: "Consegui resolver, valeu!",
    lastMessageTime: "Seg",
    unreadCount: 0,
    status: "resolved",
  },
];

export const mockMessages: Record<string, Message[]> = {
  "1": [
    { id: "m1", conversationId: "1", content: "Olá! Boa tarde 👋", direction: "incoming", timestamp: "10:28", read: true },
    { id: "m2", conversationId: "1", content: "Boa tarde, Maria! Como posso ajudar?", direction: "outgoing", timestamp: "10:29", read: true },
    { id: "m3", conversationId: "1", content: "Gostaria de saber mais sobre o plano empresarial", direction: "incoming", timestamp: "10:30", read: true },
    { id: "m4", conversationId: "1", content: "Quais funcionalidades estão incluídas?", direction: "incoming", timestamp: "10:31", read: false },
    { id: "m5", conversationId: "1", content: "Olá, gostaria de saber sobre o plano empresarial", direction: "incoming", timestamp: "10:32", read: false },
  ],
  "2": [
    { id: "m6", conversationId: "2", content: "Oi! Vocês fazem entrega para São Paulo?", direction: "incoming", timestamp: "09:44", read: true },
    { id: "m7", conversationId: "2", content: "Vocês fazem entrega para SP?", direction: "incoming", timestamp: "09:45", read: false },
  ],
  "3": [
    { id: "m8", conversationId: "3", content: "Preciso de ajuda com um pedido", direction: "incoming", timestamp: "Ontem 14:00", read: true },
    { id: "m9", conversationId: "3", content: "Claro! Qual é o número do pedido?", direction: "outgoing", timestamp: "Ontem 14:02", read: true },
    { id: "m10", conversationId: "3", content: "#12345", direction: "incoming", timestamp: "Ontem 14:03", read: true },
    { id: "m11", conversationId: "3", content: "Encontrei! Seu pedido está em trânsito e chega amanhã.", direction: "outgoing", timestamp: "Ontem 14:05", read: true },
    { id: "m12", conversationId: "3", content: "Obrigada pelo atendimento! 😊", direction: "incoming", timestamp: "Ontem 14:06", read: true },
  ],
};
