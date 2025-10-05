import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, TrendingUp } from "lucide-react";

interface Cobranca {
  id: string;
  nomeDevedor: string;
  valor: number;
  valorAtual?: number;
  dataVencimento: string;
  status: 'ativa' | 'vencida' | 'paga';
  link: string;
  taxaJuros?: number;
  tipoJuros?: 'mensal' | 'diario';
}

interface RelatoriosTemporalProps {
  cobrancas: Cobranca[];
}

export const RelatoriosTemporal = ({ cobrancas }: RelatoriosTemporalProps) => {
  const cobrancasNaoPagas = cobrancas.filter(c => c.status !== 'paga');
  const cobrancasAtivas = cobrancasNaoPagas.filter(c => c.status === 'ativa');

  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 30);
  
  const cobrancasRecentes = cobrancasNaoPagas.filter(c => new Date(c.dataVencimento) >= dataLimite);

  const proximosVencimentos = cobrancasAtivas
    .filter(c => {
      const diasParaVencer = Math.ceil((new Date(c.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diasParaVencer <= 7 && diasParaVencer >= 0;
    })
    .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());

  const valorTotal = cobrancasRecentes.reduce((sum, c) => sum + c.valor, 0);
  const ticketMedio = cobrancasRecentes.length > 0 ? (valorTotal / cobrancasRecentes.length) : 0;
  const maiorCobranca = cobrancasRecentes.length > 0 ? Math.max(...cobrancasRecentes.map(c => c.valor)) : 0;
  const menorCobranca = cobrancasRecentes.length > 0 ? Math.min(...cobrancasRecentes.map(c => c.valor)) : 0;

  return (
    <div className="space-y-6">
      {/* Resumo 30 dias */}
      <Card className="bg-white shadow-lg border-0 rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Resumo dos Últimos 30 Dias</CardTitle>
          <CardDescription>Análise das cobranças recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-coepay-primary">{cobrancasRecentes.length}</div>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" /> Total de cobranças
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-coepay-secondary">R$ {valorTotal.toFixed(2)}</div>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <DollarSign className="w-4 h-4" /> Valor total
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold">R$ {ticketMedio.toFixed(2)}</div>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <DollarSign className="w-4 h-4" /> Ticket médio
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-green-600">R$ {maiorCobranca.toFixed(2)}</div>
              <p className="text-sm text-gray-500">Maior cobrança</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-red-600">R$ {menorCobranca.toFixed(2)}</div>
              <p className="text-sm text-gray-500">Menor cobrança</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximos vencimentos */}
      <Card className="bg-white shadow-lg border-0 rounded-xl">
        <CardHeader>
          <CardTitle>Próximos Vencimentos</CardTitle>
          <CardDescription>Cobranças que vencem nos próximos 7 dias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {proximosVencimentos.length > 0 ? proximosVencimentos.map(c => {
            const diasParaVencer = Math.ceil((new Date(c.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={c.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="font-medium">{c.nomeDevedor}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4" /> Vence em {diasParaVencer} dia{diasParaVencer !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">R$ {c.valor.toFixed(2)}</div>
                    <Badge
                      className={
                        diasParaVencer <= 2
                          ? "bg-red-100 text-red-600 border-red-200 hover:bg-red-200 transition-colors"
                          : diasParaVencer <= 5
                          ? "bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200 transition-colors"
                          : "bg-green-100 text-green-600 border-green-200 hover:bg-green-200 transition-colors"
                      }
                    >
                      {new Date(c.dataVencimento).toLocaleDateString("pt-BR")}
                    </Badge>
                </div>
              </div>
            );
          }) : (
            <div className="text-center text-gray-400 py-10">
              <div className="text-4xl mb-2">📅</div>
              <p>Nenhuma cobrança vence nos próximos 7 dias</p>
            </div>
          )}
        </CardContent>
      </Card>

{/* Distribuição mensal */}
<Card className="bg-white shadow-lg border-0 rounded-xl">
  <CardHeader>
    <CardTitle>Distribuição Mensal</CardTitle>
    <CardDescription>Cobranças agrupadas por mês de vencimento</CardDescription>
  </CardHeader>
  <CardContent className="space-y-2">
    {(() => {
      const meses = [
        'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
        'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
      ];
      const valorTotalGeral = cobrancasNaoPagas.reduce((sum, c) => sum + c.valor, 0);

      const distribuicaoMensal = cobrancasNaoPagas.reduce((acc, c) => {
        const data = new Date(c.dataVencimento);
        const chave = `${data.getFullYear()}-${data.getMonth()}`;
        if (!acc[chave])
          acc[chave] = { mes: meses[data.getMonth()], ano: data.getFullYear(), count: 0, valor: 0 };
        acc[chave].count++;
        acc[chave].valor += c.valor;
        return acc;
      }, {} as Record<string, { mes: string; ano: number; count: number; valor: number }>);

      return Object.values(distribuicaoMensal)
        .sort((a, b) => a.ano - b.ano || meses.indexOf(a.mes) - meses.indexOf(b.mes))
        .map((item, idx) => {
          const ticketMedio = item.valor / item.count;
          const percentual = valorTotalGeral ? (item.valor / valorTotalGeral) * 100 : 0;

          return (
            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className="font-medium">{item.mes} {item.ano}</div>
                <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-4">
                  <span>{item.count} cobrança{item.count > 1 ? 's' : ''}</span>
                  <span>Ticket médio: R$ {ticketMedio.toFixed(2)}</span>
                  <span className="text-gray-400">({percentual.toFixed(1)}% do total)</span>
                </div>
              </div>
              <div className="font-semibold text-green-700">R$ {item.valor.toFixed(2)}</div>
            </div>
          );
        });
    })()}
  </CardContent>
</Card>

    </div>
  );
};
