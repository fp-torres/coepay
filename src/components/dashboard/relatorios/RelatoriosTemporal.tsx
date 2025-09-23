import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface RelatoriosTemporalProps {
  cobrancas: Cobranca[];
}

export const RelatoriosTemporal = ({ cobrancas }: RelatoriosTemporalProps) => {
  const cobrancasAtivas = cobrancas.filter(c => c.status === 'ativa');

  // Análise temporal (últimos 30 dias)
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 30);
  
  const cobrancasRecentes = cobrancas.filter(c => 
    new Date(c.dataVencimento) >= dataLimite
  );

  // Próximos vencimentos (7 dias)
  const proximosVencimentos = cobrancasAtivas
    .filter(c => {
      const diasParaVencer = Math.ceil((new Date(c.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diasParaVencer <= 7 && diasParaVencer >= 0;
    })
    .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análise dos Últimos 30 Dias</CardTitle>
          <CardDescription>Cobranças criadas no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-flowpay-primary">{cobrancasRecentes.length}</div>
              <p className="text-sm text-muted-foreground">Cobranças no período</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-flowpay-secondary">
                R$ {cobrancasRecentes.reduce((sum, c) => sum + c.valor, 0).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Valor total</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                R$ {cobrancasRecentes.length > 0 ? (cobrancasRecentes.reduce((sum, c) => sum + c.valor, 0) / cobrancasRecentes.length).toFixed(2) : '0.00'}
              </div>
              <p className="text-sm text-muted-foreground">Ticket médio</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Vencimentos</CardTitle>
          <CardDescription>Cobranças que vencem nos próximos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {proximosVencimentos.map(cobranca => {
              const diasParaVencer = Math.ceil((new Date(cobranca.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={cobranca.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-lg">{cobranca.nomeDevedor}</div>
                    <div className="text-sm text-muted-foreground">
                      Vence em {diasParaVencer} dia{diasParaVencer !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">R$ {cobranca.valor.toFixed(2)}</div>
                    <Badge variant={diasParaVencer <= 2 ? "destructive" : diasParaVencer <= 5 ? "secondary" : "outline"}>
                      {new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {proximosVencimentos.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium mb-2">Agenda tranquila</h3>
                <p>Nenhuma cobrança vence nos próximos 7 dias</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Análise por mês */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição Mensal</CardTitle>
          <CardDescription>Cobranças agrupadas por mês de vencimento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(() => {
              const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
              
              const distribuicaoMensal = cobrancas.reduce((acc, cobranca) => {
                const mes = new Date(cobranca.dataVencimento).getMonth();
                const ano = new Date(cobranca.dataVencimento).getFullYear();
                const chave = `${ano}-${mes}`;
                
                if (!acc[chave]) {
                  acc[chave] = { mes: meses[mes], ano, count: 0, valor: 0 };
                }
                acc[chave].count++;
                acc[chave].valor += cobranca.valor;
                return acc;
              }, {} as Record<string, { mes: string; ano: number; count: number; valor: number }>);

              return Object.values(distribuicaoMensal)
                .sort((a, b) => `${a.ano}-${meses.indexOf(a.mes)}`.localeCompare(`${b.ano}-${meses.indexOf(b.mes)}`))
                .map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.mes} {item.ano}</div>
                      <div className="text-sm text-muted-foreground">{item.count} cobranças</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">R$ {item.valor.toFixed(2)}</div>
                    </div>
                  </div>
                ));
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};