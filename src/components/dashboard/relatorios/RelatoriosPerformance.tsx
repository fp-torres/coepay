import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

interface RelatoriosPerformanceProps {
  cobrancas: Cobranca[];
}

export const RelatoriosPerformance = ({ cobrancas }: RelatoriosPerformanceProps) => {
  const cobrancasNaoPagas = cobrancas.filter(c => c.status !== 'paga');
  const totalCobrancas = cobrancasNaoPagas.length;
  const cobrancasAtivas = cobrancasNaoPagas.filter(c => c.status === 'ativa');
  const cobrancasVencidas = cobrancasNaoPagas.filter(c => c.status === 'vencida');
  
  const valorTotalOriginal = cobrancasNaoPagas.reduce((sum, c) => sum + Number(c.valor), 0);
  const valorTotalAtual = cobrancasNaoPagas.reduce((sum, c) => sum + (Number(c.valorAtual) || Number(c.valor)), 0);
  const valorJuros = valorTotalAtual - valorTotalOriginal;
  
  const cobrancasComJuros = cobrancasNaoPagas.filter(c => c.taxaJuros && c.taxaJuros > 0);
  const percComJuros = totalCobrancas > 0 ? ((cobrancasComJuros.length / totalCobrancas) * 100).toFixed(1) : '0';

  const mediaJuros = cobrancasComJuros.length > 0 ? valorJuros / cobrancasComJuros.length : 0;


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status das Cobranças</CardTitle>
            <CardDescription>Distribuição atual do portfólio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  Ativas
                </span>
                <div className="text-right">
                  <div className="font-bold text-lg">{cobrancasAtivas.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalCobrancas > 0 ? ((cobrancasAtivas.length/totalCobrancas)*100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  Vencidas
                </span>
                <div className="text-right">
                  <div className="font-bold text-lg">{cobrancasVencidas.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalCobrancas > 0 ? ((cobrancasVencidas.length/totalCobrancas)*100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          {/* Impacto dos Juros */}
          <Card>
            <CardHeader>
              <CardTitle>Impacto dos Juros</CardTitle>
              <CardDescription>Receita adicional gerada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                
                {/* Valor total + percentual */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    + R$ {valorJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-lg text-gray-700 mt-1">
                    {valorTotalOriginal > 0 ? ((valorJuros / valorTotalOriginal) * 100).toFixed(2) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Aumento sobre valor original</p>
                </div>

                {/* Detalhes adicionais */}
                <div className="flex justify-center gap-8 mt-2 text-center text-sm text-muted-foreground">
                  <div>
                    % de cobranças com juros<br/>
                    <span className="font-medium text-gray-900">{percComJuros}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
      {/* Gráfico visual de performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Visual</CardTitle>
          <CardDescription>Distribuição visual do status das cobranças</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-y-4">
            <div className="w-full max-w-md">
              <div className="flex rounded-full overflow-hidden h-8 bg-muted">
                <div 
                  className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: totalCobrancas > 0 ? `${(cobrancasAtivas.length/totalCobrancas)*100}%` : '0%' }}
                >
                  {totalCobrancas > 0 && ((cobrancasAtivas.length/totalCobrancas)*100) > 15 && 'Ativas'}
                </div>
                <div 
                  className="bg-red-500 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: totalCobrancas > 0 ? `${(cobrancasVencidas.length/totalCobrancas)*100}%` : '0%' }}
                >
                  {totalCobrancas > 0 && ((cobrancasVencidas.length/totalCobrancas)*100) > 15 && 'Vencidas'}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Cobranças Ativas
                  </span>
                  <span className="font-medium">{cobrancasAtivas.length} ({totalCobrancas > 0 ? ((cobrancasAtivas.length/totalCobrancas)*100).toFixed(1) : 0}%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Cobranças Vencidas
                  </span>
                  <span className="font-medium">{cobrancasVencidas.length} ({totalCobrancas > 0 ? ((cobrancasVencidas.length/totalCobrancas)*100).toFixed(1) : 0}%)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};