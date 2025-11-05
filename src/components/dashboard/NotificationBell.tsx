import { Bell, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationBell = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: NotificationBellProps) => {
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'due_soon':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'payment_confirmed':
        return {
          title: 'Pagamento confirmado! 🎉',
          description: (
            <>
              <span className="font-semibold">{notification.nomeDevedor}</span> marcou a cobrança de{' '}
              <span className="font-semibold text-green-600">R$ {notification.valor.toFixed(2)}</span> como paga
            </>
          ),
        };
      case 'due_soon':
        return {
          title: 'Cobrança vencendo em breve ⏰',
          description: (
            <>
              Cobrança de <span className="font-semibold">{notification.nomeDevedor}</span> no valor de{' '}
              <span className="font-semibold text-yellow-600">R$ {notification.valor.toFixed(2)}</span> vence em breve
            </>
          ),
        };
      case 'overdue':
        return {
          title: 'Cobrança vencida! ⚠️',
          description: (
            <>
              Cobrança de <span className="font-semibold">{notification.nomeDevedor}</span> no valor de{' '}
              <span className="font-semibold text-red-600">R$ {notification.valor.toFixed(2)}</span> está vencida
            </>
          ),
        };
      default:
        return { title: 'Notificação', description: '' };
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    onMarkAsRead(notification.id);
    // Navegação pode ser implementada futuramente para ir até a cobrança específica
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100 transition-colors rounded-full"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-h-[16px] min-w-[16px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-[2px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 rounded-lg border border-gray-200" align="end">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-sm text-gray-800">Notificações</h3>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs h-7"
              >
                Marcar todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="text-xs h-7 text-red-500"
              >
                Limpar
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <Bell className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => {
                const message = getNotificationMessage(notification);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.read ? "bg-muted/30" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {message.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {message.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(notification.timestamp, {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <Badge
                          variant="destructive"
                          className="h-2 w-2 p-0 rounded-full mt-1"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
