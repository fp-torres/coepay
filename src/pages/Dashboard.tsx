import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, LogOut, Plus, TrendingUp, Clock, AlertTriangle, Crown, CreditCard } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

interface User {
  id: number;
  name: string;
  email: string;
  pix: string;
  isPremium?: boolean;
}

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const subscription = useSubscription();
  const [novaCobranca, setNovaCobranca] = useState({
    nomeDevedor: "",
    valor: "",
    dataVencimento: "",
    taxaJuros: "",
    tipoJuros: "mensal" as "mensal" | "diario",
  });

  const calcularJurosCompostos = (valorInicial: number, taxa: number, tipo: 'mensal' | 'diario', dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    
    if (hoje <= vencimento) return valorInicial;
    
    const diffTime = hoje.getTime() - vencimento.getTime();
    let periodos: number;
    
    if (tipo === 'diario') {
      periodos = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else {
      periodos = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Média de dias por mês
    }
    
    return valorInicial * Math.pow(1 + (taxa / 100), periodos);
  };

  const carregarCobrancas = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/devedores?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
       const cobrancasFormatadas = data.map((item: any) => {
        let valorAtual = parseFloat(item.valor);
        
        if (item.taxa_juros && item.tipo_juros) {
          valorAtual = calcularJurosCompostos(
            parseFloat(item.valor),
            parseFloat(item.taxa_juros),
            item.tipo_juros,
            item.data_vencimento
          );
        }

        const hoje = new Date();
        const vencimento = new Date(item.data_vencimento);
        const status = hoje > vencimento ? 'vencida' : 'ativa';

        return {
          id: item.id.toString(),
          nomeDevedor: item.nome,
          valor: parseFloat(item.valor),
          valorAtual,
          dataVencimento: item.data_vencimento,
          status,
          // usar frontend para link público
          link: `${window.location.origin}/cobranca/${item.id}`,
          taxaJuros: item.taxa_juros ? parseFloat(item.taxa_juros) : undefined,
          tipoJuros: item.tipo_juros as 'mensal' | 'diario' | undefined,
        };
      });

        setCobrancas(cobrancasFormatadas);
      }
    } catch (error) {
      console.error('Erro ao carregar cobranças:', error);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    // Usar o status real da subscription
    const userWithPremium = { 
      ...parsedUser, 
      isPremium: subscription.subscribed 
    };
    setUser(userWithPremium);
    
    // Carregar cobranças do usuário do backend
    if (parsedUser.id) {
      carregarCobrancas(parsedUser.id);
    }
  }, [navigate, subscription.subscribed]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const criarCobranca = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    // Verificar limite de cobranças para usuários não premium
    if (!subscription.subscribed && cobrancas.length >= 3) {
      toast({
        title: "Limite atingido!",
        description: "Usuários gratuitos podem criar apenas 3 cobranças. Upgrade para premium para criar ilimitadas.",
        variant: "destructive",
      });
      return;
    }

    const valorInicial = parseFloat(novaCobranca.valor);
    const taxaJuros = subscription.subscribed ? parseFloat(novaCobranca.taxaJuros) || 0 : 0;

    try {
      const response = await fetch('http://localhost:5000/devedores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          nome: novaCobranca.nomeDevedor || "Sem Nome",
          email: null,
          telefone: null,
          valor: isNaN(valorInicial) ? 0 : valorInicial,
          data_vencimento: novaCobranca.dataVencimento || new Date().toISOString().split('T')[0],
          taxa_juros: novaCobranca.taxaJuros,  
          tipo_juros: novaCobranca.tipoJuros, 
        })
      });

      if (response.ok) {
        const novaCobrancaCriada = await response.json();
        
        // Recarregar cobranças do backend
        await carregarCobrancas(user.id);
        
        setNovaCobranca({ nomeDevedor: "", valor: "", dataVencimento: "", taxaJuros: "", tipoJuros: "mensal" });
        toast({
          title: "Cobrança criada com sucesso!",
          description: `Cobrança para ${novaCobranca.nomeDevedor} foi criada.`,
        });
      } else {
        throw new Error('Erro ao criar cobrança');
      }
    } catch (error) {
      console.error('Erro ao criar cobrança:', error);
      toast({
        title: "Erro!",
        description: "Não foi possível criar a cobrança. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const copiarLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link da cobrança foi copiado para a área de transferência.",
    });
  };

  const totalReceber = cobrancas.reduce((sum, c) => sum + (c.valorAtual || c.valor), 0);
  const cobrancasAtivas = cobrancas.filter(c => c.status === 'ativa').length;
  const cobrancasVencidas = cobrancas.filter(c => c.status === 'vencida').length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-primary">Olá, {user.name}!</h1>
              {subscription.subscribed && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Gerencie suas cobranças 
              {!subscription.subscribed && (
                <span className="text-amber-600"> • {cobrancas.length}/3 cobranças usadas</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {subscription.subscribed && (
              <Button variant="outline" size="sm" onClick={subscription.openCustomerPortal}>
                <CreditCard className="w-4 h-4 mr-2" />
                Gerenciar Assinatura
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalReceber.toFixed(2).replace('.', ',')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobranças Ativas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{cobrancasAtivas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobranças Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{cobrancasVencidas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade para Premium Card - só aparece para usuários não premium */}
        {!subscription.subscribed && (
          <Card className="border-2 border-dashed border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-800">
                <Crown className="w-5 h-5 mr-2" />
                Upgrade para Premium
              </CardTitle>
              <CardDescription>
                Desbloqueie recursos avançados e cobranças ilimitadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">🚀 Recursos Premium:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cobranças ilimitadas</li>
                    <li>• Juros compostos automáticos</li>
                    <li>• Cálculo por dia ou mês</li>
                    <li>• Relatórios avançados</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">💰 Preço:</h4>
                  <p className="text-2xl font-bold text-green-600">R$ 29,90/mês</p>
                  <Button 
                    onClick={subscription.createCheckout}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    disabled={subscription.loading}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {subscription.loading ? "Carregando..." : "Assinar Premium"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Criar Nova Cobrança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Nova Cobrança
              </CardTitle>
              <CardDescription>Preencha os dados do devedor</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={criarCobranca} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-devedor">Nome do Devedor</Label>
                  <Input
                    id="nome-devedor"
                    value={novaCobranca.nomeDevedor}
                    onChange={(e) => setNovaCobranca({ ...novaCobranca, nomeDevedor: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor da Dívida (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={novaCobranca.valor}
                    onChange={(e) => setNovaCobranca({ ...novaCobranca, valor: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-vencimento">Data de Vencimento</Label>
                  <Input
                    id="data-vencimento"
                    type="date"
                    value={novaCobranca.dataVencimento}
                    onChange={(e) => setNovaCobranca({ ...novaCobranca, dataVencimento: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    A partir desta data os juros começam a contar
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Sua Chave PIX</Label>
                  <Input 
                    value={user.pix} 
                    onChange={(e) => {
                      const updatedUser = { ...user, pix: e.target.value };
                      setUser(updatedUser);
                      localStorage.setItem("user", JSON.stringify(updatedUser));
                    }}
                  />
                </div>
                
                {/* Campos de Juros Compostos - Premium */}
                <div className="space-y-2">
                  <Label htmlFor="taxa-juros" className="flex items-center gap-2">
                    Taxa de Juros (%)
                    {!user?.isPremium && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">💎 Premium</span>}
                  </Label>
                  <Input
                    id="taxa-juros"
                    type="number"
                    step="0.01"
                    value={novaCobranca.taxaJuros}
                    onChange={(e) => setNovaCobranca({ ...novaCobranca, taxaJuros: e.target.value })}
                    placeholder="Ex: 2.5"
                    // disabled={!user?.isPremium}
                    disabled={false}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipo-juros" className="flex items-center gap-2">
                    Período dos Juros
                    {!user?.isPremium && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">💎 Premium</span>}
                  </Label>
                  <select 
                    id="tipo-juros"
                    value={novaCobranca.tipoJuros}
                    onChange={(e) => setNovaCobranca({ ...novaCobranca, tipoJuros: e.target.value as 'mensal' | 'diario' })}
                    // disabled={!user?.isPremium}
                    disabled={false}

                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="mensal">Ao mês</option>
                    <option value="diario">Ao dia</option>
                  </select>
                </div>
                
                {!user?.isPremium && (
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    💎 <strong>Premium:</strong> Upgrade para adicionar juros compostos às suas cobranças e criar cobranças ilimitadas!
                    <br />
                    <span className="text-xs">Exemplo: R$ 100,00 em 01/01/2025 com 2% ao mês = R$ 102,00 após 1 mês</span>
                  </div>
                )}
                <Button type="submit" className="w-full">Criar Cobrança</Button>
              </form>
            </CardContent>
          </Card>

          {/* Suas Cobranças */}
          <Card>
            <CardHeader>
              <CardTitle>Suas Cobranças</CardTitle>
              <CardDescription>{cobrancas.length} cobrança(s) cadastrada(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cobrancas.map((cobranca) => {
                  const vencimento = new Date(cobranca.dataVencimento);
                  const hoje = new Date();
                  const estaVencida = hoje > vencimento;
                  const dataFormatada = vencimento.toLocaleDateString('pt-BR');

                  return (
                    <div key={cobranca.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{cobranca.nomeDevedor}</h3>
                          <Badge variant={cobranca.status === 'ativa' ? 'default' : 'destructive'}>
                            {cobranca.status === 'ativa' ? 'No prazo' : 'Vencida'}
                          </Badge>
                        </div>

                        {/* Valores originais*/}
                        <div className="flex items-end gap-2">
                          <p className="text-xl font-bold text-red-600">
                            R$ {(cobranca.valorAtual || cobranca.valor).toFixed(2).replace(".", ",")}
                          </p>
                          {cobranca.valorAtual &&
                            cobranca.valorAtual !== cobranca.valor && (
                              <p className="text-sm text-muted-foreground line-through">
                                R$ {cobranca.valor.toFixed(2).replace(".", ",")}
                              </p>
                            )}
                        </div>

                        {cobranca.taxaJuros && (
                          <p className="text-xs text-blue-600">
                            Juros: {cobranca.taxaJuros}% {cobranca.tipoJuros === 'diario' ? 'ao dia' : 'ao mês'}
                          </p>
                        )}

                        <p className="text-sm text-muted-foreground">
                          {estaVencida ? `Vencida em: ${dataFormatada}` : `Vence em: ${dataFormatada}`}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(cobranca.link, "_blank")}
                        >
                          Abrir Cobrança
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copiarLink(cobranca.link)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Link
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {cobrancas.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma cobrança cadastrada ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;