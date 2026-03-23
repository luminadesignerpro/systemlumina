import { Lead } from "@/lib/crmData";
import { Phone, Mail, Building2, Calendar, GripVertical } from "lucide-react";
import { ChannelBadge } from "@/components/ChannelBadge";
import { Badge } from "@/components/ui/badge";

interface LeadCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onClick?: (lead: Lead) => void;
}

const channelMap: Record<string, "whatsapp" | "instagram" | "messenger"> = {
  whatsapp: "whatsapp",
  instagram: "instagram",
  messenger: "messenger",
};

export function LeadCard({ lead, onDragStart, onClick }: LeadCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={() => onClick?.(lead)}
      className="group cursor-grab active:cursor-grabbing rounded-xl border border-border bg-card p-3 shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5 animate-fade-in"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
        </div>
        {channelMap[lead.channel] && (
          <ChannelBadge channel={channelMap[lead.channel]} size="sm" />
        )}
      </div>

      <h4 className="font-display font-semibold text-sm text-card-foreground truncate">{lead.name}</h4>

      {lead.company && (
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Building2 size={12} />
          <span className="truncate">{lead.company}</span>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-bold text-primary">
          R$ {lead.value.toLocaleString("pt-BR")}
        </span>
        {lead.assignedTo && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/20 text-[9px] font-bold text-secondary">
            {lead.assignedTo[0]}
          </div>
        )}
      </div>

      {lead.tags && lead.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {lead.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted text-muted-foreground border-0">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <Calendar size={10} />
        <span>{lead.lastActivity}</span>
      </div>
    </div>
  );
}
