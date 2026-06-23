import nodemailer from "nodemailer";
import { UserProfile } from "../models/initModels.js";

export const isValidEmailAddress = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

const parseFromAddress = (value = "") => {
  const match = String(value).match(/^(.*?)\s*<([^>]+)>$/);
  if (!match) return { name: "CoéPay", email: value };

  return {
    name: match[1].replace(/^"|"$/g, "").trim() || "CoéPay",
    email: match[2].trim(),
  };
};

export const getSystemEmailConfig = () => {
  const from = parseFromAddress(process.env.SMTP_FROM || process.env.SMTP_USER || "");

  return {
    smtp_host: process.env.SMTP_HOST || "",
    smtp_port: Number(process.env.SMTP_PORT || 587),
    smtp_secure: process.env.SMTP_SECURE === "true",
    smtp_user: process.env.SMTP_USER || "",
    smtp_from_name: from.name,
    smtp_from_email: from.email,
    configured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  };
};

export const serializeEmailSetting = async (userId) => {
  const profile = userId ? await UserProfile.findOne({ where: { user_id: userId } }) : null;
  const system = getSystemEmailConfig();

  return {
    company_name: profile?.name || "",
    contact_email: profile?.email || "",
    contact_phone: profile?.phone || profile?.whatsapp_phone || "",
    email_enabled: profile?.email_enabled ?? true,
    whatsapp_enabled: profile?.whatsapp_enabled ?? false,
    system_sender_name: system.smtp_from_name,
    system_sender_email: system.smtp_from_email,
    system_configured: system.configured,
  };
};

const getSystemTransporterOrThrow = () => {
  const config = getSystemEmailConfig();
  const missing = [];

  if (!config.smtp_host) missing.push("SMTP_HOST");
  if (!config.smtp_user) missing.push("SMTP_USER");
  if (!process.env.SMTP_PASS) missing.push("SMTP_PASS");
  if (!config.smtp_from_email) missing.push("SMTP_FROM");

  if (missing.length) {
    const error = new Error("Servidor de envio de e-mail não configurado.");
    error.statusCode = 500;
    error.debugMessage = `Configuração SMTP central incompleta: ${missing.join(", ")}`;
    throw error;
  }

  if (!isValidEmailAddress(config.smtp_from_email)) {
    const error = new Error("Servidor de envio de e-mail não configurado corretamente.");
    error.statusCode = 500;
    error.debugMessage = "SMTP_FROM inválido.";
    throw error;
  }

  return nodemailer.createTransport({
    host: config.smtp_host,
    port: config.smtp_port,
    secure: config.smtp_secure,
    auth: {
      user: config.smtp_user,
      pass: process.env.SMTP_PASS,
    },
  });
};

const buildFromAddress = () => {
  const config = getSystemEmailConfig();
  return `${config.smtp_from_name || "CoéPay"} <${config.smtp_from_email}>`;
};

const getReplyToForUser = async (userId, explicitReplyTo = null) => {
  if (explicitReplyTo && isValidEmailAddress(explicitReplyTo)) return explicitReplyTo;

  const profile = await UserProfile.findOne({ where: { user_id: userId } });
  if (profile?.email && isValidEmailAddress(profile.email)) return profile.email;

  return undefined;
};

export const sendTransactionalEmailForUser = async ({
  userId,
  to,
  subject,
  html,
  text,
  replyTo,
}) => {
  if (!isValidEmailAddress(to)) {
    const error = new Error("Destinatário de e-mail inválido.");
    error.statusCode = 400;
    throw error;
  }

  const profile = await UserProfile.findOne({ where: { user_id: userId } });

  if (profile && profile.email_enabled === false) {
    const error = new Error("Envio por e-mail está desativado para esta empresa.");
    error.statusCode = 400;
    throw error;
  }

  const transporter = getSystemTransporterOrThrow();
  const resolvedReplyTo = await getReplyToForUser(userId, replyTo);

  try {
    return await transporter.sendMail({
      from: buildFromAddress(),
      replyTo: resolvedReplyTo,
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Erro técnico no envio SMTP central:", error);
    const friendlyError = new Error(
      "Não foi possível enviar o e-mail. Verifique as configurações do servidor de envio."
    );
    friendlyError.statusCode = 500;
    friendlyError.debugMessage = error.message;
    throw friendlyError;
  }
};

export const verifyEmailSetting = async (userId) => {
  const transporter = getSystemTransporterOrThrow();
  try {
    await transporter.verify();
  } catch (error) {
    console.error("Erro técnico ao verificar SMTP central:", error);
    const friendlyError = new Error(
      "Não foi possível validar o servidor de envio de e-mail."
    );
    friendlyError.statusCode = 500;
    friendlyError.debugMessage = error.message;
    throw friendlyError;
  }
  return serializeEmailSetting(userId);
};

export const sendTransactionalEmail = async (payload) => {
  if (!payload.userId) {
    const error = new Error("userId é obrigatório para envio de e-mail.");
    error.statusCode = 400;
    throw error;
  }

  return sendTransactionalEmailForUser(payload);
};
