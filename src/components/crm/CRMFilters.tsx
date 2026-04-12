import { useState } from "react";
import { Lead, defaultStages } from "@/lib/crmData";
import { Filter, X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

export interface CRMFilterState {
  channels: string[];
  stages: string[];
  tags: string[];
  assignees: string[];
  valueMin: number | null;
  valueMax: number | null;
}

export const emptyFilters: CRMFilterState = {
  channels: [],
  stages: [],
  tags: [],
  assignees: [],
  valueMin: null,
  valueMax: null,
};

interface CRMFiltersProps {
  filters: CRMFilterState;
  onChange: (filters: CRMFilterState) => void;
  leads: Lead[];
}

const channelLabels: Record<string, string> = {
  whatsapp: "💬 WhatsApp",
  instagram: "📸 Instagram",
  messenger: "💭 Messenger",
  email: "📧 Email",
  site: "🌐 Site",
};

export function CRMFilters({ filters, onChange, leads }: CRMFiltersProps) {
  const [open, setOpen] = useState(false);

  const allTags = Array.from(new Set(leads.flatMap((l) => l.tags || [])));
  const allAssignees = Array.from(new Set(leads.map((l) => l.assignedTo).filter(Boolean))) as string[];
  const allChannels = Array.from(new Set(leads.map((l) => l.channel)));

  const activeCount =
    filters.channels.length +
    filters.stages.length +
    filters.tags.length +
    filters.assignees.length +
    (filters.valueMin !== null ? 1 : 0) +
    (filters.valueMax !== null ? 1 : 0);

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const clearAll = () => onChange(emptyFilters);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs relative">
          <Filter size={13} />
          <span className="hidden sm:inline">Filtros</span>
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-display font-bold text-sm text-foreground">Filtros Avançados</h3>
          {activeCount > 0 && (
            <button onClick={clearAll} className="text-xs text-primary hover:underline">
              Limpar todos
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Canal */}
          <FilterSection title="Canal">
            <div className="flex flex-wrap gap-1.5">
              {allChannels.map((ch) => (
                <button
                  key={ch}
                  onClick={() => onChange({ ...filters, channels: toggle(filters.channels, ch) })}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                    filters.channels.includes(ch)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-border"
                  }`}
                >
                  {channelLabels[ch] || ch}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Etapa */}
          <FilterSection title="Etapa do Pipeline">
            <div className="space-y-1.5">
              {defaultStages.map((stage) => (
                <label key={stage.id} className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    checked={filters.stages.includes(stage.id)}
                    onCheckedChange={() => onChange({ ...filters, stages: toggle(filters.stages, stage.id) })}
                  />
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: stage.color }} />
                  <span className="text-xs text-foreground group-hover:text-primary transition-colors">{stage.name}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Tags */}
          {allTags.length > 0 && (
            <FilterSection title="Tags">
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onChange({ ...filters, tags: toggle(filters.tags, tag) })}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-all ${
                      filters.tags.includes(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-border"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Responsável */}
          {allAssignees.length > 0 && (
            <FilterSection title="Responsável">
              <div className="space-y-1.5">
                {allAssignees.map((name) => (
                  <label key={name} className="flex items-center gap-2 cursor-pointer group">
                    <Checkbox
                      checked={filters.assignees.includes(name)}
                      onCheckedChange={() => onChange({ ...filters, assignees: toggle(filters.assignees, name) })}
                    />
                    <span className="text-xs text-foreground group-hover:text-primary transition-colors">{name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Valor */}
          <FilterSection title="Faixa de Valor (R$)">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={filters.valueMin ?? ""}
                onChange={(e) => onChange({ ...filters, valueMin: e.target.value ? Number(e.target.value) : null })}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground">até</span>
              <input
                type="number"
                placeholder="Máx"
                value={filters.valueMax ?? ""}
                onChange={(e) => onChange({ ...filters, valueMax: e.target.value ? Number(e.target.value) : null })}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </FilterSection>
        </div>

        {/* Active filters summary */}
        {activeCount > 0 && (
          <div className="border-t border-border px-4 py-3">
            <div className="flex flex-wrap gap-1">
              {filters.channels.map((ch) => (
                <Badge key={ch} variant="secondary" className="text-[10px] gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => onChange({ ...filters, channels: toggle(filters.channels, ch) })}>
                  {channelLabels[ch] || ch} <X size={10} />
                </Badge>
              ))}
              {filters.stages.map((s) => {
                const stage = defaultStages.find((st) => st.id === s);
                return (
                  <Badge key={s} variant="secondary" className="text-[10px] gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => onChange({ ...filters, stages: toggle(filters.stages, s) })}>
                    {stage?.name || s} <X size={10} />
                  </Badge>
                );
              })}
              {filters.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px] gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => onChange({ ...filters, tags: toggle(filters.tags, t) })}>
                  {t} <X size={10} />
                </Badge>
              ))}
              {filters.assignees.map((a) => (
                <Badge key={a} variant="secondary" className="text-[10px] gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => onChange({ ...filters, assignees: toggle(filters.assignees, a) })}>
                  {a} <X size={10} />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );
}
