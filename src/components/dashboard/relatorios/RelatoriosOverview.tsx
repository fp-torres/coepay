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
  
  const valorTotalOriginal = cobrancas.reduce((sum, c) => sum + c.valor, 0);
  const valorTotalAtual = cobrancas.reduce((sum, c) => sum + (c.valorAtual || c.valor), 0);
  
  const percentualRecuperacao = totalCobrancas > 0 ? (cobrancasAtivas.length / totalCobrancas) * 100 : 0;
  const ticketMedio = totalCobrancas > 0 ? valorTotalOriginal / totalCobrancas : 0;

  // Distribuição por faixas de valor
  const faixasValor = {
    ate100: cobrancas.filter(c => c.valor <= 100).length,
    ate500: cobrancas.filter(c => c.valor > 100 && c.valor <= 500).length,
    ate1000: cobrancas.filter(c => c.valor > 500 && c.valor <= 1000).length,
    acima1000: cobrancas.filter(c => c.valor > 1000).length,
  };

  return (
    <div className="space-y-8">
      {/* Cards principais com gradientes e sombras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-flowpay-primary bg-gradient-to-br from-card to-flowpay-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Cobranças</CardTitle>
            <div className="p-2 rounded-full bg-flowpay-primary/10">
              <DollarSign className="h-5 w-5 text-flowpay-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-flowpay-primary">{totalCobrancas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {cobrancasAtivas.length} ativas, {cobrancasVencidas.length} vencidas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-flowpay-success bg-gradient-to-br from-card to-flowpay-success/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
            <div className="p-2 rounded-full bg-flowpay-success/10">
              <TrendingUp className="h-5 w-5 text-flowpay-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-flowpay-success">R$ {valorTotalAtual.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Original: R$ {valorTotalOriginal.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-flowpay-secondary bg-gradient-to-br from-card to-flowpay-secondary/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
            <div className="p-2 rounded-full bg-flowpay-secondary/10">
              <BarChart3 className="h-5 w-5 text-flowpay-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-flowpay-secondary">R$ {ticketMedio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Por cobrança criada
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-flowpay-warning bg-gradient-to-br from-card to-flowpay-warning/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Recuperação</CardTitle>
            <div className="p-2 rounded-full bg-flowpay-warning/10">
              <PieChart className="h-5 w-5 text-flowpay-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-flowpay-warning">{percentualRecuperacao.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cobranças não vencidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Faixas de Valor */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="bg-gradient-to-r from-flowpay-primary/5 to-flowpay-secondary/5 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-flowpay-primary">Distribuição por Faixas de Valor</CardTitle>
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