import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  cobrancaId: string;
  nomeDevedor: string;
  valor: number;
  timestamp: Date;
  read: boolean;
}

export const useNotifications = (userId: number | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_URL = "http://localhost:5000"; // ✅ usar porta certa

  // 1️⃣ Buscar notificações iniciais do backend
useEffect(() => {
  if (!userId) return;

  const fetchNotifications = async () => {
    try {
      const resp = await fetch(`http://localhost:5000/notifications/${userId}`);
      const data = await resp.json();

      // Cria notificações sem duplicar
      const newNotifications: Notification[] = data
        .map((c: any) => ({
          id: `${c.id}-${Date.now()}`,
          cobrancaId: c.id,
          nomeDevedor: c.nome,
          valor: Number(c.valor),
          timestamp: new Date(c.pago_em || Date.now()),
          read: false,
        }))
        .filter((n) => !notifications.some((prev) => prev.cobrancaId === n.cobrancaId));

      if (newNotifications.length > 0) {
        setNotifications((prev) => [...newNotifications, ...prev]);
        setUnreadCount((prev) => prev + newNotifications.length);
      }
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
    }
  };

  // Primeiro fetch imediato
  fetchNotifications();

  // Intervalo de atualização
  const interval = setInterval(fetchNotifications, 10000); // a cada 10s

  return () => clearInterval(interval);
}, [userId, notifications]);

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
              id: `${newData.id}-${Date.now()}`,
              cobrancaId: newData.id,
              nomeDevedor: newData.nome_devedor,
              valor: Number(newData.valor),
              timestamp: new Date(),
              read: false,
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
