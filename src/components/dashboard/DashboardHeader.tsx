import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Crown, CreditCard, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface DashboardHeaderProps {
  user: User;
  subscription: {
    subscribed: boolean;
    openCustomerPortal: () => void;
  };
  cobrancasCount: number;
  onLogout: () => void;
}

export const DashboardHeader = ({ user, subscription, cobrancasCount, onLogout }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  return (
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
            <span className="text-amber-600"> • {cobrancasCount}/3 cobranças usadas</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/relatorios')}
          disabled={!subscription.subscribed}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Relatórios Avançados
        </Button>
        {subscription.subscribed && (
          <Button variant="outline" size="sm" onClick={subscription.openCustomerPortal}>
            <CreditCard className="w-4 h-4 mr-2" />
            Gerenciar Assinatura
          </Button>
        )}
        <Button variant="outline" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};