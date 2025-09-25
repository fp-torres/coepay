import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, TrendingUp } from "lucide-react";

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
      {/* Detalhamento das Cobranças */}
        <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Detalhamento dos Juros Aplicados</CardTitle>
          <CardDescription>Análise detalhada do impacto dos juros compostos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cobrancasVencidas.length > 0 ? (
            cobrancasVencidas.map((cobranca) => {
              const diasVencido = Math.floor((new Date().getTime() - new Date(cobranca.dataVencimento).getTime()) / (1000 * 60 * 60 * 24));
              const jurosPorCobranca = (cobranca.valorAtual || cobranca.valor) - cobranca.valor;
              
              return (
                <div key={cobranca.id} className="flex justify-between items-center p-4 border rounded-lg hover:shadow-lg transition-shadow bg-white">
                  <div className="flex-1">
                    <div className="font-medium text-lg">{cobranca.nomeDevedor}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="w-4 h-4" /> {diasVencido} dias vencido
                      <Badge
                        className={
                          cobranca.taxaJuros
                            ? "border border-red-500 text-red-600 bg-red-100 hover:bg-red-200"
                            : "border border-blue-500 text-blue-600 bg-blue-100 hover:bg-blue-200"
                        }
                      >
                        {cobranca.taxaJuros
                          ? `${cobranca.taxaJuros}% ${cobranca.tipoJuros}`
                          : "Sem juros"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Vencimento: {new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">R$ {(cobranca.valorAtual || cobranca.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    {cobranca.taxaJuros ? (
                      <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> +R$ {jurosPorCobranca.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} em juros
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">Sem juros</div>
                    )}
                    <div className="text-xs text-muted-foreground">Valor original: R$ {cobranca.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
              );
            })
          ) : (
          <div className="text-center text-muted-foreground py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium mb-2">Nenhum atraso!</h3>
            <p>Atualmente, não há juros a receber de cobranças vencidas.</p>
          </div>
          )}
        </CardContent>
      </Card>
      
      {/* Resumo de Juros */}
      {cobrancasVencidas.length > 0 && (
        <Card className="bg-white border-0 rounded-xl shadow-2xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
          <CardHeader>
            {/* Título e descrição do card */}
            <CardTitle className="text-2xl md:text-2xl font-extrabold text-gray-900">
              Resumo dos Juros
            </CardTitle>
            <CardDescription className="text-md text-gray-600">
              Impacto total dos juros nas Contas a Receber
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Alterado para 4 colunas no desktop */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

              {/* 1. Quantidade de cobranças vencidas */}
              <div className="text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="text-2xl font-bold text-red-600">
                  {cobrancasVencidas.length}
                </div>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" /> Cobranças vencidas
                </p>
              </div>

              {/* 2. Total original das cobranças */}
              <div className="text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="text-2xl font-bold text-gray-800">
                  R$ {cobrancasVencidas.reduce((sum, c) => sum + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <DollarSign className="w-4 h-4" /> Total original
                </p>
              </div>

              {/* 3. Total acumulado em juros */}
              <div className="text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="text-2xl font-bold text-green-600">
                  R$ {cobrancasVencidas
                    .reduce((sum, c) => sum + ((c.valorAtual || c.valor) - c.valor), 0)
                    .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <DollarSign className="w-4 h-4" /> Total em juros
                </p>
              </div>

              {/* 4. Dias médios de atraso */}
              <div className="text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="text-2xl font-bold">
                  {(
                    cobrancasVencidas.reduce(
                      (sum, c) =>
                        sum +
                        Math.floor(
                          (new Date().getTime() - new Date(c.dataVencimento).getTime()) /
                          (1000 * 60 * 60 * 24)
                        ),
                      0
                    ) / cobrancasVencidas.length
                  ).toFixed(0)}
                </div>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" /> Dias médios de atraso
                </p>
              </div>

              {/* 5. Maior atraso em dias */}
              <div className="text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {(() => {
                  const maiorAtraso = Math.max(
                    ...cobrancasVencidas.map(c =>
                      Math.floor(
                        (new Date().getTime() - new Date(c.dataVencimento).getTime()) /
                        (1000 * 60 * 60 * 24)
                      )
                    )
                  );
                  const cobrancaMaiorAtraso = cobrancasVencidas.find(c =>
                    Math.floor(
                      (new Date().getTime() - new Date(c.dataVencimento).getTime()) /
                      (1000 * 60 * 60 * 24)
                    ) === maiorAtraso
                  );
                  return (
                    <>
                      <div className="text-3xl font-bold text-gray-800">{maiorAtraso}</div>
                      <p className="text-sm text-muted-foreground flex flex-col items-center justify-center gap-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> Maior atraso (dias)
                        </span>
                        <span className="italic text-gray-600 text-xs">
                          {cobrancaMaiorAtraso?.nomeDevedor}
                        </span>
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* 6. Cobranças com juros aplicados */}
              <div className="text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="text-2xl font-bold text-green-600">
                  {cobrancasVencidas.filter(c => c.taxaJuros).length}
                </div>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <DollarSign className="w-4 h-4" /> Cobranças com juros
                </p>
              </div>

              {/* 7. Média de juros por cobrança */}
              <div className="text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {(() => {
                  const cobrancasComJuros = cobrancasVencidas.filter(c => c.taxaJuros);
                  const mediaJuros = cobrancasComJuros.reduce(
                    (sum, c) => sum + ((c.valorAtual || c.valor) - c.valor),
                    0
                  ) / (cobrancasComJuros.length || 1);
                  return (
                    <>
                      <div className="text-2xl font-bold text-green-600">
                        R$ {mediaJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <DollarSign className="w-4 h-4" /> Média de juros
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* 8. Maior valor individual de juros */}
              <div className="text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {(() => {
                  const maiorJuros = Math.max(
                    ...cobrancasVencidas.map(c => (c.valorAtual || c.valor) - c.valor)
                  );
                  const cobrancaMaiorJuros = cobrancasVencidas.find(c =>
                    ((c.valorAtual || c.valor) - c.valor) === maiorJuros
                  );
                  return (
                    <>
                      <div className="text-2xl font-bold text-green-600">R$ {maiorJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <p className="text-sm text-muted-foreground flex flex-col items-center justify-center gap-1">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" /> Maior juros
                        </span>
                        <span className="italic text-gray-600 text-xs">
                          {cobrancaMaiorJuros?.nomeDevedor}
                        </span>
                      </p>
                    </>
                  );
                })()}
              </div>

            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
