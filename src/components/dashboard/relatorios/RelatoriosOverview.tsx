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
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cobranças</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCobrancas}</div>
            <p className="text-xs text-muted-foreground">
              {cobrancasAtivas.length} ativas, {cobrancasVencidas.length} vencidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {valorTotalAtual.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Original: R$ {valorTotalOriginal.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {ticketMedio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Por cobrança criada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Recuperação</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{percentualRecuperacao.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Cobranças não vencidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Faixas de Valor */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Faixas de Valor</CardTitle>
          <CardDescription>Análise das cobranças por valor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Até R$ 100</span>
              <div className="flex items-center gap-2">
                <div className="bg-green-500 h-3 rounded-full" style={{width: `${Math.max((faixasValor.ate100/totalCobrancas)*150, 10)}px`}}></div>
                <Badge variant="outline">{faixasValor.ate100}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>R$ 101 - R$ 500</span>
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 h-3 rounded-full" style={{width: `${Math.max((faixasValor.ate500/totalCobrancas)*150, 10)}px`}}></div>
                <Badge variant="outline">{faixasValor.ate500}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>R$ 501 - R$ 1.000</span>
              <div className="flex items-center gap-2">
                <div className="bg-orange-500 h-3 rounded-full" style={{width: `${Math.max((faixasValor.ate1000/totalCobrancas)*150, 10)}px`}}></div>
                <Badge variant="outline">{faixasValor.ate1000}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Acima de R$ 1.000</span>
              <div className="flex items-center gap-2">
                <div className="bg-red-500 h-3 rounded-full" style={{width: `${Math.max((faixasValor.acima1000/totalCobrancas)*150, 10)}px`}}></div>
                <Badge variant="outline">{faixasValor.acima1000}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};