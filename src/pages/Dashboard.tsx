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
import { CobrancasPagasList } from "@/components/dashboard/CobrancasPagasList";

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
  status: 'ativa' | 'vencida' | 'paga';
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
    descricao: "",
    whatsappDevedor: "",
    pixCobranca: "",
  });
    useEffect(() => {
      if (!user?.id) return;

      // Função de atualização periódica
      const interval = setInterval(() => {
        carregarCobrancas(user.id);
      }, 10000); // a cada 10 segundos

      return () => clearInterval(interval);
    }, [user]);

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
      periodos = diasVencido / 30; // Usando 30 dias por mês para consistência
    }
    
    const taxa = taxaJuros / 100;
    return valor * Math.pow(1 + taxa, periodos);
  };

  const carregarCobrancas = async (userId: number) => {
  try {
    const response = await fetch(`http://localhost:3000/devedores?user_id=${userId}`);
    if (response.ok) {
      const data = await response.json();
      const cobrancasFormatadas = data.map((item: any) => {
        const valorNum = Number(item.valor);
        const taxaJurosNum = Number(item.taxa_juros);
        const valorAtual = (taxaJurosNum && item.tipo_juros)
          ? calcularJurosCompostos(valorNum, taxaJurosNum, item.tipo_juros, item.data_vencimento)
          : valorNum;

        const hoje = new Date();
        const vencimento = new Date(item.data_vencimento);
        const status = item.pago ? 'paga' : (hoje > vencimento ? 'vencida' : 'ativa');

        return {
          id: item.id.toString(),
          nomeDevedor: item.nome,
          valor: valorNum,
          valorAtual,
          dataVencimento: item.data_vencimento,
          status,
          link: `${window.location.origin}/cobranca/${item.hash}`,
          taxaJuros: taxaJurosNum || undefined,
          tipoJuros: item.tipo_juros as 'mensal' | 'diario' | undefined,
          // adiciona campo legível para exibir
          jurosLabel: taxaJurosNum 
            ? `${taxaJurosNum}% ${item.tipo_juros === 'diario' ? 'ao dia' : 'ao mês'}`
            : "Sem juros",
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
    if (!subscription.subscribed && cobrancas.length >= 15) {
        toast({
          title: "💎 Limite atingido!",
          description: "Usuários gratuitos podem criar apenas 5 cobranças. Upgrade para premium para criar ilimitadas.",
          className: "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-md",
        });

      return;
    }

    const valorInicial = Number(novaCobranca.valor.replace(/[^\d,]/g, '').replace(',', '.'));
    const taxaJuros = subscription.subscribed ? Number(novaCobranca.taxaJuros) || 0 : 0;

    try {
      const response = await fetch('http://localhost:3000/devedores', {
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
          taxa_juros: novaCobranca.taxaJuros ? Number(novaCobranca.taxaJuros) : null,  
          tipo_juros: novaCobranca.taxaJuros ? novaCobranca.tipoJuros : null,
          descricao: novaCobranca.descricao ? novaCobranca.descricao : null,
          whatsapp_devedor: novaCobranca.whatsappDevedor ? novaCobranca.whatsappDevedor : null,
          pix_cobranca: novaCobranca.pixCobranca ? novaCobranca.pixCobranca : null
        })
      });

      if (response.ok) {
        const novaCobrancaCriada = await response.json();
        
        // Recarregar cobranças do backend
        await carregarCobrancas(user.id);

        setNovaCobranca({ nomeDevedor: "", valor: "", dataVencimento: "", taxaJuros: "", tipoJuros: "mensal", descricao: "", whatsappDevedor: "", pixCobranca: "" });
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
              const response = await fetch(`http://localhost:3000/devedores/${id}`, {
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


  const totalReceber = cobrancas.filter(c => c.status !== 'paga').reduce((sum, c) => sum + (c.valorAtual || c.valor), 0);
  const cobrancasAtivas = cobrancas.filter(c => c.status === 'ativa').length;
  const cobrancasVencidas = cobrancas.filter(c => c.status === 'vencida').length;
  const cobrancasPagas = cobrancas.filter(c => c.status === 'paga').length;
  const totalRecebido = cobrancas.filter(c => c.status === 'paga').reduce((sum, c) => sum + c.valor, 0);

  if (!user) return null;

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader 
          user={user} 
          subscription={{
            subscribed: subscription.subscribed,
            plan: subscription.plan,
            openCustomerPortal: subscription.openCustomerPortal,
          }}
          cobrancasCount={cobrancas.length}
          onLogout={handleLogout} 
        />

        <DashboardCards
          totalReceber={totalReceber}
          cobrancasAtivas={cobrancasAtivas}
          cobrancasVencidas={cobrancasVencidas}
          cobrancasPagas={cobrancasPagas}
          totalRecebido={totalRecebido}
        />

        {subscription.plan !== "premium" && (
          <UpgradePremiumCard plan={subscription.plan} />
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
            cobrancas={cobrancas.filter(c => c.status !== 'paga')}
            onCopiarLink={copiarLink}
            onExcluirCobranca={excluirCobranca}
          />
        </div>

        {cobrancasPagas > 0 && (
          <CobrancasPagasList cobrancas={cobrancas} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;