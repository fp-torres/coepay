import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

interface RelatoriosJurosProps {
  cobrancas: Cobranca[];
}

export const RelatoriosJuros = ({ cobrancas }: RelatoriosJurosProps) => {
  const cobrancasVencidas = cobrancas.filter(c => c.status === 'vencida');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento dos Juros Aplicados</CardTitle>
          <CardDescription>Análise detalhada do impacto dos juros compostos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cobrancasVencidas.map((cobranca) => {
              const diasVencido = Math.floor((new Date().getTime() - new Date(cobranca.dataVencimento).getTime()) / (1000 * 60 * 60 * 24));
              const jurosPorCobranca = (cobranca.valorAtual || cobranca.valor) - cobranca.valor;
              
              return (
                <div key={cobranca.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-lg">{cobranca.nomeDevedor}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {diasVencido} dias vencido • {cobranca.taxaJuros}% {cobranca.tipoJuros}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Vencimento: {new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">R$ {(cobranca.valorAtual || cobranca.valor).toFixed(2)}</div>
                    <div className="text-sm text-green-600 font-medium">
                      +R$ {jurosPorCobranca.toFixed(2)} em juros
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Valor original: R$ {cobranca.valor.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
            {cobrancasVencidas.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-lg font-medium mb-2">Parabéns!</h3>
                <p>Nenhuma cobrança vencida com juros aplicados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {cobrancasVencidas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Juros</CardTitle>
            <CardDescription>Impacto total dos juros no portfólio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{cobrancasVencidas.length}</div>
                <p className="text-sm text-muted-foreground">Cobranças vencidas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  R$ {cobrancasVencidas.reduce((sum, c) => sum + ((c.valorAtual || c.valor) - c.valor), 0).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Total em juros</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {cobrancasVencidas.length > 0 
                    ? (cobrancasVencidas.reduce((sum, c) => sum + Math.floor((new Date().getTime() - new Date(c.dataVencimento).getTime()) / (1000 * 60 * 60 * 24)), 0) / cobrancasVencidas.length).toFixed(0)
                    : 0
                  }
                </div>
                <p className="text-sm text-muted-foreground">Dias médios de atraso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};