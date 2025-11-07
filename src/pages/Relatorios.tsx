import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown } from "lucide-react";
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
  status: 'ativa' | 'vencida' | 'paga';
  link: string;
  taxaJuros?: number;
  tipoJuros?: 'mensal' | 'diario';
}

export default function Relatorios() {
  const navigate = useNavigate();
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const subscription = useSubscription();
  const [loading, setLoading] = useState(true);


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

        // Carregar cobranças - backend já retorna valor_atual calculado
        const response = await fetch(`http://localhost:3000/devedores?user_id=${usuario.id}`);
        const data = await response.json();
        
        const cobrancasProcessadas = data.map((cobranca: any) => {
          const valorNum = Number(cobranca.valor);
          const taxaJurosNum = Number(cobranca.taxa_juros);
          // Backend já calculou valor_atual
          const valorAtual = Number(cobranca.valor_atual || cobranca.valor);
          
          const hoje = new Date();
          const vencimento = new Date(cobranca.data_vencimento);
          const status = cobranca.pago ? 'paga' : (hoje > vencimento ? 'vencida' : 'ativa');
          
          return {
            id: cobranca.id,
            nomeDevedor: cobranca.nome,
            valor: valorNum,
            valorAtual,
            dataVencimento: cobranca.data_vencimento,
            status,
            link: cobranca.link,
            taxaJuros: taxaJurosNum || undefined,
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
      <div className="min-h-screen bg-gradient-to-br from-coepay-primary/5 to-coepay-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coepay-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  // Temporariamente desabilitado - restrição premium
  // if (!subscription.subscribed) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-coepay-primary/5 to-coepay-secondary/5 flex items-center justify-center">
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
  <div className="bg-gradient-to-br from-coepay-primary/5 via-background to-coepay-secondary/5">
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500 drop-shadow-lg" />
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-coepay-primary to-coepay-secondary bg-clip-text text-transparent">
              Relatórios Avançados
            </h1>
            <p className="text-muted-foreground text-sm sm:text-lg mt-1">
              CoéPay - Análise completa das suas Contas a Receber
            </p>
          </div>
        </div>
      </div>
        <Tabs defaultValue="visao-geral" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card/50 backdrop-blur-sm border shadow-lg">
            <TabsTrigger 
              value="visao-geral"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-coepay-primary data-[state=active]:to-coepay-secondary data-[state=active]:text-white
                        hover:opacity-90 transition"
            >
              Visão Geral
            </TabsTrigger>

            <TabsTrigger 
              value="performance"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-coepay-primary data-[state=active]:to-coepay-secondary data-[state=active]:text-white
                        hover:opacity-90 transition"
            >
              Performance
            </TabsTrigger>

            <TabsTrigger 
              value="juros"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-coepay-primary data-[state=active]:to-coepay-secondary data-[state=active]:text-white
                        hover:opacity-90 transition"
            >
              Análise de Juros
            </TabsTrigger>

            <TabsTrigger 
              value="temporal"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-coepay-primary data-[state=active]:to-coepay-secondary data-[state=active]:text-white
                        hover:opacity-90 transition"
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