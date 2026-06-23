import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Bell, History, Mail, MessageCircle, Plus, RefreshCw, Save, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface User {
  id: number;
  name: string;
  email: string;
}

interface CommunicationSettings {
  company_name: string;
  contact_email: string;
  contact_phone: string;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  system_sender_name?: string;
  system_sender_email?: string;
  system_configured?: boolean;
}

interface MessageTemplate {
  id?: number;
  channel: "email" | "whatsapp";
  name: string;
  event_type: string;
  subject?: string | null;
  body: string;
  enabled: boolean;
}

interface ReminderRule {
  id?: number | null;
  name: string;
  trigger_type: string;
  days_offset: number | null;
  specific_date?: string | null;
  repeat_interval_days: number | null;
  active: boolean;
  channel?: "email" | "whatsapp" | "both";
}

interface MessageLog {
  id: number;
  channel: string;
  recipient: string;
  subject?: string | null;
  status: string;
  error_message?: string | null;
  sent_at?: string | null;
  created_at?: string | null;
  sentAt?: string | null;
  createdAt?: string | null;
  charge_id?: number | null;
  customer_name?: string | null;
}

const emptySettings: CommunicationSettings = {
  company_name: "",
  contact_email: "",
  contact_phone: "",
  email_enabled: true,
  whatsapp_enabled: false,
};

const emptyTemplate: MessageTemplate = {
  channel: "email",
  name: "",
  event_type: "manual",
  subject: "",
  body: "",
  enabled: true,
};

const templateTypes = [
  { value: "manual", label: "Cobrança manual" },
  { value: "before_due", label: "Antes do vencimento" },
  { value: "due_today", label: "No dia do vencimento" },
  { value: "after_due", label: "Cobrança vencida" },
  { value: "repeat_after_due", label: "Repetição após vencimento" },
  { value: "payment_confirmed", label: "Confirmação de pagamento" },
];

const ruleTypes = [
  { value: "before_due", label: "Antes do vencimento" },
  { value: "due_today", label: "No vencimento" },
  { value: "after_due", label: "Depois do vencimento" },
  { value: "repeat_after_due", label: "Repetir após vencida" },
];

const variablesText =
  "{{nome_cliente}}, {{valor}}, {{data_vencimento}}, {{status}}, {{link_pagamento}}, {{descricao}}, {{nome_empresa}}, {{email_empresa}}, {{telefone_empresa}}, {{pix}}, {{codigo_pix}}, {{qr_code_pix}}";

const getUser = (): User | null => {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Data não registrada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não registrada";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const friendlyError = (message?: string | null) => {
  if (!message) return "-";
  if (message.includes("EBADNAME") || message.includes("queryA")) {
    return "Não foi possível enviar o e-mail. Verifique as configurações do servidor de envio.";
  }
  return message;
};

const getStatusLabel = (status: string) => {
  if (status === "sent") return "Enviado";
  if (status === "link_generated") return "Link gerado";
  return "Falhou";
};

const getStatusVariant = (status: string) =>
  status === "sent" || status === "link_generated" ? "default" : "destructive";

export default function Comunicacoes() {
  const user = useMemo(() => getUser(), []);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<CommunicationSettings>(emptySettings);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [templateForm, setTemplateForm] = useState<MessageTemplate>(emptyTemplate);
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);

  const authHeaders = {
    "Content-Type": "application/json",
    "X-User-Id": String(user?.id || ""),
  };

  const request = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...authHeaders,
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Erro na requisição.");
    }

    return data;
  };

  const loadAll = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const [email, whatsapp, templatesData, rulesData, logsData] = await Promise.all([
        request("/settings/email"),
        request("/settings/whatsapp"),
        request("/settings/templates"),
        request("/settings/rules"),
        request("/settings/logs"),
      ]);

      setSettings({
        company_name: email.company_name || user.name || "",
        contact_email: email.contact_email || user.email || "",
        contact_phone: email.contact_phone || whatsapp.phone || "",
        email_enabled: email.email_enabled ?? true,
        whatsapp_enabled: email.whatsapp_enabled ?? false,
        system_sender_name: email.system_sender_name,
        system_sender_email: email.system_sender_email,
        system_configured: email.system_configured,
      });
      setTemplates([...(templatesData.defaults || []), ...(templatesData.templates || [])]);
      setRules((rulesData || []).map((rule: ReminderRule) => ({ channel: rule.channel || "email", ...rule })));
      setLogs(logsData || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar comunicações",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    try {
      await request("/settings/email", {
        method: "PUT",
        body: JSON.stringify(settings),
      });

      if (settings.contact_phone) {
        await request("/settings/whatsapp", {
          method: "PUT",
          body: JSON.stringify({ phone: settings.contact_phone }),
        });
      }

      toast({ title: "Configurações salvas", description: "Dados da empresa atualizados." });
      await loadAll();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    setLoading(true);
    try {
      if (templateForm.id) {
        await request(`/settings/templates/${templateForm.id}`, {
          method: "PUT",
          body: JSON.stringify(templateForm),
        });
      } else {
        await request("/settings/templates", {
          method: "POST",
          body: JSON.stringify(templateForm),
        });
      }

      setTemplateForm(emptyTemplate);
      toast({ title: "Template salvo" });
      await loadAll();
    } catch (error) {
      toast({
        title: "Erro ao salvar template",
        description: error instanceof Error ? error.message : "Preencha os campos obrigatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (template: MessageTemplate) => {
    if (!template.id) return;
    setLoading(true);
    try {
      await request(`/settings/templates/${template.id}`, { method: "DELETE" });
      toast({ title: "Template removido" });
      await loadAll();
    } catch (error) {
      toast({
        title: "Erro ao remover template",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => {
    setRules((current) => [
      ...current,
      {
        id: null,
        name: "Nova regra",
        channel: "email",
        trigger_type: "before_due",
        days_offset: 5,
        repeat_interval_days: null,
        active: true,
      },
    ]);
  };

  const updateRule = (index: number, patch: Partial<ReminderRule>) => {
    setRules((current) =>
      current.map((rule, currentIndex) => (currentIndex === index ? { ...rule, ...patch } : rule))
    );
  };

  const saveRules = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await request("/settings/rules", {
        method: "PUT",
        body: JSON.stringify({ rules }),
      });
      toast({ title: "Avisos automáticos salvos" });
      await loadAll();
    } catch (error) {
      toast({
        title: "Erro ao salvar regras",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Comunicações</h1>
            <p className="text-sm text-muted-foreground">
              Configure dados da empresa, templates, avisos automáticos e histórico de envios.
            </p>
          </div>
          <Button variant="outline" onClick={loadAll} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <Tabs defaultValue="configuracoes" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="avisos">Avisos</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="configuracoes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Configurações da Empresa
                </CardTitle>
                <CardDescription>
                  O envio técnico usa o SMTP central do CoéPay. Seu e-mail entra como contato e replyTo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Nome da empresa</Label>
                    <Input
                      value={settings.company_name}
                      onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                      placeholder="Minha Empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail de contato</Label>
                    <Input
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Celular/WhatsApp</Label>
                    <Input
                      value={settings.contact_phone}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                      placeholder="5521999999999"
                    />
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  Remetente do sistema:{" "}
                  <strong>
                    {settings.system_sender_name || "CoéPay"} &lt;
                    {settings.system_sender_email || "não configurado"}&gt;
                  </strong>
                  {!settings.system_configured && (
                    <p className="text-red-600 mt-1">
                      SMTP central ainda não configurado no backend.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.email_enabled}
                      onChange={(e) => setSettings({ ...settings, email_enabled: e.target.checked })}
                    />
                    Ativar envio por e-mail
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.whatsapp_enabled}
                      onChange={(e) =>
                        setSettings({ ...settings, whatsapp_enabled: e.target.checked })
                      }
                    />
                    Ativar envio por WhatsApp
                  </label>
                </div>

                <Button onClick={saveSettings} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Templates</CardTitle>
                  <CardDescription>Modelos de e-mail e WhatsApp por tipo de evento.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {templates.map((template, index) => (
                    <div key={`${template.id || "default"}-${index}`} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {template.channel} • {template.event_type} {!template.id && "• padrão"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setTemplateForm(template)}>
                            Editar
                          </Button>
                          {template.id && (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => deleteTemplate(template)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {templateForm.id ? "Editar Template" : "Criar Template"}
                  </CardTitle>
                  <CardDescription>Variáveis disponíveis: {variablesText}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Canal</Label>
                      <select
                        value={templateForm.channel}
                        onChange={(e) =>
                          setTemplateForm({ ...templateForm, channel: e.target.value as "email" | "whatsapp" })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="email">E-mail</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <select
                        value={templateForm.event_type}
                        onChange={(e) => setTemplateForm({ ...templateForm, event_type: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {templateTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nome do template</Label>
                    <Input
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    />
                  </div>

                  {templateForm.channel === "email" && (
                    <div className="space-y-2">
                      <Label>Assunto</Label>
                      <Input
                        value={templateForm.subject || ""}
                        onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>{templateForm.channel === "email" ? "Corpo do e-mail" : "Mensagem"}</Label>
                    <Textarea
                      value={templateForm.body}
                      onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                      rows={10}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveTemplate} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Template
                    </Button>
                    <Button variant="outline" onClick={() => setTemplateForm(emptyTemplate)}>
                      Limpar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="avisos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Avisos Automáticos
                </CardTitle>
                <CardDescription>Defina quando os lembretes serão enviados.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end">
                  <Button variant="outline" onClick={addRule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar regra
                  </Button>
                </div>

                {rules.map((rule, index) => (
                  <div key={`${rule.id || "rule"}-${index}`} className="rounded-lg border p-3 space-y-3">
                    <div className="grid gap-3 md:grid-cols-[90px_1fr_150px_190px]">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={rule.active}
                          onChange={(e) => updateRule(index, { active: e.target.checked })}
                        />
                        Ativo
                      </label>
                      <Input
                        value={rule.name}
                        onChange={(e) => updateRule(index, { name: e.target.value })}
                      />
                      <select
                        value={rule.channel || "email"}
                        onChange={(e) => updateRule(index, { channel: e.target.value as ReminderRule["channel"] })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="email">E-mail</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="both">Ambos</option>
                      </select>
                      <select
                        value={rule.trigger_type}
                        onChange={(e) => updateRule(index, { trigger_type: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {ruleTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-3 md:grid-cols-4">
                      {rule.trigger_type !== "due_today" && (
                        <div className="space-y-1">
                          <Label>Dias</Label>
                          <Input
                            type="number"
                            min="0"
                            value={rule.days_offset ?? 0}
                            onChange={(e) => updateRule(index, { days_offset: Number(e.target.value) })}
                          />
                        </div>
                      )}
                      {rule.trigger_type === "repeat_after_due" && (
                        <div className="space-y-1">
                          <Label>Repetir a cada</Label>
                          <Input
                            type="number"
                            min="1"
                            value={rule.repeat_interval_days ?? 7}
                            onChange={(e) =>
                              updateRule(index, { repeat_interval_days: Number(e.target.value) })
                            }
                          />
                        </div>
                      )}
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => setRules((current) => current.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <Button onClick={saveRules} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Regras
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico de Envios
                </CardTitle>
                <CardDescription>Últimos 100 registros de e-mail e WhatsApp.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-4">Canal</th>
                        <th className="py-2 pr-4">Destinatário</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Data</th>
                        <th className="py-2 pr-4">Cobrança</th>
                        <th className="py-2 pr-4">Cliente</th>
                        <th className="py-2 pr-4">Erro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b">
                          <td className="py-2 pr-4">{log.channel}</td>
                          <td className="py-2 pr-4">{log.recipient}</td>
                          <td className="py-2 pr-4">
                            <Badge variant={getStatusVariant(log.status)}>
                              {getStatusLabel(log.status)}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4">
                            {formatDate(log.sent_at || log.sentAt || log.created_at || log.createdAt)}
                          </td>
                          <td className="py-2 pr-4">{log.charge_id || "-"}</td>
                          <td className="py-2 pr-4">{log.customer_name || "-"}</td>
                          <td className="py-2 pr-4 max-w-md truncate">
                            {friendlyError(log.error_message)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Logs técnicos</CardTitle>
                <CardDescription>
                  Área resumida para suporte. Mensagens técnicas detalhadas ficam no backend.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {logs
                  .filter((log) => log.status === "failed")
                  .slice(0, 20)
                  .map((log) => (
                    <div key={log.id} className="rounded-lg border p-3 text-sm">
                      <p className="font-medium">
                        {log.channel} • {formatDate(log.created_at || log.createdAt)}
                      </p>
                      <p className="text-muted-foreground">{friendlyError(log.error_message)}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
