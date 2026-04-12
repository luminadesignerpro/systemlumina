export interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  value: number;
  stage: string;
  channel: "whatsapp" | "instagram" | "messenger" | "email" | "site";
  createdAt: string;
  lastActivity: string;
  tags?: string[];
  assignedTo?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
}

export const defaultStages: PipelineStage[] = [
  { id: "lead-novo", name: "Lead Novo", color: "hsl(var(--primary))" },
  { id: "primeiro-contato", name: "Primeiro Contato", color: "hsl(var(--secondary))" },
  { id: "qualificacao", name: "Qualificação", color: "hsl(142 70% 45%)" },
  { id: "proposta", name: "Proposta Enviada", color: "hsl(45 93% 47%)" },
  { id: "negociacao", name: "Negociação", color: "hsl(var(--accent))" },
  { id: "fechado-ganho", name: "Fechado/Ganho", color: "hsl(142 70% 45%)" },
  { id: "perdido", name: "Perdido", color: "hsl(var(--destructive))" },
];

export const mockLeads: Lead[] = [
  { id: "l1", name: "Maria Silva", company: "Tech Solutions", email: "maria@techsol.com", phone: "+55 11 99999-1234", value: 15000, stage: "lead-novo", channel: "whatsapp", createdAt: "07/03/2026 10:00", lastActivity: "07/03/2026 10:32", tags: ["vendas", "premium"], assignedTo: "Carlos" },
  { id: "l2", name: "João Santos", company: "Digital Corp", email: "joao@digital.com", phone: "+55 21 98888-5678", value: 8500, stage: "lead-novo", channel: "instagram", createdAt: "06/03/2026 14:00", lastActivity: "07/03/2026 09:45", tags: ["lead"] },
  { id: "l3", name: "Ana Costa", company: "Startup X", value: 22000, stage: "primeiro-contato", channel: "messenger", createdAt: "05/03/2026 09:00", lastActivity: "06/03/2026 16:00", tags: ["enterprise"] },
  { id: "l4", name: "Pedro Oliveira", company: "Oliveira & Cia", email: "pedro@oliveira.com", value: 5000, stage: "primeiro-contato", channel: "whatsapp", createdAt: "04/03/2026 11:00", lastActivity: "06/03/2026 14:30" },
  { id: "l5", name: "Carla Mendes", company: "CM Marketing", value: 35000, stage: "qualificacao", channel: "email", createdAt: "03/03/2026 08:00", lastActivity: "06/03/2026 10:00", tags: ["premium", "enterprise"], assignedTo: "Ana" },
  { id: "l6", name: "Lucas Ferreira", company: "LF Consulting", value: 12000, stage: "qualificacao", channel: "site", createdAt: "02/03/2026 15:00", lastActivity: "05/03/2026 17:00" },
  { id: "l7", name: "Fernanda Lima", company: "Lima Tech", email: "fernanda@lima.com", value: 45000, stage: "proposta", channel: "whatsapp", createdAt: "01/03/2026 10:00", lastActivity: "05/03/2026 11:00", tags: ["premium"], assignedTo: "Carlos" },
  { id: "l8", name: "Roberto Alves", company: "Alves SA", value: 18000, stage: "proposta", channel: "instagram", createdAt: "28/02/2026 14:00", lastActivity: "04/03/2026 16:00" },
  { id: "l9", name: "Juliana Rocha", company: "JR Digital", value: 28000, stage: "negociacao", channel: "messenger", createdAt: "25/02/2026 09:00", lastActivity: "04/03/2026 14:00", tags: ["enterprise"], assignedTo: "Ana" },
  { id: "l10", name: "Marcos Paulo", company: "MP Solutions", value: 9500, stage: "negociacao", channel: "whatsapp", createdAt: "20/02/2026 11:00", lastActivity: "03/03/2026 10:00" },
  { id: "l11", name: "Patrícia Dias", company: "PD Corp", value: 55000, stage: "fechado-ganho", channel: "email", createdAt: "15/02/2026 08:00", lastActivity: "01/03/2026 15:00", tags: ["premium"], assignedTo: "Carlos" },
  { id: "l12", name: "Diego Martins", company: "DM Tech", value: 7000, stage: "perdido", channel: "site", createdAt: "10/02/2026 14:00", lastActivity: "25/02/2026 09:00" },
];
