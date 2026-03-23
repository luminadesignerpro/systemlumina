import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultStages } from "@/lib/crmData";
import { useCreateLead, useUpdateLead, Lead } from "@/hooks/useLeads";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  company: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  value: z.coerce.number().min(0, "Valor deve ser positivo"),
  stage: z.string().min(1),
  channel: z.string().min(1),
  assigned_to: z.string().trim().max(50).optional().or(z.literal("")),
  tags: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLead?: Lead | null;
}

const channels = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "messenger", label: "Messenger" },
  { value: "email", label: "Email" },
  { value: "site", label: "Site" },
];

export function LeadFormDialog({ open, onOpenChange, editLead }: LeadFormDialogProps) {
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const isEdit = !!editLead;

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: editLead ? {
      name: editLead.name,
      company: editLead.company || "",
      email: editLead.email || "",
      phone: editLead.phone || "",
      value: editLead.value,
      stage: editLead.stage,
      channel: editLead.channel,
      assigned_to: editLead.assigned_to || "",
      tags: (editLead.tags || []).join(", "),
    } : {
      name: "",
      company: "",
      email: "",
      phone: "",
      value: 0,
      stage: "lead-novo",
      channel: "whatsapp",
      assigned_to: "",
      tags: "",
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    const tags = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    const payload = {
      name: data.name,
      company: data.company || null,
      email: data.email || null,
      phone: data.phone || null,
      value: data.value,
      stage: data.stage,
      channel: data.channel,
      assigned_to: data.assigned_to || null,
      tags,
    };

    if (isEdit && editLead) {
      await updateLead.mutateAsync({ id: editLead.id, ...payload });
    } else {
      await createLead.mutateAsync(payload);
    }
    reset();
    onOpenChange(false);
  };

  const stageValue = watch("stage");
  const channelValue = watch("channel");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{isEdit ? "Editar Lead" : "Novo Lead"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register("name")} placeholder="Nome do lead" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" {...register("company")} placeholder="Empresa" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="value">Valor (R$) *</Label>
              <Input id="value" type="number" step="0.01" {...register("value")} />
              {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="email@exemplo.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} placeholder="+55 11 99999-0000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Etapa</Label>
              <Select value={stageValue} onValueChange={(v) => setValue("stage", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {defaultStages.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Canal</Label>
              <Select value={channelValue} onValueChange={(v) => setValue("channel", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {channels.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="assigned_to">Responsável</Label>
              <Input id="assigned_to" {...register("assigned_to")} placeholder="Nome" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" {...register("tags")} placeholder="premium, vendas" />
              <p className="text-[10px] text-muted-foreground">Separadas por vírgula</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={createLead.isPending || updateLead.isPending}>
              {(createLead.isPending || updateLead.isPending) ? "Salvando..." : isEdit ? "Salvar" : "Criar Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
