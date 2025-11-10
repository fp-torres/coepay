import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, BarChart3, PieChart, Star, Clock  } from "lucide-react";

interface Cobranca {
  id: string;
  nomeDevedor: string;
  valor: number;
  valorAtual?: number;
  dataVencimento: string;
  status: 'ativa' | 'vencida' | 'paga';
  link: string;
  taxaJuros?: number;
  tipoJuros?: 'mensal' | 'diario' | 'anual';
}

interface RelatoriosOverviewProps {
  cobrancas: Cobranca[];
}

export const RelatoriosOverview = ({ cobrancas }: RelatoriosOverviewProps) => {
  const cobrancasNaoPagas = cobrancas.filter(c => c.status !== 'paga');
  const cobrancasPagas = cobrancas.filter(c => c.status === 'paga');
  const totalCobrancas = cobrancasNaoPagas.length;
  const cobrancasAtivas = cobrancasNaoPagas.filter(c => c.status === 'ativa');
  const cobrancasVencidas = cobrancasNaoPagas.filter(c => c.status === 'vencida');

  const valorTotalOriginal = cobrancasNaoPagas.reduce((sum, c) => sum + (Number(c.valor) || 0), 0);
  const valorTotalAtual = cobrancasNaoPagas.reduce((sum, c) => sum + (Number(c.valorAtual) || Number(c.valor) || 0), 0);
  const valorTotalPago = cobrancasPagas.reduce((sum, c) => sum + (Number(c.valor) || 0), 0);

  // Percentual de recuperação
  const percentualRecuperacaoQtd = totalCobrancas > 0 ? (cobrancasAtivas.length / totalCobrancas) * 100 : 0;
  const percentualRecuperacaoValor = valorTotalOriginal > 0
    ? (cobrancasAtivas.reduce((sum, c) => sum + Number(c.valor), 0) / valorTotalOriginal) * 100
    : 0;

  // Ticket médio
  const ticketMedio = totalCobrancas > 0 ? valorTotalOriginal / totalCobrancas : 0;
  const ticketMedioAtivas = cobrancasAtivas.length > 0
    ? cobrancasAtivas.reduce((sum, c) => sum + Number(c.valor), 0) / cobrancasAtivas.length
    : 0;
  const ticketMedioVencidas = cobrancasVencidas.length > 0
    ? cobrancasVencidas.reduce((sum, c) => sum + Number(c.valor), 0) / cobrancasVencidas.length
    : 0;

  // Faixas de valor
  const faixasValor = {
    ate100: cobrancasNaoPagas.filter(c => Number(c.valor) <= 100).length,
    de101a500: cobrancasNaoPagas.filter(c => Number(c.valor) > 100 && Number(c.valor) <= 500).length,
    de501a1000: cobrancasNaoPagas.filter(c => Number(c.valor) > 500 && Number(c.valor) <= 1000).length,
    acima1000: cobrancasNaoPagas.filter(c => Number(c.valor) > 1000).length,
  };

  // Faixas de atraso
  const faixasAtraso = {
    ate7: cobrancasVencidas.filter(c => {
      const dias = (new Date().getTime() - new Date(c.dataVencimento).getTime()) / (1000*60*60*24);
      return dias <= 7;
    }).length,
    de8a30: cobrancasVencidas.filter(c => {
      const dias = (new Date().getTime() - new Date(c.dataVencimento).getTime()) / (1000*60*60*24);
      return dias > 7 && dias <= 30;
    }).length,
    acima30: cobrancasVencidas.filter(c => {
      const dias = (new Date().getTime() - new Date(c.dataVencimento).getTime()) / (1000*60*60*24);
      return dias > 30;
    }).length,
  };
  // Top 3 cobranças
  const topCobrancas = [...cobrancasNaoPagas].sort((a, b) => (b.valorAtual || b.valor) - (a.valorAtual || a.valor)).slice(0,3);

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
              {cobrancasAtivas.length} ativas • {cobrancasVencidas.length} vencidas • {cobrancasPagas.length} pagas
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
            <CardTitle className="text-sm font-medium">Valor a Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coepay-success">
              R$ {valorTotalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <CardDescription>
              Original: R$ {valorTotalOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardDescription>
            <p className="text-[11px] text-muted-foreground mt-1">
              Soma de todos os valores de cobranças ativas e vencidas, considerando juros aplicados.
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
              R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <CardDescription>
              Ativas: R$ {ticketMedioAtivas.toFixed(2)} • Vencidas: R$ {ticketMedioVencidas.toFixed(2)}
            </CardDescription>
            <p className="text-[11px] text-muted-foreground mt-1">
              Valor médio das cobranças registradas no sistema.
            </p>
          </CardContent>
        </Card>

        {/* Percentual de Recuperação */}
        <Card className="border-coepay-warning hover:shadow-lg hover:scale-105 transition-all duration-300">
          <CardHeader className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-coepay-warning" />
            <CardTitle className="text-sm font-medium">Cobranças em Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coepay-warning">
              {percentualRecuperacaoQtd.toFixed(1)}%
            </div>
            <CardDescription>
              Por quantidade: {percentualRecuperacaoQtd.toFixed(1)}% • Por valor: {percentualRecuperacaoValor.toFixed(1)}%
            </CardDescription>
            <p className="text-[11px] text-muted-foreground mt-1">
              Mostra o percentual de cobranças ainda em dia, tanto pelo número de cobranças quanto pelo valor financeiro.
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
            {[
              { label: 'Até R$ 100', key: 'ate100', color: 'red' },       
              { label: 'R$ 101 - 500', key: 'de101a500', color: 'orange' },
              { label: 'R$ 501 - 1.000', key: 'de501a1000', color: 'blue' },
              { label: 'Acima de R$ 1.000', key: 'acima1000', color: 'green' } 
            ].map(faixa => (
              <div 
                key={faixa.key} 
                className={`
                  flex items-center justify-between p-4 rounded-lg 
                  bg-gradient-to-r from-${faixa.color}-500/5 to-${faixa.color}-500/10
                  dark:from-${faixa.color}-900/10 dark:to-${faixa.color}-800/10
                  border border-${faixa.color}-200/40 dark:border-${faixa.color}-800/40
                  transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
                `}
              >
                <span className={`font-medium text-${faixa.color}-700 dark:text-${faixa.color}-200`}>
                  {faixa.label}
                </span>
                <div className="flex items-center gap-3">
                  <div 
                    className={`bg-${faixa.color}-500/60 h-4 rounded-full shadow-sm`} 
                    style={{width: `${Math.max((faixasValor[faixa.key]/totalCobrancas)*120, 20)}px`}}
                  ></div>
                  <Badge 
                    variant="secondary" 
                    className={`bg-${faixa.color}-100/60 text-${faixa.color}-800 border-${faixa.color}-300/50`}
                  >
                    {faixasValor[faixa.key]}
                  </Badge>
                </div>
              </div>
            ))}

          </div>
        </CardContent>
      </Card>
      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted/20">
      <CardHeader className="bg-gradient-to-r from-coepay-primary/5 to-coepay-secondary/5 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-coepay-primary">Distribuição por Faixas de Atraso</CardTitle>
          <CardDescription className="text-base">Análise das cobranças vencidas por tempo de atraso</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {[
                { label: 'Até 7 dias', key: 'ate7', color: 'green' },
                { label: '8 a 30 dias', key: 'de8a30', color: 'orange' },
                { label: 'Acima de 30 dias', key: 'acima30', color: 'red' }
              ].map(faixa => (
                <div 
                  key={faixa.key} 
                  className={`
                    flex items-center justify-between p-4 rounded-lg 
                    bg-gradient-to-r from-${faixa.color}-500/5 to-${faixa.color}-500/10
                    dark:from-${faixa.color}-900/10 dark:to-${faixa.color}-800/10
                    border border-${faixa.color}-200/40 dark:border-${faixa.color}-800/40
                    transition-all duration-300 hover:-translate-y-1 hover:shadow-lg

                  `}
                >
                  <span className={`font-medium text-${faixa.color}-800 dark:text-${faixa.color}-200`}>
                    {faixa.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <div 
                      className={`bg-${faixa.color}-500 h-4 rounded-full shadow-sm`} 
                      style={{width: `${Math.max((faixasAtraso[faixa.key]/cobrancasVencidas.length)*120, 20)}px`}}
                    ></div>
                    <Badge variant="secondary" className={`bg-${faixa.color}-100 text-${faixa.color}-800 border-${faixa.color}-300`}>
                      {faixasAtraso[faixa.key]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
{/* Top 3 Cobranças */}
<Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted/20">
  <CardHeader className="bg-gradient-to-r from-coepay-primary/5 to-coepay-secondary/5 rounded-t-lg">
    <CardTitle className="text-xl font-bold text-coepay-primary">Top 3 Cobranças</CardTitle>
    <CardDescription className="text-base">Valores mais altos do mês</CardDescription>
  </CardHeader>
  <CardContent className="pt-6 space-y-4">
    {topCobrancas.map((c, index) => {
      const corBadge = (c.valorAtual || c.valor) > 1000 ? 'green' : (c.valorAtual || c.valor) > 500 ? 'blue' : 'orange';
      return (
        <div
          key={c.id}
          className={`
            flex items-center justify-between p-4 rounded-lg 
            bg-gradient-to-r from-${corBadge}-500/5 to-${corBadge}-500/10
            dark:from-${corBadge}-900/10 dark:to-${corBadge}-800/10
            border border-${corBadge}-200/40 dark:border-${corBadge}-800/40
            transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
          `}
        >
          <span className={`font-medium text-${corBadge}-800 dark:text-${corBadge}-200 truncate max-w-[120px]`}>
            {index + 1}. {c.nomeDevedor}
          </span>
          <Badge
            variant="secondary"
            className={`bg-${corBadge}-100 text-${corBadge}-800 border-${corBadge}-300 font-bold px-3 py-1`}
          >
            R$ {(c.valorAtual || c.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Badge>
        </div>
      )
    })}
  </CardContent>
</Card>



      {/* Futuro: gráficos de tendência mensal, recuperação por faixa, distribuição geográfica */}
    </div>
  );
};
