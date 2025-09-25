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
  status: 'ativa' | 'vencida';
  link: string;
  taxaJuros?: number;
  tipoJuros?: 'mensal' | 'diario';
}

interface CobrancasListProps {
  cobrancas: Cobranca[];
  onCopiarLink: (link: string) => void;
  onExcluirCobranca: (id: string) => void;
}

export const CobrancasList = ({ cobrancas, onCopiarLink, onExcluirCobranca }: CobrancasListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suas Cobranças</CardTitle>
        <CardDescription>{cobrancas.length} cobrança(s) cadastrada(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {cobrancas.map((cobranca) => {
            const vencimento = new Date(cobranca.dataVencimento);
            const hoje = new Date();
            const estaVencida = hoje > vencimento;
            const dataFormatada = vencimento.toLocaleDateString('pt-BR');

            return (
              <div key={cobranca.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{cobranca.nomeDevedor}</h3>
                    <Badge variant={cobranca.status === 'ativa' ? 'default' : 'destructive'}>
                      {cobranca.status === 'ativa' ? 'No prazo' : 'Vencida'}
                    </Badge>
                  </div>

                  {/* Valores originais*/}
                  <div className="flex items-end gap-2">
                    <p className="text-xl font-bold text-red-600">
                      R$ {(cobranca.valorAtual || cobranca.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {cobranca.valorAtual &&
                      cobranca.valorAtual !== cobranca.valor && (
                        <p className="text-sm text-muted-foreground line-through">
                          R$ {cobranca.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      )}
                  </div>
                  <p className="text-xs text-blue-600">
                    {cobranca.taxaJuros
                      ? `Juros: ${cobranca.taxaJuros}% ${cobranca.tipoJuros === 'diario' ? 'ao dia' : 'ao mês'}`
                      : "Sem juros"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {estaVencida ? `Vencida em: ${dataFormatada}` : `Vence em: ${dataFormatada}`}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(cobranca.link, "_blank")}
                  >
                    Abrir Cobrança
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopiarLink(cobranca.link)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onExcluirCobranca(cobranca.id)}
                  className="bg-red-700 hover:bg-red-800"
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
      </CardContent>
    </Card>
  );
};