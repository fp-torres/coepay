import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart, TrendingUp, Calendar, DollarSign, Crown } from "lucide-react";

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

interface RelatoriosAvancadosProps {
  cobrancas: Cobranca[];
  subscription: {
    subscribed: boolean;
  };
}

export const RelatoriosAvancados = ({ cobrancas, subscription }: RelatoriosAvancadosProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!subscription.subscribed) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled>
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios Avançados
          </Button>
        </DialogTrigger>
      </Dialog>
    );
  }

  // Cálculos para os relatórios
  const totalCobrancas = cobrancas.length;
  const cobrancasAtivas = cobrancas.filter(c => c.status === 'ativa');
  const cobrancasVencidas = cobrancas.filter(c => c.status === 'vencida');
  
  const valorTotalOriginal = cobrancas.reduce((sum, c) => sum + c.valor, 0);
  const valorTotalAtual = cobrancas.reduce((sum, c) => sum + (c.valorAtual || c.valor), 0);
  const valorJuros = valorTotalAtual - valorTotalOriginal;
  
  const percentualRecuperacao = totalCobrancas > 0 ? (cobrancasAtivas.length / totalCobrancas) * 100 : 0;
  const ticketMedio = totalCobrancas > 0 ? valorTotalOriginal / totalCobrancas : 0;

  // Análise temporal (últimos 30 dias)
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 30);
  
  const cobrancasRecentes = cobrancas.filter(c => 
    new Date(c.dataVencimento) >= dataLimite
  );

  // Distribuição por faixas de valor
  const faixasValor = {
    ate100: cobrancas.filter(c => c.valor <= 100).length,
    ate500: cobrancas.filter(c => c.valor > 100 && c.valor <= 500).length,
    ate1000: cobrancas.filter(c => c.valor > 500 && c.valor <= 1000).length,
    acima1000: cobrancas.filter(c => c.valor > 1000).length,
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BarChart3 className="w-4 h-4 mr-2" />
          Relatórios Avançados
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Relatórios Avançados - FlowPay Premium
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="visao-geral" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="juros">Análise de Juros</TabsTrigger>
            <TabsTrigger value="temporal">Análise Temporal</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-4">
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Até R$ 100</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${(faixasValor.ate100/totalCobrancas)*100}px`}}></div>
                      <Badge variant="outline">{faixasValor.ate100}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>R$ 101 - R$ 500</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(faixasValor.ate500/totalCobrancas)*100}px`}}></div>
                      <Badge variant="outline">{faixasValor.ate500}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>R$ 501 - R$ 1.000</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(faixasValor.ate1000/totalCobrancas)*100}px`}}></div>
                      <Badge variant="outline">{faixasValor.ate1000}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Acima de R$ 1.000</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: `${(faixasValor.acima1000/totalCobrancas)*100}px`}}></div>
                      <Badge variant="outline">{faixasValor.acima1000}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Status das Cobranças</CardTitle>
                  <CardDescription>Distribuição atual do portfólio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Ativas
                      </span>
                      <div className="text-right">
                        <div className="font-bold">{cobrancasAtivas.length}</div>
                        <div className="text-sm text-muted-foreground">
                          {totalCobrancas > 0 ? ((cobrancasAtivas.length/totalCobrancas)*100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        Vencidas
                      </span>
                      <div className="text-right">
                        <div className="font-bold">{cobrancasVencidas.length}</div>
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
                        + R$ {valorJuros.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Valor adicional em juros
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg">
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
          </TabsContent>

          {/* Análise de Juros */}
          <TabsContent value="juros" className="space-y-4">
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
                      <div key={cobranca.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{cobranca.nomeDevedor}</div>
                          <div className="text-sm text-muted-foreground">
                            {diasVencido} dias vencido • {cobranca.taxaJuros}% {cobranca.tipoJuros}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">R$ {(cobranca.valorAtual || cobranca.valor).toFixed(2)}</div>
                          <div className="text-sm text-green-600">
                            +R$ {jurosPorCobranca.toFixed(2)} em juros
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {cobrancasVencidas.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Nenhuma cobrança vencida com juros aplicados
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Análise Temporal */}
          <TabsContent value="temporal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise dos Últimos 30 Dias</CardTitle>
                <CardDescription>Cobranças criadas no período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{cobrancasRecentes.length}</div>
                    <p className="text-sm text-muted-foreground">Cobranças no período</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      R$ {cobrancasRecentes.reduce((sum, c) => sum + c.valor, 0).toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Valor total</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
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
                <div className="space-y-2">
                  {cobrancasAtivas
                    .filter(c => {
                      const diasParaVencer = Math.ceil((new Date(c.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return diasParaVencer <= 7 && diasParaVencer >= 0;
                    })
                    .map(cobranca => {
                      const diasParaVencer = Math.ceil((new Date(cobranca.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={cobranca.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{cobranca.nomeDevedor}</div>
                            <div className="text-sm text-muted-foreground">
                              Vence em {diasParaVencer} dia{diasParaVencer !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">R$ {cobranca.valor.toFixed(2)}</div>
                            <Badge variant={diasParaVencer <= 2 ? "destructive" : "secondary"}>
                              {new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR')}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  {cobrancasAtivas.filter(c => {
                    const diasParaVencer = Math.ceil((new Date(c.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return diasParaVencer <= 7 && diasParaVencer >= 0;
                  }).length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      Nenhuma cobrança vence nos próximos 7 dias
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};