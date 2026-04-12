import { useState, useCallback, useMemo } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { PipelineColumn } from "@/components/crm/PipelineColumn";
import { LeadDetailPanel } from "@/components/crm/LeadDetailPanel";
import { CRMFilters, CRMFilterState, emptyFilters } from "@/components/crm/CRMFilters";
import { LeadFormDialog } from "@/components/crm/LeadFormDialog";
import { defaultStages } from "@/lib/crmData";
import { useLeads, useUpdateLead, useDeleteLead, Lead } from "@/hooks/useLeads";
import { exportLeadsToCSV } from "@/lib/exportLeads";
import { Search, Plus, Download, LayoutGrid, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type ViewMode = "kanban" | "table";

// Adapter to map DB lead to component-compatible format
function toComponentLead(lead: Lead) {
  return {
    ...lead,
    company: lead.company ?? undefined,
    email: lead.email ?? undefined,
    phone: lead.phone ?? undefined,
    tags: lead.tags ?? [],
    assignedTo: lead.assigned_to ?? undefined,
    channel: lead.channel as "whatsapp" | "instagram" | "messenger" | "email" | "site",
    createdAt: new Date(lead.created_at).toLocaleString("pt-BR"),
    lastActivity: new Date(lead.last_activity).toLocaleString("pt-BR"),
  };
}

const CRM = () => {
  const [activeNav, setActiveNav] = useState("contacts");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CRMFilterState>(emptyFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [formOpen, setFormOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const isMobile = useIsMobile();

  const { data: leads = [], isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const handleDragStart = useCallback((e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    updateLead.mutate({ id: leadId, stage: stageId });
  }, [updateLead]);

  const componentLeads = useMemo(() => leads.map(toComponentLead), [leads]);

  const filteredLeads = useMemo(() => {
    return componentLeads.filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.company?.toLowerCase().includes(search.toLowerCase());
      const matchChannel = filters.channels.length === 0 || filters.channels.includes(l.channel);
      const matchStage = filters.stages.length === 0 || filters.stages.includes(l.stage);
      const matchTag =
        filters.tags.length === 0 || (l.tags && l.tags.some((t) => filters.tags.includes(t)));
      const matchAssignee =
        filters.assignees.length === 0 || (l.assignedTo && filters.assignees.includes(l.assignedTo));
      const matchMin = filters.valueMin === null || l.value >= filters.valueMin;
      const matchMax = filters.valueMax === null || l.value <= filters.valueMax;
      return matchSearch && matchChannel && matchStage && matchTag && matchAssignee && matchMin && matchMax;
    });
  }, [componentLeads, search, filters]);

  const totalValue = filteredLeads.reduce((sum, l) => sum + l.value, 0);
  const totalLeads = filteredLeads.length;

  const handleExport = () => {
    exportLeadsToCSV(filteredLeads as any);
    toast.success(`${filteredLeads.length} leads exportados com sucesso!`);
  };

  const handleLeadClick = (lead: any) => {
    const original = leads.find(l => l.id === lead.id);
    if (original) setSelectedLead(original);
  };

  const handleEdit = (lead: Lead) => {
    setEditLead(lead);
    setFormOpen(true);
  };

  const handleDelete = (lead: Lead) => {
    deleteLead.mutate(lead.id);
    setSelectedLead(null);
  };

  const stageMap = Object.fromEntries(defaultStages.map((s) => [s.id, s]));

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar activeItem={activeNav} onItemClick={setActiveNav} />
      <div className={`flex flex-1 flex-col overflow-hidden ${isMobile ? "pt-14" : ""}`}>
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Gestão Comercial</h1>
            <p className="text-xs text-muted-foreground">
              {totalLeads} leads · R$ {totalValue.toLocaleString("pt-BR")} no pipeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full sm:w-48 rounded-lg border border-input bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <CRMFilters filters={filters} onChange={setFilters} leads={componentLeads as any} />
            
            <div className="hidden sm:flex items-center rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center justify-center h-8 w-8 transition-colors ${
                  viewMode === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center justify-center h-8 w-8 transition-colors ${
                  viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <List size={14} />
              </button>
            </div>

            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={handleExport}>
              <Download size={13} />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => { setEditLead(null); setFormOpen(true); }}>
              <Plus size={13} />
              <span className="hidden sm:inline">Novo Lead</span>
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 border-b border-border bg-card/50 px-4 py-2 overflow-x-auto">
          {defaultStages.slice(0, -1).map((stage) => {
            const count = filteredLeads.filter((l) => l.stage === stage.id).length;
            const value = filteredLeads.filter((l) => l.stage === stage.id).reduce((s, l) => s + l.value, 0);
            return (
              <div key={stage.id} className="flex items-center gap-1.5 flex-shrink-0">
                <div className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
                <span className="text-[10px] text-muted-foreground">{stage.name}:</span>
                <span className="text-[10px] font-bold text-foreground">{count}</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] font-semibold text-foreground">R$ {value.toLocaleString("pt-BR")}</span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : viewMode === "kanban" ? (
          <div className="flex flex-1 overflow-hidden">
            <div className="flex gap-3 p-4 overflow-x-auto flex-1">
              {defaultStages.map((stage) => (
                <PipelineColumn
                  key={stage.id}
                  stage={stage}
                  leads={filteredLeads.filter((l) => l.stage === stage.id) as any}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onLeadClick={handleLeadClick}
                />
              ))}
            </div>
            {selectedLead && !isMobile && (
              <LeadDetailPanel
                lead={toComponentLead(selectedLead) as any}
                onClose={() => setSelectedLead(null)}
                onEdit={() => handleEdit(selectedLead)}
                onDelete={() => handleDelete(selectedLead)}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold">Nome</TableHead>
                    <TableHead className="text-xs font-semibold">Empresa</TableHead>
                    <TableHead className="text-xs font-semibold">Valor</TableHead>
                    <TableHead className="text-xs font-semibold">Etapa</TableHead>
                    <TableHead className="text-xs font-semibold">Canal</TableHead>
                    <TableHead className="text-xs font-semibold">Responsável</TableHead>
                    <TableHead className="text-xs font-semibold">Última Atividade</TableHead>
                    <TableHead className="text-xs font-semibold">Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => {
                    const stage = stageMap[lead.stage];
                    return (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => handleLeadClick(lead)}
                      >
                        <TableCell className="text-sm font-medium text-foreground">{lead.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{lead.company || "—"}</TableCell>
                        <TableCell className="text-sm font-bold text-primary">
                          R$ {lead.value.toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full" style={{ background: stage?.color }} />
                            <span className="text-xs">{stage?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground capitalize">{lead.channel}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{lead.assignedTo || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{lead.lastActivity}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(lead.tags || []).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted text-muted-foreground border-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredLeads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                        {leads.length === 0 ? "Nenhum lead cadastrado. Clique em \"Novo Lead\" para começar!" : "Nenhum lead encontrado com os filtros atuais"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Mobile lead detail overlay */}
        {selectedLead && isMobile && (
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setSelectedLead(null)}>
            <div className="absolute right-0 top-0 h-full w-[85vw] max-w-sm" onClick={(e) => e.stopPropagation()}>
              <LeadDetailPanel
                lead={toComponentLead(selectedLead) as any}
                onClose={() => setSelectedLead(null)}
                onEdit={() => handleEdit(selectedLead)}
                onDelete={() => handleDelete(selectedLead)}
              />
            </div>
          </div>
        )}
      </div>

      <LeadFormDialog
        key={editLead?.id || "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        editLead={editLead}
      />
    </div>
  );
};

export default CRM;
