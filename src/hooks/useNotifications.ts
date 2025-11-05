import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  cobrancaId: string;
  nomeDevedor: string;
  valor: number;
  timestamp: Date;
  read: boolean;
  type: 'payment_confirmed' | 'due_soon' | 'overdue';
}

export const useNotifications = (userId: number | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_URL = "http://localhost:5000"; // ✅ usar porta certa

  // 1️⃣ Buscar notificações iniciais do backend e verificar vencimentos
useEffect(() => {
  if (!userId) return;

  const fetchNotifications = async () => {
    try {
      // Buscar cobranças pagas
      const resp = await fetch(`http://localhost:5000/notifications/${userId}`);
      const data = await resp.json();

      // Buscar todas as cobranças ativas para verificar vencimentos
      const cobrancasResp = await fetch(`http://localhost:5000/devedores?userId=${userId}`);
      const cobrancasData = await cobrancasResp.json();

      const hoje = new Date();
      const newNotifications: Notification[] = [];

      // Notificações de pagamento
      data.forEach((c: any) => {
        if (!notifications.some((prev) => prev.cobrancaId === c.id && prev.type === 'payment_confirmed')) {
          newNotifications.push({
            id: `payment-${c.id}-${Date.now()}`,
            cobrancaId: c.id,
            nomeDevedor: c.nome,
            valor: Number(c.valor),
            timestamp: new Date(c.pago_em || Date.now()),
            read: false,
            type: 'payment_confirmed',
          });
        }
      });

      // Notificações de vencimento
      cobrancasData.forEach((c: any) => {
        if (c.pago) return;

        const vencimento = new Date(c.data_vencimento);
        const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

        // Vencendo em 3 dias ou menos (mas ainda não vencido)
        if (diffDays > 0 && diffDays <= 3) {
          const notifId = `due_soon-${c.id}`;
          if (!notifications.some((prev) => prev.id === notifId)) {
            newNotifications.push({
              id: notifId,
              cobrancaId: c.id,
              nomeDevedor: c.nome,
              valor: Number(c.valor),
              timestamp: new Date(),
              read: false,
              type: 'due_soon',
            });
          }
        }

        // Já vencido
        if (diffDays < 0) {
          const notifId = `overdue-${c.id}`;
          if (!notifications.some((prev) => prev.id === notifId)) {
            newNotifications.push({
              id: notifId,
              cobrancaId: c.id,
              nomeDevedor: c.nome,
              valor: Number(c.valor),
              timestamp: new Date(),
              read: false,
              type: 'overdue',
            });
          }
        }
      });

      if (newNotifications.length > 0) {
        setNotifications((prev) => [...newNotifications, ...prev]);
        setUnreadCount((prev) => prev + newNotifications.length);
      }
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
    }
  };

  fetchNotifications();
  const interval = setInterval(fetchNotifications, 60000); // a cada 1 minuto

  return () => clearInterval(interval);
}, [userId]);

  // 2️⃣ Realtime com Supabase
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("cobrancas-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cobrancas",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;

          if (newData.status === "pago" && oldData.status !== "pago") {
            const newNotification: Notification = {
              id: `payment-${newData.id}-${Date.now()}`,
              cobrancaId: newData.id,
              nomeDevedor: newData.nome_devedor,
              valor: Number(newData.valor),
              timestamp: new Date(),
              read: false,
              type: 'payment_confirmed',
            };

            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Funções de gerenciamento
  const markAsRead = async (notificationId: string) => {
    const notif = notifications.find((n) => n.id === notificationId);
    if (!notif) return;

    try {
      // ✅ Usar porta correta
      await fetch(`${API_URL}/notifications/${userId}/${notif.cobrancaId}/read`, {
        method: "PUT",
      });

      // Atualiza frontend local
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Atualiza backend
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) =>
            fetch(`${API_URL}/notifications/${userId}/${n.cobrancaId}/read`, {
              method: "PUT",
            })
          )
      );

      // Atualiza frontend
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    addNotification,
  };
};
