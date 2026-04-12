import { Lead, PipelineStage } from "@/lib/crmData";
import { LeadCard } from "./LeadCard";
import { Plus } from "lucide-react";

interface PipelineColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stageId: string) => void;
  onLeadClick?: (lead: Lead) => void;
}

export function PipelineColumn({ stage, leads, onDragStart, onDragOver, onDrop, onLeadClick }: PipelineColumnProps) {
  const totalValue = leads.reduce((sum, l) => sum + l.value, 0);

  return (
    <div
      className="flex flex-col min-w-[280px] max-w-[300px] flex-shrink-0 rounded-xl bg-muted/50 border border-border"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage.id)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: stage.color }} />
          <h3 className="font-display font-semibold text-xs text-foreground">{stage.name}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground px-1">
            {leads.length}
          </span>
        </div>
        <button className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-foreground transition-colors">
          <Plus size={14} />
        </button>
      </div>

      {/* Value summary */}
      <div className="px-3 py-1.5 border-b border-border">
        <span className="text-[10px] text-muted-foreground">Valor: </span>
        <span className="text-[11px] font-bold text-foreground">R$ {totalValue.toLocaleString("pt-BR")}</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-2 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onDragStart={onDragStart} onClick={onLeadClick} />
        ))}
        {leads.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
            Arraste leads aqui
          </div>
        )}
      </div>
    </div>
  );
}
