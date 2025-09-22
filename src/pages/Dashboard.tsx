import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { UpgradePremiumCard } from "@/components/dashboard/UpgradePremiumCard";
import { NovaCobrancaForm } from "@/components/dashboard/NovaCobrancaForm";
import { CobrancasList } from "@/components/dashboard/CobrancasList";

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

const valorInicial = parseFloat(novaCobranca.valor.replace(/[^\d,]/g, '').replace(',', '.'));
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
  const excluirCobranca = (id: string) => {
    toast({
      title: "Confirmar exclusão?",
      description: "Você tem certeza que deseja excluir esta cobrança?",
      action: (
        <Button
          variant="destructive"
          onClick={async () => {
            try {
              const response = await fetch(`http://localhost:5000/devedores/${id}`, {
                method: "DELETE",
              });

              if (!response.ok) {
                throw new Error("Erro ao excluir");
              }

              toast({
                title: "Cobrança excluída",
                description: "A cobrança foi removida com sucesso.",
              });

              // Recarrega a lista
              if (user?.id) {
                carregarCobrancas(user.id);
              }
            } catch (err) {
              console.error(err);
              toast({
                title: "Erro ao excluir",
                description: "Não foi possível excluir a cobrança.",
                variant: "destructive",
              });
            }
          }}
        >
          Confirmar
        </Button>
      ),
    });
  };


  const totalReceber = cobrancas.reduce((sum, c) => sum + (c.valorAtual || c.valor), 0);
  const cobrancasAtivas = cobrancas.filter(c => c.status === 'ativa').length;
  const cobrancasVencidas = cobrancas.filter(c => c.status === 'vencida').length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader 
          user={user} 
          subscription={subscription} 
          cobrancasCount={cobrancas.length}
          cobrancas={cobrancas}
          onLogout={handleLogout} 
        />

        <DashboardCards 
          totalReceber={totalReceber}
          cobrancasAtivas={cobrancasAtivas}
          cobrancasVencidas={cobrancasVencidas}
        />

        {!subscription.subscribed && (
          <UpgradePremiumCard subscription={subscription} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NovaCobrancaForm 
            user={user}
            novaCobranca={novaCobranca}
            setNovaCobranca={setNovaCobranca}
            setUser={setUser}
            onSubmit={criarCobranca}
          />

          <CobrancasList 
            cobrancas={cobrancas}
            onCopiarLink={copiarLink}
            onExcluirCobranca={excluirCobranca}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;