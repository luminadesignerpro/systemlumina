import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MessageCircle, CheckCircle2, Loader2, ExternalLink, Copy, Shield, Zap, BarChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const WhatsAppConfig = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumberId: "",
    accessToken: "",
    businessAccountId: "",
    displayName: "",
    phoneNumber: "",
  });

  const { data: connection } = useQuery({
    queryKey: ["whatsapp_connection", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("whatsapp_connections")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const webhookUrl = `${window.location.origin.replace('preview', 'functions')}/whatsapp-webhook`;

  const handleSaveConnection = async () => {
    if (!formData.phoneNumberId || !formData.accessToken) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-send", {
        body: {
          action: "setup_connection",
          phoneNumberId: formData.phoneNumberId,
          accessToken: formData.accessToken,
          businessAccountId: formData.businessAccountId,
          displayName: formData.displayName,
          phoneNumber: formData.phoneNumber,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      queryClient.invalidateQueries({ queryKey: ["whatsapp_connection"] });
      toast.success("WhatsApp conectado com sucesso! 🎉");
      setFormData({
        phoneNumberId: "",
        accessToken: "",
        businessAccountId: "",
        displayName: "",
        phoneNumber: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Erro ao conectar WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from("whatsapp_connections")
        .update({ is_active: false })
        .eq("user_id", user!.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["whatsapp_connection"] });
      toast.success("WhatsApp desconectado");
    } catch (err: any) {
      toast.error(err.message || "Erro ao desconectar");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className={`flex flex-1 flex-col overflow-hidden ${isMobile ? "pt-14" : ""}`}>
        <div className="border-b border-border bg-card px-6 py-4">
          <h1 className="font-display text-lg font-bold flex items-center gap-2">
            <MessageCircle size={18} className="text-green-500" />
            Configurar WhatsApp Business
          </h1>
          <p className="text-xs text-muted-foreground">
            Conecte sua conta WhatsApp Business API para enviar e receber mensagens
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {connection ? (
              <Card className="p-6 space-y-4 glass-card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <MessageCircle size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{connection.display_name || connection.phone_number || "WhatsApp Conectado"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-green-500" />
                      Conectado e ativo
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone Number ID:</span>
                    <span className="font-mono">{connection.phone_number_id}</span>
                  </div>
                  {connection.phone_number && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Número:</span>
                      <span className="font-mono">{connection.phone_number}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conectado em:</span>
                    <span>{new Date(connection.connected_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <Button variant="destructive" size="sm" onClick={handleDisconnect} className="w-full">
                  Desconectar WhatsApp
                </Button>
              </Card>
            ) : (
              <>
                <Card className="p-6 space-y-4 glass-card">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle size={24} className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold">Conectar WhatsApp Business API</h3>
                      <p className="text-xs text-muted-foreground">Configure sua integração oficial</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { icon: Shield, text: "API oficial do Meta WhatsApp Business" },
                      { icon: Zap, text: "Envio e recebimento de mensagens em tempo real" },
                      { icon: BarChart, text: "Analytics e métricas de conversas" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Icon size={14} className="text-primary flex-shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 space-y-4 glass-card">
                  <h3 className="font-semibold text-sm">Credenciais da API</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumberId" className="text-xs">
                        Phone Number ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phoneNumberId"
                        placeholder="123456789012345"
                        value={formData.phoneNumberId}
                        onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accessToken" className="text-xs">
                        Access Token <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="accessToken"
                        type="password"
                        placeholder="EAAxxxxxxxxxx"
                        value={formData.accessToken}
                        onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessAccountId" className="text-xs">Business Account ID (opcional)</Label>
                      <Input
                        id="businessAccountId"
                        placeholder="123456789012345"
                        value={formData.businessAccountId}
                        onChange={(e) => setFormData({ ...formData, businessAccountId: e.target.value })}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-xs">Nome de Exibição (opcional)</Label>
                      <Input
                        id="displayName"
                        placeholder="Minha Empresa"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-xs">Número do WhatsApp (opcional)</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="+55 11 99999-9999"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveConnection}
                    disabled={loading}
                    className="w-full gradient-button"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <MessageCircle size={16} className="mr-2" />
                        Conectar WhatsApp
                      </>
                    )}
                  </Button>
                </Card>

                <Card className="p-6 space-y-4 glass-card bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Shield size={16} className="text-blue-500" />
                    Configurar Webhook
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={webhookUrl}
                          readOnly
                          className="text-xs font-mono bg-background"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(webhookUrl)}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Verify Token</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value="systemlumina_verify_token_2026"
                          readOnly
                          className="text-xs font-mono bg-background"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard("systemlumina_verify_token_2026")}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Configure estes valores no painel do Meta Business (WhatsApp {">"} Configuration {">"} Webhooks)
                    </p>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => window.open("https://developers.facebook.com/apps", "_blank")}
                    >
                      <ExternalLink size={14} className="mr-2" />
                      Abrir Meta Business Manager
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 space-y-3 glass-card">
                  <h3 className="font-semibold text-sm">📚 Como obter as credenciais?</h3>
                  <ol className="text-xs space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Acesse <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta for Developers</a></li>
                    <li>Crie ou selecione um App com WhatsApp Business</li>
                    <li>Vá em WhatsApp {">"} API Setup</li>
                    <li>Copie o <strong>Phone Number ID</strong> e o <strong>Access Token</strong></li>
                    <li>Configure o Webhook com a URL e token acima</li>
                    <li>Cole as credenciais aqui e conecte!</li>
                  </ol>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConfig;
