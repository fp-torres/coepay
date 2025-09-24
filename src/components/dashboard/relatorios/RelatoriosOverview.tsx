import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, BarChart3, PieChart } from "lucide-react";

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

interface RelatoriosOverviewProps {
  cobrancas: Cobranca[];
}

export const RelatoriosOverview = ({ cobrancas }: RelatoriosOverviewProps) => {
  const totalCobrancas = cobrancas.length;
  const cobrancasAtivas = cobrancas.filter(c => c.status === 'ativa');
  const cobrancasVencidas = cobrancas.filter(c => c.status === 'vencida');

  const valorTotalOriginal = cobrancas.reduce((sum, c) => sum + (typeof c.valor === 'number' ? c.valor : 0), 0);

  const valorTotalAtual = cobrancas.reduce((sum, c) => {
    const atual = typeof c.valorAtual === 'number' ? c.valorAtual : c.valor;
    return sum + (typeof atual === 'number' ? atual : 0);
  }, 0);

  const percentualRecuperacao = totalCobrancas > 0 ? (cobrancasAtivas.length / totalCobrancas) * 100 : 0;
  const ticketMedio = totalCobrancas > 0 ? valorTotalOriginal / totalCobrancas : 0;

  const faixasValor = {
    ate100: cobrancas.filter(c => c.valor <= 100).length,
    ate500: cobrancas.filter(c => c.valor > 100 && c.valor <= 500).length,
    ate1000: cobrancas.filter(c => c.valor > 500 && c.valor <= 1000).length,
    acima1000: cobrancas.filter(c => c.valor > 1000).length,
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Cobranças */}
          <Card className="border-coepay-primary hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardHeader className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-coepay-primary" />
        <CardTitle className="text-sm font-medium">Total de Cobranças</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coepay-primary">{totalCobrancas}</div>
            <CardDescription>
              {cobrancasAtivas.length} ativas • {cobrancasVencidas.length} vencidas
            </CardDescription>
            <p className="text-[11px] text-muted-foreground mt-1">
              Número total de cobranças registradas no sistema.
            </p>
          </CardContent>
        </Card>

        {/* Valor Total */}
          <Card className="border-coepay-success hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardHeader className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-coepay-success" />
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coepay-success">
              R$ {Number(valorTotalAtual).toFixed(2)}
            </div>
            <CardDescription>
              Original: R$ {Number(valorTotalOriginal).toFixed(2)}
            </CardDescription>
            <p className="text-[11px] text-muted-foreground mt-1">
              Soma de todos os valores de cobranças, considerando juros aplicados.
            </p>
          </CardContent>
        </Card>

        {/* Ticket Médio */}
          <Card className="border-coepay-secondary hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardHeader className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-coepay-secondary" />
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coepay-secondary">
              R$ {Number(ticketMedio).toFixed(2)}
            </div>
            <CardDescription>
              Por cobrança criada
            </CardDescription>
            <p className="text-[11px] text-muted-foreground mt-1">
              Valor médio das cobranças registradas no sistema.
            </p>
          </CardContent>
        </Card>

        {/* Taxa de Recuperação */}
          <Card className="border-coepay-warning hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardHeader className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-coepay-warning" />
          <CardTitle className="text-sm font-medium">Taxa de Recuperação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coepay-warning">
              {percentualRecuperacao.toFixed(1)}%
            </div>
            <CardDescription>
              Cobranças não vencidas
            </CardDescription>
            <p className="text-[11px] text-muted-foreground mt-1">
              Percentual de cobranças ainda em dia em relação ao total.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Faixas de Valor */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="bg-gradient-to-r from-coepay-primary/5 to-coepay-secondary/5 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-coepay-primary">Distribuição por Faixas de Valor</CardTitle>
          <CardDescription className="text-base">Análise das cobranças por valor</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
              <span className="font-medium text-green-800 dark:text-green-200">Até R$ 100</span>
              <div className="flex items-center gap-3">
                <div className="bg-green-500 h-4 rounded-full shadow-sm" style={{width: `${Math.max((faixasValor.ate100/totalCobrancas)*120, 20)}px`}}></div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">{faixasValor.ate100}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
              <span className="font-medium text-blue-800 dark:text-blue-200">R$ 101 - R$ 500</span>
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 h-4 rounded-full shadow-sm" style={{width: `${Math.max((faixasValor.ate500/totalCobrancas)*120, 20)}px`}}></div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">{faixasValor.ate500}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
              <span className="font-medium text-orange-800 dark:text-orange-200">R$ 501 - R$ 1.000</span>
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 h-4 rounded-full shadow-sm" style={{width: `${Math.max((faixasValor.ate1000/totalCobrancas)*120, 20)}px`}}></div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">{faixasValor.ate1000}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800">
              <span className="font-medium text-red-800 dark:text-red-200">Acima de R$ 1.000</span>
              <div className="flex items-center gap-3">
                <div className="bg-red-500 h-4 rounded-full shadow-sm" style={{width: `${Math.max((faixasValor.acima1000/totalCobrancas)*120, 20)}px`}}></div>
                <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300">{faixasValor.acima1000}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};