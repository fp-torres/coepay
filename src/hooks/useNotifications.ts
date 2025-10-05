import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  cobrancaId: number;
  nomeDevedor: string;
  valor: number;
  timestamp: Date;
  read: boolean;
}

export const useNotifications = (userId: number | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to realtime updates for payment confirmations
    const channel = supabase
      .channel('cobrancas-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cobrancas',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;
          
          // Check if status changed to 'pago'
          if (newData.status === 'pago' && oldData.status !== 'pago') {
            const newNotification: Notification = {
              id: `${newData.id}-${Date.now()}`,
              cobrancaId: newData.id,
              nomeDevedor: newData.nome_devedor,
              valor: Number(newData.valor),
              timestamp: new Date(),
              read: false,
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
};
