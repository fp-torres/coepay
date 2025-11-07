// src/controllers/notificacao.controller.js
import { NotificacaoLida, Devedor } from "../models/initModels.js";
import { Op } from "sequelize";

export const marcarNotificacaoComoLida = async (req, res) => {
  const { userId, cobrancaId } = req.params;

  try {
    await NotificacaoLida.findOrCreate({
      where: { user_id: userId, cobranca_id: cobrancaId },
    });

    res.json({ message: "Notificação marcada como lida" });
  } catch (err) {
    console.error("Erro ao marcar notificação como lida:", err);
    res.status(500).json({ message: "Erro ao marcar notificação como lida" });
  }
};


export const listarNotificacoesNaoLidas = async (req, res) => {
  const { userId } = req.params;

  try {
    const notificacoesLidas = await NotificacaoLida.findAll({
      where: { user_id: userId },
      attributes: ["cobranca_id"],
    });

    const idsLidos = notificacoesLidas.map((n) => n.cobranca_id);

    const notificacoes = await Devedor.findAll({
      where: {
        user_id: userId,
        status: "paga",
        id: { [Op.notIn]: idsLidos.length ? idsLidos : [0] }, // evita erro se vazio
      },
      order: [["pago_em", "DESC"]],
    });

    res.json(notificacoes);
  } catch (err) {
    console.error("Erro ao buscar notificações:", err);
    res.status(500).json({ message: "Erro ao buscar notificações" });
  }
};