import { useState } from "react";
import { useCobrancas } from "@/hooks/useCobrancas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Loader2, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Cobranca {
  id: string;
  nomeDevedor: string;
  valor: number;
  valorAtual?: number;
  dataVencimento: string;
  status: "ativa" | "vencida" | "paga";
  link: string;
  taxaJuros?: number;
  tipoJuros?: "mensal" | "diario" | "anual";
  metodoCalculo?: "simples" | "composto";
  emailUltimoEnvioEm?: string;
  emailUltimoStatus?: string;
  recorrenciaTipo?: string;
  recorrenciaGrupoId?: string;
  telefone?: string;
  whatsappDevedor?: string;
}

interface CobrancasListProps {
  cobrancas: Cobranca[];
  onCopiarLink: (link: string) => void;
  onExcluirCobranca: (id: string) => void;
}
export const CobrancasListWrapper = ({
  userId,
  onCopiarLink,
  onExcluirCobranca,
}: {
  userId: number;
  onCopiarLink: (link: string) => void;
  onExcluirCobranca: (id: string) => void;
}) => {
  const { cobrancas } = useCobrancas(userId);

  return (
    <CobrancasList
      cobrancas={cobrancas}
      onCopiarLink={onCopiarLink}
      onExcluirCobranca={onExcluirCobranca}
    />
  );
};
export const CobrancasList = ({
  cobrancas,
  onCopiarLink,
  onExcluirCobranca,
}: CobrancasListProps) => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [sendingEmailChargeId, setSendingEmailChargeId] = useState<string | null>(null);
  const [sendingWhatsappChargeId, setSendingWhatsappChargeId] = useState<string | null>(null);
  const itensPorPagina = 6;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const totalPaginas = Math.ceil(cobrancas.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const cobrancasPaginadas = cobrancas.slice(inicio, fim);

  const handleSendEmail = async (chargeId: string) => {
    setSendingEmailChargeId(chargeId);

    try {
      const response = await fetch(`${API_URL}/orders/${chargeId}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(currentUser?.id || ""),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível enviar o e-mail.");
      }

      toast.success("Cobrança enviada por e-mail", {
        description: data.sentTo ? `Enviado para ${data.sentTo}.` : "O devedor recebeu o link da cobrança.",
      });
    } catch (error) {
      toast.error("Erro ao enviar e-mail", {
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
      });
    } finally {
      setSendingEmailChargeId(null);
    }
  };

  const handleSendWhatsapp = async (chargeId: string) => {
    setSendingWhatsappChargeId(chargeId);

    try {
      const response = await fetch(`${API_URL}/orders/${chargeId}/send-whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(currentUser?.id || ""),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível enviar o WhatsApp.");
      }

      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }

      toast.success("Cobrança enviada por WhatsApp", {
        description: data.fallback
          ? "Link do WhatsApp Web gerado para envio manual."
          : data.sentTo
          ? `Enviado para ${data.sentTo}.`
          : "Mensagem enviada.",
      });
    } catch (error) {
      toast.error("Erro ao enviar WhatsApp", {
        description: error instanceof Error ? error.message : "Conecte o WhatsApp e tente novamente.",
      });
    } finally {
      setSendingWhatsappChargeId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suas Cobranças</CardTitle>
        <CardDescription>
          {cobrancas.length} cobrança(s) cadastrada(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {cobrancasPaginadas.map((cobranca) => {
            const vencimento = new Date(cobranca.dataVencimento);
            const hoje = new Date();
            const estaVencida = hoje > vencimento;
            const dataFormatada = vencimento.toLocaleDateString("pt-BR");

            return (
          <div
            key={cobranca.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-3 border rounded-lg"
            >
              {/* Informações */}
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{cobranca.nomeDevedor}</h3>
                  <Badge
                    variant={
                      cobranca.status === "paga" 
                        ? "default" 
                        : cobranca.status === "ativa" 
                        ? "default" 
                        : "destructive"
                    }
                    className={
                      cobranca.status === "paga"
                        ? "bg-green-600 hover:bg-green-600"
                        : ""
                    }
                  >
                    {cobranca.status === "paga" 
                      ? "Paga" 
                      : cobranca.status === "ativa" 
                      ? "No prazo" 
                      : "Vencida"}
                  </Badge>
                </div>

                {/* Valores */}
                <div className="flex items-end gap-2">
                  <p className="text-lg md:text-xl font-bold text-red-600">
                    R${" "}
                    {(cobranca.valorAtual || cobranca.valor).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  {cobranca.valorAtual && cobranca.valorAtual !== cobranca.valor && (
                    <p className="text-sm text-muted-foreground line-through">
                      R${" "}
                      {cobranca.valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  )}
                </div>

                <p className="text-xs text-blue-600">
                  {cobranca.taxaJuros
                    ? `Juros ${cobranca.metodoCalculo === 'simples' ? 'Simples' : 'Compostos'}: ${cobranca.taxaJuros}% ${
                        cobranca.tipoJuros === "diario" 
                          ? "ao dia" 
                          : cobranca.tipoJuros === "anual" 
                          ? "ao ano" 
                          : "ao mês"
                      }`
                    : "Sem juros"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {estaVencida
                    ? `Vencida em: ${dataFormatada}`
                    : `Vence em: ${dataFormatada}`}
                </p>
                {cobranca.recorrenciaTipo && cobranca.recorrenciaTipo !== "unica" && (
                  <p className="text-xs text-purple-700">
                    Recorrência: {cobranca.recorrenciaTipo.replace(/_/g, " ")}
                  </p>
                )}
                {cobranca.emailUltimoEnvioEm && (
                  <p className="text-xs text-muted-foreground">
                    Último e-mail:{" "}
                    {new Date(cobranca.emailUltimoEnvioEm).toLocaleString("pt-BR")} (
                    {cobranca.emailUltimoStatus === "sent" ? "enviado" : "falhou"})
                  </p>
                )}
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(cobranca.link, "_blank")}
                  className="flex items-center justify-center w-full md:w-auto border font-semibold shadow-sm
                    hover:bg-gradient-to-r hover:from-coepay-primary hover:to-coepay-secondary hover:text-white transition"
                >
                  Abrir Cobrança
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopiarLink(cobranca.link)}
                  className="flex items-center justify-center w-full md:w-auto border font-semibold shadow-sm
                    hover:bg-gradient-to-r hover:from-coepay-primary hover:to-coepay-secondary hover:text-white transition"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendEmail(cobranca.id)}
                  disabled={sendingEmailChargeId === cobranca.id}
                  className="flex items-center justify-center w-full md:w-auto border font-semibold shadow-sm
                    hover:bg-gradient-to-r hover:from-coepay-primary hover:to-coepay-secondary hover:text-white transition"
                >
                  {sendingEmailChargeId === cobranca.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Enviar por E-mail
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendWhatsapp(cobranca.id)}
                  disabled={sendingWhatsappChargeId === cobranca.id}
                  className="flex items-center justify-center w-full md:w-auto border font-semibold shadow-sm
                    hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-700 hover:text-white transition"
                >
                  {sendingWhatsappChargeId === cobranca.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-2" />
                  )}
                  Enviar WhatsApp
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onExcluirCobranca(cobranca.id)}
                  className="w-full md:w-auto bg-red-700 text-white font-semibold shadow-sm rounded-sm
                    hover:bg-gradient-to-r hover:from-red-600 hover:to-red-800 transition"
                >
                  Excluir
                </Button>
              </div>
            </div>
            );
          })}

          {cobrancas.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma cobrança cadastrada ainda
            </p>
          )}
        </div>

        {/* Paginação */}
        {cobrancas.length > itensPorPagina && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual(paginaAtual - 1)}
            >
              Anterior
            </Button>

            {Array.from({ length: totalPaginas }).map((_, index) => (
              <Button
                key={index}
                size="sm"
                variant={paginaAtual === index + 1 ? "default" : "outline"}
                onClick={() => setPaginaAtual(index + 1)}
              >
                {index + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPaginaAtual(paginaAtual + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
