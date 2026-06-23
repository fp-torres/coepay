// src/controllers/notificacao.controller.js
import { NotificacaoLida, Devedor, User } from "../models/initModels.js";
import { Op } from "sequelize";
import { sendChargeEmailNotification } from "../services/charge-email.service.js";

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

export const sendChargeEmail = async (req, res) => {
  const chargeId = req.body.chargeId || req.body.cobrancaId;

  if (!chargeId || Number.isNaN(Number(chargeId))) {
    return res.status(400).json({ message: "ID da cobrança inválido." });
  }

  try {
    const charge = await Devedor.findByPk(chargeId, {
      include: [{ model: User, attributes: ["id", "name", "email", "pix"] }],
    });

    if (!charge) {
      return res.status(404).json({ message: "Cobrança não encontrada." });
    }

    if (!charge.email) {
      return res.status(400).json({
        message: "Esta cobrança não possui e-mail cadastrado para o devedor.",
      });
    }

    if (charge.status === "paga" || charge.pago) {
      return res.status(400).json({ message: "Esta cobrança já está paga." });
    }

    const result = await sendChargeEmailNotification({
      charge,
      requestOrigin: req.get("origin"),
    });

    res.json({
      message: "E-mail de cobrança enviado com sucesso.",
      sentTo: result.sentTo,
      chargeId: result.chargeId,
    });
  } catch (err) {
    console.error("Erro ao enviar e-mail de cobrança:", err);
    res.status(err.statusCode || 500).json({
      message: err.statusCode
        ? err.message
        : "Não foi possível enviar o e-mail de cobrança.",
    });
  }
};
