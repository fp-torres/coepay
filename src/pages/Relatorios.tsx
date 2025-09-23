import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { RelatoriosOverview } from "@/components/dashboard/relatorios/RelatoriosOverview";
import { RelatoriosPerformance } from "@/components/dashboard/relatorios/RelatoriosPerformance";
import { RelatoriosJuros } from "@/components/dashboard/relatorios/RelatoriosJuros";
import { RelatoriosTemporal } from "@/components/dashboard/relatorios/RelatoriosTemporal";

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

export default function Relatorios() {
  const navigate = useNavigate();
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const subscription = useSubscription();
  const [loading, setLoading] = useState(true);

  const calcularJurosCompostos = (valor: number, taxaJuros: number, tipoJuros: 'mensal' | 'diario', dataVencimento: string): number => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    
    if (hoje <= vencimento) return valor;
    
    const diferencaMs = hoje.getTime() - vencimento.getTime();
    const diasVencido = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
    
    if (diasVencido <= 0) return valor;
    
    let periodos: number;
    if (tipoJuros === 'diario') {
      periodos = diasVencido;
    } else {
      periodos = diasVencido / 30;
    }
    
    const taxa = taxaJuros / 100;
    return valor * Math.pow(1 + taxa, periodos);
  };

  useEffect(() => {
    const carregarDados = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/login');
        return;
      }
      
      const usuario = JSON.parse(userData);

      try {
        // Temporariamente desabilitado - funcionalidade premium
        // if (!subscription.subscribed) {
        //   navigate('/dashboard');
        //   return;
        // }

        // Carregar cobranças
        const response = await fetch(`http://localhost:5000/devedores?user_id=${usuario.id}`);
        const data = await response.json();
        
        const cobrancasProcessadas = data.map((cobranca: any) => {
          const valorNum = Number(cobranca.valor);
          const taxaJurosNum = Number(cobranca.taxa_juros);
          const valorAtual = (taxaJurosNum && cobranca.tipo_juros)
            ? calcularJurosCompostos(valorNum, taxaJurosNum, cobranca.tipo_juros, cobranca.data_vencimento)
            : valorNum;
          
          const hoje = new Date();
          const vencimento = new Date(cobranca.data_vencimento);
          const status = hoje > vencimento ? 'vencida' : 'ativa';
          
          return {
            id: cobranca.id,
            nomeDevedor: cobranca.nome,
            valor: valorNum,
            valorAtual,
            dataVencimento: cobranca.data_vencimento,
            status,
            link: cobranca.link,
            taxaJuros: taxaJurosNum,
            tipoJuros: cobranca.tipo_juros
          };
        });

        
        setCobrancas(cobrancasProcessadas);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [navigate, subscription.subscribed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-flowpay-primary/5 to-flowpay-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flowpay-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  // Temporariamente desabilitado - restrição premium
  // if (!subscription.subscribed) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-flowpay-primary/5 to-flowpay-secondary/5 flex items-center justify-center">
  //       <Card className="w-full max-w-md">
  //         <CardHeader className="text-center">
  //           <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
  //           <CardTitle>Recurso Premium</CardTitle>
  //           <CardDescription>
  //             Os relatórios avançados estão disponíveis apenas para usuários Premium.
  //           </CardDescription>
  //         </CardHeader>
  //         <CardContent className="text-center space-y-4">
  //           <Button onClick={() => navigate('/dashboard')} className="w-full">
  //             Voltar ao Dashboard
  //           </Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-flowpay-primary/5 via-background to-flowpay-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-flowpay-primary/10 hover:border-flowpay-primary/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-flowpay-primary to-flowpay-secondary bg-clip-text text-transparent">
                <Crown className="w-10 h-10 text-amber-500 drop-shadow-lg" />
                Relatórios Avançados
              </h1>
              <p className="text-muted-foreground text-lg mt-1">FlowPay - Análise completa do seu portfólio</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="visao-geral" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card/50 backdrop-blur-sm border shadow-lg">
            <TabsTrigger 
              value="visao-geral" 
              className="data-[state=active]:bg-flowpay-primary data-[state=active]:text-white"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="performance"
              className="data-[state=active]:bg-flowpay-primary data-[state=active]:text-white"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="juros"
              className="data-[state=active]:bg-flowpay-primary data-[state=active]:text-white"
            >
              Análise de Juros
            </TabsTrigger>
            <TabsTrigger 
              value="temporal"
              className="data-[state=active]:bg-flowpay-primary data-[state=active]:text-white"
            >
              Análise Temporal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral">
            <RelatoriosOverview cobrancas={cobrancas} />
          </TabsContent>

          <TabsContent value="performance">
            <RelatoriosPerformance cobrancas={cobrancas} />
          </TabsContent>

          <TabsContent value="juros">
            <RelatoriosJuros cobrancas={cobrancas} />
          </TabsContent>

          <TabsContent value="temporal">
            <RelatoriosTemporal cobrancas={cobrancas} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}