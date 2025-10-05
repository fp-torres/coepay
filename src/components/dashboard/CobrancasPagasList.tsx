import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface Cobranca {
  id: string;
  nomeDevedor: string;
  valor: number;
  dataVencimento: string;
  status: "ativa" | "vencida" | "paga";
  link: string;
}

interface CobrancasPagasListProps {
  cobrancas: Cobranca[];
}

export const CobrancasPagasList = ({ cobrancas }: CobrancasPagasListProps) => {
  const [mostrarCard, setMostrarCard] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  const cobrancasPagas = cobrancas.filter((c) => c.status === "paga");
  const totalPaginas = Math.ceil(cobrancasPagas.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const cobrancasPaginadas = cobrancasPagas.slice(inicio, fim);

  return (
    <div className="space-y-4">
      {/* Botão para abrir/fechar o card */}
      <Button
        onClick={() => setMostrarCard(!mostrarCard)}
        variant="outline"
        className="flex items-center justify-center gap-2 w-full sm:w-auto mx-auto border-green-200 hover:bg-green-50 text-green-700 font-semibold shadow-sm transition"
      >
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        {mostrarCard ? "Ocultar Cobranças Pagas" : "Ver Cobranças Pagas"}
        {mostrarCard ? (
          <ChevronUp className="h-4 w-4 text-green-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-green-600" />
        )}
      </Button>

      {mostrarCard && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle>Cobranças Pagas</CardTitle>
            </div>
            <CardDescription>
              {cobrancasPagas.length} cobrança(s) recebida(s)
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {cobrancasPaginadas.map((cobranca) => {
                const dataFormatada = new Date(
                  cobranca.dataVencimento
                ).toLocaleDateString("pt-BR");

                return (
                  <div
                    key={cobranca.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-3 border rounded-lg bg-green-50/50"
                  >
                    {/* Informações */}
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{cobranca.nomeDevedor}</h3>
                        <Badge className="bg-green-600 hover:bg-green-600">
                          Paga
                        </Badge>
                      </div>

                      {/* Valores */}
                      <div className="flex items-end gap-2">
                        <p className="text-lg md:text-xl font-bold text-green-600">
                          R${" "}
                          {cobranca.valor.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Vencimento: {dataFormatada}
                      </p>
                    </div>

                    {/* Botão */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(cobranca.link, "_blank")}
                        className="flex items-center justify-center w-full md:w-auto border font-semibold shadow-sm
                          hover:bg-gradient-to-r hover:from-coepay-primary hover:to-coepay-secondary hover:text-white transition"
                      >
                        Ver Comprovante
                      </Button>
                    </div>
                  </div>
                );
              })}

              {cobrancasPagas.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">
                    Nenhuma cobrança paga ainda
                  </p>
                </div>
              )}
            </div>

            {/* Paginação */}
            {cobrancasPagas.length > itensPorPagina && (
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
      )}
    </div>
  );
};
