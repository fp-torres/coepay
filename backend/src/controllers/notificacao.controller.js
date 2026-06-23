// src/controllers/notificacao.controller.js
import {
  NotificacaoLida,
  Devedor,
  User,
  EmailNotificationLog,
  EmailTemplate,
  EmailReminderRule,
} from "../models/initModels.js";
import { Op } from "sequelize";
import {
  getDefaultEmailTemplates,
  isValidEmailAddress,
  sendChargeEmailNotification,
} from "../services/charge-email.service.js";
import { createMessageLog } from "../services/message-log.service.js";

const defaultReminderRules = [
  {
    name: "5 dias antes do vencimento",
    trigger_type: "before_due",
    channel: "email",
    days_offset: 5,
    specific_date: null,
    repeat_interval_days: null,
    active: true,
  },
  {
    name: "No dia do vencimento",
    trigger_type: "due_today",
    channel: "email",
    days_offset: 0,
    specific_date: null,
    repeat_interval_days: null,
    active: true,
  },
  {
    name: "3 dias após vencimento",
    trigger_type: "after_due",
    channel: "email",
    days_offset: 3,
    specific_date: null,
    repeat_interval_days: null,
    active: true,
  },
  {
    name: "Repetir a cada 7 dias após vencimento",
    trigger_type: "repeat_after_due",
    channel: "email",
    days_offset: 0,
    specific_date: null,
    repeat_interval_days: 7,
    active: true,
  },
];

const registerEmailNotification = async ({
  charge,
  triggerKey,
  triggerType,
  templateType,
  sentBy,
  status,
  providerMessageId = null,
  errorMessage = null,
}) => {
  await EmailNotificationLog.create({
    charge_id: charge.id,
    trigger_key: triggerKey,
    trigger_type: triggerType,
    template_type: templateType,
    sent_by: sentBy,
    recipient_email: charge.email || "",
    status,
    provider_message_id: providerMessageId,
    error_message: errorMessage,
    sent_at: status === "sent" ? new Date() : null,
  });

  await charge.update({
    email_ultimo_envio_em: new Date(),
    email_ultimo_status: status,
  });
};

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
  const templateType = req.body.templateType || "manual";

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

    if (!isValidEmailAddress(charge.email)) {
      return res.status(400).json({
        message: "O e-mail cadastrado para o devedor é inválido.",
      });
    }

    if (charge.status === "paga" || charge.pago) {
      return res.status(400).json({ message: "Esta cobrança já está paga." });
    }

    try {
      const result = await sendChargeEmailNotification({
        charge,
        requestOrigin: req.get("origin"),
        templateType,
      });

      await registerEmailNotification({
        charge,
        triggerKey: `manual-${Date.now()}`,
        triggerType: "manual",
        templateType,
        sentBy: "manual",
        status: "sent",
        providerMessageId: result.providerMessageId,
      });

      await createMessageLog({
        userId: charge.user_id,
        channel: "email",
        recipient: result.sentTo,
        chargeId: charge.id,
        customerName: charge.nome,
        subject: "Cobrança CoéPay",
        message: `Cobrança enviada: ${result.publicChargeUrl}`,
        status: "sent",
      });

      res.json({
        message: "E-mail de cobrança enviado com sucesso.",
        sentTo: result.sentTo,
        chargeId: result.chargeId,
        sentAt: new Date().toISOString(),
      });
    } catch (error) {
      await registerEmailNotification({
        charge,
        triggerKey: `manual-failed-${Date.now()}`,
        triggerType: "manual",
        templateType,
        sentBy: "manual",
        status: "failed",
        errorMessage: error.message,
      });

      await createMessageLog({
        userId: charge.user_id,
        channel: "email",
        recipient: charge.email,
        chargeId: charge.id,
        customerName: charge.nome,
        subject: "Cobrança CoéPay",
        message: "Falha ao enviar cobrança por e-mail.",
        status: "failed",
        errorMessage: error.message,
      });

      throw error;
    }
  } catch (err) {
    console.error("Erro ao enviar e-mail de cobrança:", err);
    res.status(err.statusCode || 500).json({
      message: err.statusCode
        ? err.message
        : "Não foi possível enviar o e-mail de cobrança.",
    });
  }
};

export const listEmailTemplates = async (req, res) => {
  const userId = Number(req.params.userId);

  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ message: "Usuário inválido." });
  }

  try {
    const savedTemplates = await EmailTemplate.findAll({
      where: { user_id: userId },
      order: [["template_type", "ASC"]],
    });
    const savedByType = new Map(savedTemplates.map((template) => [template.template_type, template]));
    const templates = getDefaultEmailTemplates().map((template) => {
      const saved = savedByType.get(template.template_type);

      return {
        template_type: template.template_type,
        label: template.label,
        subject: saved?.subject || template.subject,
        body: saved?.body || template.body,
        active: saved?.active ?? true,
        customized: Boolean(saved),
      };
    });

    res.json(templates);
  } catch (err) {
    console.error("Erro ao listar templates:", err);
    res.status(500).json({ message: "Erro ao listar templates de e-mail." });
  }
};

export const upsertEmailTemplate = async (req, res) => {
  const userId = Number(req.params.userId);
  const { templateType } = req.params;
  const { subject, body, active = true } = req.body;

  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ message: "Usuário inválido." });
  }

  if (!subject?.trim() || !body?.trim()) {
    return res.status(400).json({ message: "Assunto e corpo do e-mail são obrigatórios." });
  }

  try {
    const [template] = await EmailTemplate.upsert(
      {
        user_id: userId,
        template_type: templateType,
        subject: subject.trim(),
        body: body.trim(),
        active: Boolean(active),
      },
      { returning: true }
    );

    res.json(template);
  } catch (err) {
    console.error("Erro ao salvar template:", err);
    res.status(500).json({ message: "Erro ao salvar template de e-mail." });
  }
};

export const listReminderRules = async (req, res) => {
  const userId = Number(req.params.userId);

  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ message: "Usuário inválido." });
  }

  try {
    const rules = await EmailReminderRule.findAll({
      where: { user_id: userId },
      order: [["id", "ASC"]],
    });

    if (!rules.length) {
      return res.json(defaultReminderRules.map((rule) => ({ ...rule, id: null, default: true })));
    }

    res.json(rules);
  } catch (err) {
    console.error("Erro ao listar regras de aviso:", err);
    res.status(500).json({ message: "Erro ao listar regras de aviso." });
  }
};

export const replaceReminderRules = async (req, res) => {
  const userId = Number(req.params.userId);
  const rules = Array.isArray(req.body.rules) ? req.body.rules : [];

  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ message: "Usuário inválido." });
  }

  try {
    await EmailReminderRule.destroy({ where: { user_id: userId } });

    const normalizedRules = rules
      .filter((rule) => rule?.name && rule?.trigger_type)
      .map((rule) => ({
        user_id: userId,
        name: String(rule.name).slice(0, 100),
        trigger_type: rule.trigger_type,
        channel: ["email", "whatsapp", "both"].includes(rule.channel) ? rule.channel : "email",
        days_offset:
          rule.days_offset === null || rule.days_offset === "" || rule.days_offset === undefined
            ? null
            : Number(rule.days_offset),
        specific_date: rule.specific_date || null,
        repeat_interval_days:
          rule.repeat_interval_days === null ||
          rule.repeat_interval_days === "" ||
          rule.repeat_interval_days === undefined
            ? null
            : Number(rule.repeat_interval_days),
        active: Boolean(rule.active),
      }));

    const savedRules = normalizedRules.length
      ? await EmailReminderRule.bulkCreate(normalizedRules, { returning: true })
      : [];

    res.json(savedRules);
  } catch (err) {
    console.error("Erro ao salvar regras de aviso:", err);
    res.status(500).json({ message: "Erro ao salvar regras de aviso." });
  }
};
