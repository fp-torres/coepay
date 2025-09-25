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

interface RelatoriosPerformanceProps {
  cobrancas: Cobranca[];
}

export const RelatoriosPerformance = ({ cobrancas }: RelatoriosPerformanceProps) => {
  const totalCobrancas = cobrancas.length;
  const cobrancasAtivas = cobrancas.filter(c => c.status === 'ativa');
  const cobrancasVencidas = cobrancas.filter(c => c.status === 'vencida');
  
  const valorTotalOriginal = cobrancas.reduce((sum, c) => sum + Number(c.valor), 0);
  const valorTotalAtual = cobrancas.reduce((sum, c) => sum + (Number(c.valorAtual) || Number(c.valor)), 0);
  const valorJuros = valorTotalAtual - valorTotalOriginal;

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

        <Card>
          <CardHeader>
            <CardTitle>Impacto dos Juros</CardTitle>
            <CardDescription>Receita adicional gerada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  + R$ {valorJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-muted-foreground">
                  Valor adicional em juros
                </p>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold">
                  {valorTotalOriginal > 0 ? ((valorJuros/valorTotalOriginal)*100).toFixed(2) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Aumento sobre valor original
                </p>
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