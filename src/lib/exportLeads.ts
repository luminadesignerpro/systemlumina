import { Lead, defaultStages } from "./crmData";

export function exportLeadsToCSV(leads: Lead[], filename = "leads-export.csv") {
  const stageMap = Object.fromEntries(defaultStages.map((s) => [s.id, s.name]));

  const headers = [
    "Nome",
    "Empresa",
    "Email",
    "Telefone",
    "Valor",
    "Etapa",
    "Canal",
    "Criado em",
    "Última Atividade",
    "Tags",
    "Responsável",
  ];

  const rows = leads.map((l) => [
    l.name,
    l.company || "",
    l.email || "",
    l.phone || "",
    l.value.toString(),
    stageMap[l.stage] || l.stage,
    l.channel,
    l.createdAt,
    l.lastActivity,
    (l.tags || []).join("; "),
    l.assignedTo || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
