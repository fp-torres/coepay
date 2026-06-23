import {
  EmailReminderRule,
  MessageLog,
  MessageTemplate,
  UserProfile,
} from "../models/initModels.js";
import {
  isValidEmailAddress,
  sendTransactionalEmailForUser,
  serializeEmailSetting,
  verifyEmailSetting,
} from "../services/email.service.js";
import { createMessageLog } from "../services/message-log.service.js";
import {
  connectWhatsAppSession,
  disconnectWhatsAppSession,
  getOrCreateWhatsAppSession,
  saveWhatsAppPhone,
  sendWhatsAppMessage,
  serializeWhatsAppSession,
} from "../services/whatsapp.service.js";
import { defaultMessageTemplates, listTemplatesForUser } from "../services/template.service.js";

const getUserId = (req) => req.authUser.id;

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

const normalizeReminderRule = (rule, userId) => ({
  user_id: userId,
  name: String(rule.name || "").slice(0, 100),
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
});

export const getProfile = async (req, res) => {
  const userId = getUserId(req);
  const [profile] = await UserProfile.findOrCreate({
    where: { user_id: userId },
    defaults: {
      user_id: userId,
      name: req.authUser.name,
      email: req.authUser.email,
    },
  });

  res.json(profile);
};

export const upsertProfile = async (req, res) => {
  const userId = getUserId(req);
  const { name, email, phone, whatsapp_phone, email_enabled, whatsapp_enabled } = req.body;

  if (email && !isValidEmailAddress(email)) {
    return res.status(400).json({ message: "E-mail inválido." });
  }

  const [profile] = await UserProfile.upsert(
    {
      user_id: userId,
      name: name || req.authUser.name,
      email: email || req.authUser.email,
      phone: phone || null,
      whatsapp_phone: whatsapp_phone || null,
      email_enabled: email_enabled === undefined ? true : Boolean(email_enabled),
      whatsapp_enabled: whatsapp_enabled === undefined ? false : Boolean(whatsapp_enabled),
    },
    { returning: true }
  );

  res.json(profile);
};

export const getEmailSettings = async (req, res) => {
  res.json(await serializeEmailSetting(getUserId(req)));
};

export const saveEmailSettings = async (req, res) => {
  const userId = getUserId(req);
  const {
    company_name,
    contact_email,
    contact_phone,
    email_enabled = true,
    whatsapp_enabled,
  } = req.body;

  if (contact_email && !isValidEmailAddress(contact_email)) {
    return res.status(400).json({ message: "E-mail de contato inválido." });
  }

  const [profile] = await UserProfile.upsert(
    {
      user_id: userId,
      name: company_name || req.authUser.name,
      email: contact_email || req.authUser.email,
      phone: contact_phone || null,
      whatsapp_phone: contact_phone || null,
      email_enabled: Boolean(email_enabled),
      whatsapp_enabled: whatsapp_enabled === undefined ? false : Boolean(whatsapp_enabled),
    },
    { returning: true }
  );

  res.json({
    ...(await serializeEmailSetting(userId)),
    company_name: profile.name,
    contact_email: profile.email,
    contact_phone: profile.phone,
  });
};

export const testEmailSettings = async (req, res) => {
  const userId = getUserId(req);
  const to = req.body.to || req.authUser.email;

  try {
    await verifyEmailSetting(userId);
    const result = await sendTransactionalEmailForUser({
      userId,
      to,
      subject: "Teste de envio CoéPay",
      html: "<p>O envio central do CoéPay está funcionando. Respostas irão para o e-mail de contato da sua empresa.</p>",
      text: "O envio central do CoéPay está funcionando. Respostas irão para o e-mail de contato da sua empresa.",
    });

    await createMessageLog({
      userId,
      channel: "email",
      recipient: to,
      subject: "Teste de envio CoéPay",
      message: "Teste do envio central do CoéPay.",
      status: "sent",
    });

    res.json({ message: "E-mail de teste enviado com sucesso.", messageId: result.messageId });
  } catch (error) {
    await createMessageLog({
      userId,
      channel: "email",
      recipient: to,
      subject: "Teste de envio CoéPay",
      message: "Teste do envio central do CoéPay.",
      status: "failed",
      errorMessage: error.message,
    });

    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getWhatsAppSettings = async (req, res) => {
  const session = await getOrCreateWhatsAppSession(getUserId(req));
  res.json(serializeWhatsAppSession(session));
};

export const saveWhatsAppSettings = async (req, res) => {
  try {
    const session = await saveWhatsAppPhone({
      userId: getUserId(req),
      phone: req.body.phone,
    });

    res.json(serializeWhatsAppSession(session));
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const connectWhatsApp = async (req, res) => {
  try {
    const currentSession = await getOrCreateWhatsAppSession(getUserId(req));
    const session = await connectWhatsAppSession({
      userId: getUserId(req),
      phone: req.body.phone || currentSession.phone,
    });

    res.json(serializeWhatsAppSession(session));
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getWhatsAppQr = async (req, res) => {
  const session = await getOrCreateWhatsAppSession(getUserId(req));
  res.json({
    qrCode: session.last_qr_code,
    status: session.status,
    lastQrAt: session.last_qr_at,
  });
};

export const getWhatsAppStatus = async (req, res) => {
  const session = await getOrCreateWhatsAppSession(getUserId(req));
  res.json(serializeWhatsAppSession(session));
};

export const disconnectWhatsApp = async (req, res) => {
  const session = await disconnectWhatsAppSession(getUserId(req));
  res.json(serializeWhatsAppSession(session));
};

export const testWhatsApp = async (req, res) => {
  const userId = getUserId(req);
  const session = await getOrCreateWhatsAppSession(userId);
  const recipient = req.body.to || session.phone;
  const message = req.body.message || "Teste de envio pelo WhatsApp do CoéPay.";

  try {
    await sendWhatsAppMessage({ userId, phone: recipient, message });
    await createMessageLog({
      userId,
      channel: "whatsapp",
      recipient,
      message,
      status: "sent",
    });
    res.json({ message: "Mensagem de teste enviada com sucesso." });
  } catch (error) {
    await createMessageLog({
      userId,
      channel: "whatsapp",
      recipient: recipient || "",
      message,
      status: "failed",
      errorMessage: error.message,
    });
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const listTemplates = async (req, res) => {
  const savedTemplates = await listTemplatesForUser(getUserId(req));
  res.json({
    defaults: defaultMessageTemplates,
    templates: savedTemplates,
  });
};

export const createTemplate = async (req, res) => {
  const userId = getUserId(req);
  const { channel, name, event_type, subject, body, enabled = true } = req.body;

  if (!["email", "whatsapp"].includes(channel)) {
    return res.status(400).json({ message: "Canal inválido." });
  }

  if (!name || !event_type || !body) {
    return res.status(400).json({ message: "Nome, evento e corpo são obrigatórios." });
  }

  const template = await MessageTemplate.create({
    user_id: userId,
    channel,
    name,
    event_type,
    subject: subject || null,
    body,
    enabled: Boolean(enabled),
  });

  res.json(template);
};

export const updateTemplate = async (req, res) => {
  const userId = getUserId(req);
  const template = await MessageTemplate.findOne({
    where: {
      id: req.params.id,
      user_id: userId,
    },
  });

  if (!template) {
    return res.status(404).json({ message: "Template não encontrado." });
  }

  await template.update({
    channel: req.body.channel || template.channel,
    name: req.body.name || template.name,
    event_type: req.body.event_type || template.event_type,
    subject: req.body.subject ?? template.subject,
    body: req.body.body || template.body,
    enabled: req.body.enabled === undefined ? template.enabled : Boolean(req.body.enabled),
  });

  res.json(template);
};

export const deleteTemplate = async (req, res) => {
  const deleted = await MessageTemplate.destroy({
    where: {
      id: req.params.id,
      user_id: getUserId(req),
    },
  });

  if (!deleted) {
    return res.status(404).json({ message: "Template não encontrado." });
  }

  res.json({ message: "Template removido." });
};

export const listReminderRules = async (req, res) => {
  const userId = getUserId(req);
  const rules = await EmailReminderRule.findAll({
    where: { user_id: userId },
    order: [["id", "ASC"]],
  });

  if (!rules.length) {
    return res.json(defaultReminderRules.map((rule) => ({ ...rule, id: null, default: true })));
  }

  res.json(rules);
};

export const replaceReminderRules = async (req, res) => {
  const userId = getUserId(req);
  const rules = Array.isArray(req.body.rules) ? req.body.rules : [];

  const normalizedRules = rules
    .filter((rule) => rule?.name && rule?.trigger_type)
    .map((rule) => normalizeReminderRule(rule, userId));

  await EmailReminderRule.destroy({ where: { user_id: userId } });
  const savedRules = normalizedRules.length
    ? await EmailReminderRule.bulkCreate(normalizedRules, { returning: true })
    : [];

  res.json(savedRules);
};

export const listMessageLogs = async (req, res) => {
  const logs = await MessageLog.findAll({
    where: { user_id: getUserId(req) },
    order: [["created_at", "DESC"]],
    limit: 100,
  });

  res.json(logs);
};
