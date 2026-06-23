import cron from "node-cron";
import { Op } from "sequelize";
import { Devedor, EmailNotificationLog, User } from "../models/initModels.js";
import { sendChargeEmailNotification } from "../services/charge-email.service.js";

const reminderDaysBeforeDue = [10, 7, 3, 1];
const oneDayMs = 24 * 60 * 60 * 1000;

const toStartOfDay = (date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
};

const toDateKey = (date) => toStartOfDay(date).toISOString().slice(0, 10);

const getReminderTrigger = (charge, referenceDate = new Date()) => {
  const today = toStartOfDay(referenceDate);
  const dueDate = toStartOfDay(charge.data_vencimento);
  const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / oneDayMs);

  if (reminderDaysBeforeDue.includes(daysUntilDue)) {
    return {
      key: `before-due-${daysUntilDue}`,
      type: "before_due",
      daysUntilDue,
    };
  }

  if (daysUntilDue === 0) {
    return {
      key: "due-today",
      type: "due_today",
      daysUntilDue,
    };
  }

  if (daysUntilDue < 0) {
    return {
      key: `overdue-${toDateKey(today)}`,
      type: "overdue",
      daysUntilDue,
    };
  }

  return null;
};

const findPendingEmailCharges = async () =>
  Devedor.findAll({
    where: {
      email: {
        [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }],
      },
      status: { [Op.ne]: "paga" },
      pago: { [Op.ne]: true },
    },
    include: [{ model: User, attributes: ["id", "name", "email", "pix"] }],
    order: [["data_vencimento", "ASC"]],
  });

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
}) => {
  const triggerKey =
    status === "sent"
      ? trigger.key
      : `${trigger.key}-failed-${Date.now().toString().slice(-10)}`;

  await EmailNotificationLog.create({
    charge_id: charge.id,
    trigger_key: triggerKey,
    trigger_type: trigger.type,
    recipient_email: charge.email,
    status,
    provider_message_id: providerMessageId,
    error_message: errorMessage,
    sent_at: status === "sent" ? new Date() : null,
  });
};

export const processChargeEmailReminders = async () => {
  const charges = await findPendingEmailCharges();
  const results = {
    checked: charges.length,
    sent: 0,
    skipped: 0,
    failed: 0,
  };

  for (const charge of charges) {
    const trigger = getReminderTrigger(charge);

    if (!trigger) {
      results.skipped += 1;
      continue;
    }

    const alreadySent = await hasAlreadySentTrigger(charge.id, trigger.key);

    if (alreadySent) {
      results.skipped += 1;
      continue;
    }

    try {
      const emailResult = await sendChargeEmailNotification({ charge });

      await registerEmailNotification({
        charge,
        trigger,
        status: "sent",
        providerMessageId: emailResult.providerMessageId,
      });

      results.sent += 1;
    } catch (error) {
      await registerEmailNotification({
        charge,
        trigger,
        status: "failed",
        errorMessage: error.message,
      });

      console.error(`Erro ao enviar lembrete da cobrança ${charge.id}:`, error);
      results.failed += 1;
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
