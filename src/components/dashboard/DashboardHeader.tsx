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
  status: "ativa" | "vencida";
  link: string;
  taxaJuros?: number;
  tipoJuros?: "mensal" | "diario";
}

interface DashboardHeaderProps {
  user: User;
  subscription: {
    subscribed: boolean;
    plan: "free" | "basic" | "premium";
    openCustomerPortal: () => void;
  };
  cobrancasCount: number;
  onLogout: () => void;
}

export const DashboardHeader = ({
  user,
  subscription,
  cobrancasCount,
  onLogout,
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications(user.id);

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
          {subscription.subscribed && subscription.plan === "basic" && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Basic
            </Badge>
          )}
          {subscription.subscribed && subscription.plan === "premium" && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Gerencie suas cobranças{" "}
          {subscription.plan === "free" && (
            <span className="text-amber-600">
              • {cobrancasCount}/5 cobranças usadas
            </span>
          )}
          {subscription.plan === "basic" && (
            <span className="text-blue-600">
              • {cobrancasCount}/50 cobranças usadas
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

        {/* Gerenciar Assinatura */}
        {subscription.subscribed && (
          <Button
            size="sm"
            onClick={subscription.openCustomerPortal}
            className="flex items-center justify-center w-full sm:w-auto px-4 py-2 
                       bg-gradient-to-r from-amber-400 via-pink-400 to-purple-500
                       text-white font-semibold shadow-sm rounded-xl
                       hover:from-amber-500 hover:via-pink-500 hover:to-purple-600
                       transition-all duration-300"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Gerenciar Assinatura
          </Button>
        )}
      </div>
    </div>
  );
};
