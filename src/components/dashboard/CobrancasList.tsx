import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";

interface Cobranca {
  id: string;
  nomeDevedor: string;
  valor: number;
  valorAtual?: number;
  dataVencimento: string;
  status: "ativa" | "vencida" | "paga";
  link: string;
  taxaJuros?: number;
  tipoJuros?: "mensal" | "diario";
}

interface CobrancasListProps {
  cobrancas: Cobranca[];
  onCopiarLink: (link: string) => void;
  onExcluirCobranca: (id: string) => void;
}

export const CobrancasList = ({
  cobrancas,
  onCopiarLink,
  onExcluirCobranca,
}: CobrancasListProps) => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  const totalPaginas = Math.ceil(cobrancas.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const cobrancasPaginadas = cobrancas.slice(inicio, fim);

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
                    ? `Juros: ${cobranca.taxaJuros}% ${
                        cobranca.tipoJuros === "diario" ? "ao dia" : "ao mês"
                      }`
                    : "Sem juros"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {estaVencida
                    ? `Vencida em: ${dataFormatada}`
                    : `Vence em: ${dataFormatada}`}
                </p>
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
