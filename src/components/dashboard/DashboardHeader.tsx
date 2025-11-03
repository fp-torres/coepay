import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Crown, CreditCard, BarChart3, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "./NotificationBell";
import { useNotifications } from "@/hooks/useNotifications";

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
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications(user.id);
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
      {/* Informações do usuário */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="bg-gradient-to-r from-coepay-primary to-coepay-secondary bg-clip-text text-transparent">
              Olá, {user.name}!
            </span>
          </h1>
          {subscription.subscribed && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Gerencie suas cobranças{" "}
          {!subscription.subscribed && (
            <span className="text-amber-600">
              • {cobrancasCount}/5 cobranças usadas
            </span>
          )}
        </p>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearNotifications}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/relatorios")}
          className="flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-coepay-primary to-coepay-secondary text-white font-semibold shadow-sm
                     hover:opacity-90 transition"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Relatórios Avançados
        </Button>

        {subscription.subscribed && (
          <Button
            variant="outline"
            size="sm"
            onClick={subscription.openCustomerPortal}
            className="flex items-center justify-center w-full sm:w-auto"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Gerenciar Assinatura
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/configuracoes")}
          className="flex items-center justify-center w-full sm:w-auto"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configurações
        </Button>

        <Button
          variant="outline"
          onClick={onLogout}
          className="flex items-center justify-center w-full sm:w-auto border text-coepay-primary font-semibold shadow-sm
                     hover:bg-gradient-to-r hover:from-coepay-primary hover:to-coepay-secondary hover:text-white transition"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};
