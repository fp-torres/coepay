import cron from "node-cron";
import { Op } from "sequelize";
import {
  Devedor,
  EmailNotificationLog,
  EmailReminderRule,
  User,
  UserProfile,
} from "../models/initModels.js";
import {
  buildPublicChargeUrl,
  getCurrentChargeValue,
  sendChargeEmailNotification,
} from "../services/charge-email.service.js";
import { createMessageLog } from "../services/message-log.service.js";
import { findTemplateForEvent, renderTemplate } from "../services/template.service.js";
import { normalizePhone, sendWhatsAppMessage } from "../services/whatsapp.service.js";

const oneDayMs = 24 * 60 * 60 * 1000;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
});

const defaultReminderRules = [
  {
    id: "default-before-5",
    name: "5 dias antes do vencimento",
    trigger_type: "before_due",
    channel: "email",
    days_offset: 5,
    repeat_interval_days: null,
    active: true,
  },
  {
    id: "default-due-today",
    name: "No dia do vencimento",
    trigger_type: "due_today",
    channel: "email",
    days_offset: 0,
    repeat_interval_days: null,
    active: true,
  },
  {
    id: "default-after-3",
    name: "3 dias após vencimento",
    trigger_type: "after_due",
    channel: "email",
    days_offset: 3,
    repeat_interval_days: null,
    active: true,
  },
  {
    id: "default-repeat-7",
    name: "Repetir a cada 7 dias após vencimento",
    trigger_type: "repeat_after_due",
    channel: "email",
    days_offset: 0,
    repeat_interval_days: 7,
    active: true,
  },
];

const toStartOfDay = (date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
};

const toDateKey = (date) => toStartOfDay(date).toISOString().slice(0, 10);

const daysUntilDue = (charge, referenceDate = new Date()) => {
  const today = toStartOfDay(referenceDate);
  const dueDate = toStartOfDay(charge.data_vencimento);
  return Math.round((dueDate.getTime() - today.getTime()) / oneDayMs);
};

const getTemplateTypeForRule = (rule) => {
  if (rule.trigger_type === "before_due") return "before_due";
  if (rule.trigger_type === "due_today") return "due_today";
  if (rule.trigger_type === "repeat_after_due") return "repeat_after_due";
  return "after_due";
};

const buildTriggerForRule = (charge, rule, referenceDate = new Date()) => {
  if (!rule.active) return null;

  const diff = daysUntilDue(charge, referenceDate);
  const todayKey = toDateKey(referenceDate);
  const ruleId = rule.id || `${rule.trigger_type}-${rule.days_offset || 0}`;

  if (rule.trigger_type === "specific_date") {
    if (!rule.specific_date || toDateKey(rule.specific_date) !== todayKey) return null;
    return {
      key: `rule-${ruleId}-specific-${todayKey}`,
      type: "specific_date",
      templateType: "manual",
      channel: rule.channel || "email",
    };
  }

  if (rule.trigger_type === "before_due") {
    const offset = Number(rule.days_offset || 0);
    if (diff !== offset) return null;
    return {
      key: `rule-${ruleId}-before-${offset}`,
      type: "before_due",
      templateType: "before_due",
      channel: rule.channel || "email",
    };
  }

  if (rule.trigger_type === "due_today") {
    if (diff !== 0) return null;
    return {
      key: `rule-${ruleId}-due-today`,
      type: "due_today",
      templateType: "due_today",
      channel: rule.channel || "email",
    };
  }

  if (rule.trigger_type === "after_due") {
    const offset = Number(rule.days_offset || 0);
    if (diff !== -Math.abs(offset)) return null;
    return {
      key: `rule-${ruleId}-after-${Math.abs(offset)}`,
      type: "after_due",
      templateType: "after_due",
      channel: rule.channel || "email",
    };
  }

  if (rule.trigger_type === "repeat_after_due") {
    if (diff >= 0) return null;

    const daysOverdue = Math.abs(diff);
    const startAfterDays = Number(rule.days_offset || 0);
    const interval = Math.max(Number(rule.repeat_interval_days || 7), 1);

    if (daysOverdue < startAfterDays) return null;
    if ((daysOverdue - startAfterDays) % interval !== 0) return null;

    return {
      key: `rule-${ruleId}-repeat-${todayKey}`,
      type: "repeat_after_due",
      templateType: "repeat_after_due",
      channel: rule.channel || "email",
    };
  }

  return null;
};

const findPendingCharges = async () =>
  Devedor.findAll({
    where: {
      status: { [Op.notIn]: ["paga", "cancelada", "finalizada"] },
      pago: { [Op.ne]: true },
    },
    include: [{ model: User, attributes: ["id", "name", "email", "pix"] }],
    order: [["data_vencimento", "ASC"]],
  });

const getRulesForUser = async (userId) => {
  const rules = await EmailReminderRule.findAll({
    where: {
      user_id: userId,
      active: true,
    },
    order: [["id", "ASC"]],
  });

  return rules.length ? rules : defaultReminderRules;
};

const hasAlreadySentTrigger = async (chargeId, triggerKey) => {
  const existingLog = await EmailNotificationLog.findOne({
    where: {
      charge_id: chargeId,
      trigger_key: triggerKey,
      status: "sent",
    },
  });

  return Boolean(existingLog);
};

const registerEmailNotification = async ({
  charge,
  trigger,
  status,
  providerMessageId = null,
  errorMessage = null,
  recipient = null,
}) => {
  const triggerKey =
    status === "sent"
      ? trigger.key
      : `${trigger.key}-failed-${Date.now().toString().slice(-10)}`;

  await EmailNotificationLog.create({
    charge_id: charge.id,
    trigger_key: triggerKey,
    trigger_type: trigger.type,
    template_type: trigger.templateType,
    sent_by: "automatic",
    recipient_email: recipient || charge.email || "",
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

const getChannelsForTrigger = (trigger) => {
  if (trigger.channel === "both") return ["email", "whatsapp"];
  if (trigger.channel === "whatsapp") return ["whatsapp"];
  return ["email"];
};

const buildWhatsAppVariables = async ({ charge, requestOrigin }) => {
  const currentValue = getCurrentChargeValue(charge);
  const publicUrl = buildPublicChargeUrl(charge, requestOrigin);
  const profile = await UserProfile.findOne({ where: { user_id: charge.user_id } });
  const companyName = profile?.name || charge.User?.name || "CoéPay";
  const companyEmail = profile?.email || charge.User?.email || "";
  const companyPhone = profile?.phone || profile?.whatsapp_phone || "";
  const dueDate = dateFormatter.format(new Date(charge.data_vencimento));
  const value = currencyFormatter.format(currentValue);
  const description = charge.descricao || "Cobrança registrada no CoéPay";
  const pix = charge.pix_cobranca || charge.User?.pix || "";

  return {
    nome_cliente: charge.nome || "Cliente",
    valor: value,
    data_vencimento: dueDate,
    status: charge.status,
    link_pagamento: publicUrl,
    descricao: description,
    nome_empresa: companyName,
    email_empresa: companyEmail,
    telefone_empresa: companyPhone,
    pix,
    codigo_pix: pix,
    qr_code_pix: "",
    businessName: companyName,
    customerName: charge.nome || "Cliente",
    total: value,
    dueDate,
    paymentLink: publicUrl,
    obs: description,
  };
};

const sendChargeWhatsAppNotification = async ({ charge, trigger }) => {
  const recipient = charge.whatsapp_devedor || charge.telefone;

  if (!recipient) {
    const error = new Error("Esta cobrança não possui telefone/WhatsApp para o devedor.");
    error.statusCode = 400;
    throw error;
  }

  const template = await findTemplateForEvent({
    userId: charge.user_id,
    channel: "whatsapp",
    eventType: trigger.templateType,
  });
  const variables = await buildWhatsAppVariables({ charge });
  const message = renderTemplate(template.body, variables);

  await sendWhatsAppMessage({ userId: charge.user_id, phone: recipient, message });

  return {
    sentTo: normalizePhone(recipient),
    publicChargeUrl: variables.link_pagamento,
    message,
  };
};

export const processChargeEmailReminders = async () => {
  const charges = await findPendingCharges();
  const rulesByUser = new Map();
  const results = {
    checked: charges.length,
    sent: 0,
    skipped: 0,
    failed: 0,
  };

  for (const charge of charges) {
    if (!rulesByUser.has(charge.user_id)) {
      rulesByUser.set(charge.user_id, await getRulesForUser(charge.user_id));
    }

    const rules = rulesByUser.get(charge.user_id);
    const triggers = rules.map((rule) => buildTriggerForRule(charge, rule)).filter(Boolean);

    if (!triggers.length) {
      results.skipped += 1;
      continue;
    }

    for (const trigger of triggers) {
      const channels = getChannelsForTrigger(trigger);

      for (const channel of channels) {
        const channelTrigger = { ...trigger, key: `${trigger.key}-${channel}` };
        const alreadySent = await hasAlreadySentTrigger(charge.id, channelTrigger.key);

        if (alreadySent) {
          results.skipped += 1;
          continue;
        }

        try {
          if (channel === "email") {
            const emailResult = await sendChargeEmailNotification({
              charge,
              templateType: trigger.templateType || getTemplateTypeForRule(trigger),
            });

            await registerEmailNotification({
              charge,
              trigger: channelTrigger,
              status: "sent",
              providerMessageId: emailResult.providerMessageId,
            });

            await createMessageLog({
              userId: charge.user_id,
              channel: "email",
              recipient: charge.email || "",
              chargeId: charge.id,
              customerName: charge.nome,
              subject: `Aviso automático: ${trigger.type}`,
              message: `Lembrete enviado: ${emailResult.publicChargeUrl}`,
              status: "sent",
            });
          } else {
            const whatsappResult = await sendChargeWhatsAppNotification({
              charge,
              trigger,
            });

            await registerEmailNotification({
              charge,
              trigger: channelTrigger,
              status: "sent",
              providerMessageId: null,
              recipient: whatsappResult.sentTo,
            });

            await createMessageLog({
              userId: charge.user_id,
              channel: "whatsapp",
              recipient: whatsappResult.sentTo,
              chargeId: charge.id,
              customerName: charge.nome,
              subject: `Aviso automático: ${trigger.type}`,
              message: whatsappResult.message,
              status: "sent",
            });
          }

          results.sent += 1;
        } catch (error) {
          await registerEmailNotification({
            charge,
            trigger: channelTrigger,
            status: "failed",
            errorMessage: error.message,
            recipient:
              channel === "whatsapp"
                ? normalizePhone(charge.whatsapp_devedor || charge.telefone || "")
                : charge.email || "",
          });

          await createMessageLog({
            userId: charge.user_id,
            channel,
            recipient:
              channel === "whatsapp"
                ? normalizePhone(charge.whatsapp_devedor || charge.telefone || "")
                : charge.email || "",
            chargeId: charge.id,
            customerName: charge.nome,
            subject: `Aviso automático: ${trigger.type}`,
            message: "Falha ao enviar lembrete automático.",
            status: "failed",
            errorMessage: error.message,
          });

          console.error(`Erro ao enviar lembrete da cobrança ${charge.id}:`, error);
          results.failed += 1;
        }
      }
    }
  }

  return results;
};

export const startChargeEmailReminderJob = () => {
  if (process.env.EMAIL_REMINDERS_ENABLED !== "true") {
    console.log("Lembretes automáticos por e-mail desativados.");
    return null;
  }

  const cronExpression = process.env.EMAIL_REMINDER_CRON || "0 9 * * *";
  const timezone = process.env.EMAIL_REMINDER_TIMEZONE || "America/Sao_Paulo";

  const task = cron.schedule(
    cronExpression,
    async () => {
      console.log("Processando lembretes automáticos por e-mail...");
      const results = await processChargeEmailReminders();
      console.log("Resumo dos lembretes por e-mail:", results);
    },
    { timezone }
  );

  console.log(`Lembretes automáticos por e-mail ativos: ${cronExpression} (${timezone})`);

  if (process.env.EMAIL_REMINDERS_RUN_ON_START === "true") {
    processChargeEmailReminders()
      .then((results) => console.log("Resumo inicial dos lembretes por e-mail:", results))
      .catch((error) => console.error("Erro no processamento inicial de lembretes:", error));
  }

  return task;
};
