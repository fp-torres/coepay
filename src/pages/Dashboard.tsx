import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, LogOut, Plus, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface User {
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
  dataInicio: string;
  status: 'ativa' | 'atrasada';
  link: string;
  taxaJuros?: number;
  tipoJuros?: 'mensal' | 'diario';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [novaCobranca, setNovaCobranca] = useState({
    nomeDevedor: "",
    valor: "",
    dataInicio: "",
    taxaJuros: "",
    tipoJuros: "mensal" as "mensal" | "diario",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Simular usuário premium - em produção isso viria do banco
    const userWithPremium = { ...JSON.parse(userData), isPremium: false }; // Altere para true para testar premium
    setUser(userWithPremium);
    
    // Mock data for cobranças
    const mockCobrancas: Cobranca[] = [
      {
        id: "1",
        nomeDevedor: "João Silva",
        valor: 150.50,
        dataInicio: "2024-01-15",
        status: "ativa",
        link: `${window.location.origin}/cobranca/1`
      },
      {
        id: "2", 
        nomeDevedor: "Maria Santos",
        valor: 300.00,
        dataInicio: "2024-01-10",
        status: "atrasada",
        link: `${window.location.origin}/cobranca/2`
      }
    ];
    setCobrancas(mockCobrancas);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const criarCobranca = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar limite de cobranças para usuários não premium
    if (!user?.isPremium && cobrancas.length >= 3) {
      toast({
        title: "Limite atingido!",
        description: "Usuários gratuitos podem criar apenas 3 cobranças. Upgrade para premium para criar ilimitadas.",
        variant: "destructive",
      });
      return;
    }

    const calcularJurosCompostos = (valorInicial: number, taxa: number, tipo: string, dataInicio: string) => {
      if (!user?.isPremium || !taxa || taxa === 0) return valorInicial;
      
      const hoje = new Date();
      const inicio = new Date(dataInicio);
      const diffTime = Math.abs(hoje.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let periodos = 0;
      if (tipo === 'diario') {
        periodos = diffDays;
      } else {
        periodos = diffDays / 30; // aproximadamente 30 dias por mês
      }
      
      return valorInicial * Math.pow(1 + taxa / 100, periodos);
    };

    const valorInicial = parseFloat(novaCobranca.valor);
    const taxaJuros = user?.isPremium ? parseFloat(novaCobranca.taxaJuros) || 0 : 0;
    const valorAtual = calcularJurosCompostos(valorInicial, taxaJuros, novaCobranca.tipoJuros, novaCobranca.dataInicio);

    const novaCobrancaItem: Cobranca = {
      id: Date.now().toString(),
      nomeDevedor: novaCobranca.nomeDevedor,
      valor: valorInicial,
      valorAtual: valorAtual,
      dataInicio: novaCobranca.dataInicio,
      status: new Date(novaCobranca.dataInicio) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'atrasada' : 'ativa',
      link: `${window.location.origin}/cobranca/${Date.now()}`,
      taxaJuros: user?.isPremium ? taxaJuros : undefined,
      tipoJuros: user?.isPremium ? novaCobranca.tipoJuros : undefined,
    };
    
    setCobrancas([...cobrancas, novaCobrancaItem]);
    setNovaCobranca({ nomeDevedor: "", valor: "", dataInicio: "", taxaJuros: "", tipoJuros: "mensal" });
    toast({
      title: "Cobrança criada com sucesso!",
      description: `Cobrança para ${novaCobranca.nomeDevedor} foi criada.`,
    });
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
  const cobrancasAtrasadas = cobrancas.filter(c => c.status === 'atrasada').length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Olá, {user.name}!</h1>
            <p className="text-muted-foreground">Gerencie suas cobranças</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
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
              <CardTitle className="text-sm font-medium">Cobranças Atrasadas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{cobrancasAtrasadas}</div>
            </CardContent>
          </Card>
        </div>

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
                  <Label htmlFor="data-inicio">Data de Início</Label>
                  <Input
                    id="data-inicio"
                    type="date"
                    value={novaCobranca.dataInicio}
                    onChange={(e) => setNovaCobranca({ ...novaCobranca, dataInicio: e.target.value })}
                    required
                  />
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
                
                {/* Campos Premium - Juros Compostos */}
                {user?.isPremium && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="taxa-juros">Taxa de Juros (%)</Label>
                      <Input
                        id="taxa-juros"
                        type="number"
                        step="0.01"
                        value={novaCobranca.taxaJuros}
                        onChange={(e) => setNovaCobranca({ ...novaCobranca, taxaJuros: e.target.value })}
                        placeholder="Ex: 2.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo-juros">Período dos Juros</Label>
                      <select 
                        id="tipo-juros"
                        value={novaCobranca.tipoJuros}
                        onChange={(e) => setNovaCobranca({ ...novaCobranca, tipoJuros: e.target.value as 'mensal' | 'diario' })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="mensal">Ao mês</option>
                        <option value="diario">Ao dia</option>
                      </select>
                    </div>
                  </>
                )}
                
                {!user?.isPremium && (
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    💎 <strong>Premium:</strong> Upgrade para adicionar juros compostos às suas cobranças e criar cobranças ilimitadas!
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
                {cobrancas.map((cobranca) => (
                  <div key={cobranca.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{cobranca.nomeDevedor}</h3>
                        <Badge variant={cobranca.status === 'ativa' ? 'default' : 'destructive'}>
                          {cobranca.status}
                        </Badge>
                      </div>
                       <div className="flex items-center justify-between">
                         <p className="text-lg font-bold text-red-600">
                           R$ {((cobranca.valorAtual || cobranca.valor).toFixed(2)).replace('.', ',')}
                         </p>
                         {cobranca.valorAtual && cobranca.valorAtual !== cobranca.valor && (
                           <span className="text-xs text-muted-foreground">
                             (Original: R$ {cobranca.valor.toFixed(2).replace('.', ',')})
                           </span>
                         )}
                       </div>
                       {cobranca.taxaJuros && (
                         <p className="text-xs text-blue-600">
                           Juros: {cobranca.taxaJuros}% {cobranca.tipoJuros === 'diario' ? 'ao dia' : 'ao mês'}
                         </p>
                       )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(cobranca.dataInicio).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copiarLink(cobranca.link)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Link
                    </Button>
                  </div>
                ))}
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