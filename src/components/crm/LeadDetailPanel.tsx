import { Lead, defaultStages } from "@/lib/crmData";
import { X, Phone, Mail, Building2, Calendar, Tag, User, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LeadDetailPanelProps {
  lead: Lead;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function LeadDetailPanel({ lead, onClose, onEdit, onDelete }: LeadDetailPanelProps) {
  const stage = defaultStages.find((s) => s.id === lead.stage);

  return (
    <div className="w-80 flex-shrink-0 border-l border-border bg-card overflow-y-auto animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-display font-bold text-foreground">Detalhes do Lead</h3>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-sm font-bold text-primary-foreground">
            {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h4 className="font-display font-bold text-foreground">{lead.name}</h4>
            {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
          </div>
        </div>

        {/* Stage */}
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: stage?.color }} />
          <span className="text-sm font-medium text-foreground">{stage?.name}</span>
        </div>

        {/* Value */}
        <div className="rounded-xl bg-primary/5 p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Valor da Oportunidade</p>
          <p className="text-2xl font-display font-bold text-primary">R$ {lead.value.toLocaleString("pt-BR")}</p>
        </div>

        {/* Contact info */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contato</h5>
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Phone size={14} className="text-muted-foreground" />
              <span>{lead.phone}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Mail size={14} className="text-muted-foreground" />
              <span>{lead.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Building2 size={14} className="text-muted-foreground" />
            <span>{lead.company || "Sem empresa"}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Datas</h5>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar size={14} className="text-muted-foreground" />
            <span>Criado: {lead.createdAt}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar size={14} className="text-muted-foreground" />
            <span>Última atividade: {lead.lastActivity}</span>
          </div>
        </div>

        {/* Assigned */}
        {lead.assignedTo && (
          <div className="flex items-center gap-2 text-sm text-foreground">
            <User size={14} className="text-muted-foreground" />
            <span>Responsável: {lead.assignedTo}</span>
          </div>
        )}

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</h5>
            <div className="flex flex-wrap gap-1">
              {lead.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground border-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button className="w-full gap-2" size="sm">
            <MessageSquare size={14} />
            Iniciar Conversa
          </Button>
          <Button variant="outline" className="w-full gap-2" size="sm">
            <Phone size={14} />
            Ligar
          </Button>
          {onEdit && (
            <Button variant="outline" className="w-full gap-2" size="sm" onClick={onEdit}>
              <Pencil size={14} />
              Editar Lead
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" className="w-full gap-2" size="sm" onClick={onDelete}>
              <Trash2 size={14} />
              Excluir Lead
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
