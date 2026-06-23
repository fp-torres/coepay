import { Devedor, User, UserProfile } from "../models/initModels.js";
import {
  buildPublicChargeUrl,
  getCurrentChargeValue,
  sendChargeEmailNotification,
} from "../services/charge-email.service.js";
import { sendTransactionalEmailForUser } from "../services/email.service.js";
import { createMessageLog } from "../services/message-log.service.js";
import {
  findTemplateForEvent,
  renderTemplate,
} from "../services/template.service.js";
import { normalizePhone, sendWhatsAppMessage } from "../services/whatsapp.service.js";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
});

const getUserId = (req) => req.authUser.id;

const getChargeForUser = async (chargeId, userId) =>
  Devedor.findOne({
    where: {
      id: chargeId,
      user_id: userId,
    },
    include: [{ model: User, attributes: ["id", "name", "email", "pix"] }],
  });

const isWhatsAppSessionError = (error) =>
  error?.statusCode === 400 &&
  /WhatsApp desconectado|Sessão WhatsApp não está ativa|Conecte a sessão/i.test(error.message || "");

const buildWhatsAppWebLink = ({ phone, message }) =>
  `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message || "")}`;

const buildChargeVariables = async ({ charge, requestOrigin }) => {
  const currentValue = getCurrentChargeValue(charge);
  const publicUrl = buildPublicChargeUrl(charge, requestOrigin);
  const profile = await UserProfile.findOne({ where: { user_id: charge.user_id } });
  const companyName = profile?.name || charge.User?.name || "CoéPay";
  const companyEmail = profile?.email || charge.User?.email || "";
  const companyPhone = profile?.phone || profile?.whatsapp_phone || "";
  const dueDate = dateFormatter.format(new Date(charge.data_vencimento));
  const total = currencyFormatter.format(currentValue);
  const description = charge.descricao || "Nenhuma";

  return {
    nome_cliente: charge.nome || "Cliente",
    valor: total,
    data_vencimento: dueDate,
    status: charge.status,
    link_pagamento: publicUrl,
    descricao: description,
    nome_empresa: companyName,
    email_empresa: companyEmail,
    telefone_empresa: companyPhone,
    pix: charge.pix_cobranca || charge.User?.pix || "",
    codigo_pix: charge.pix_cobranca || charge.User?.pix || "",
    qr_code_pix: "",
    businessName: companyName,
    customerName: charge.nome || "Cliente",
    customerAddress: "Não informado",
    total,
    dueDate,
    paymentMethod: "PIX",
    changeFor: "",
    obs: description,
    paymentLink: publicUrl,
  };
};

export const sendEmailMessage = async (req, res) => {
  const userId = getUserId(req);
  const { to, subject, message } = req.body;

  try {
    const result = await sendTransactionalEmailForUser({
      userId,
      to,
      subject,
      html: `<p>${String(message || "").replace(/\n/g, "<br />")}</p>`,
      text: message,
    });

    await createMessageLog({
      userId,
      channel: "email",
      recipient: to,
      subject,
      message,
      status: "sent",
    });

    res.json({ message: "E-mail enviado com sucesso.", messageId: result.messageId });
  } catch (error) {
    await createMessageLog({
      userId,
      channel: "email",
      recipient: to || "",
      subject: subject || "",
      message: message || "",
      status: "failed",
      errorMessage: error.message,
    });

    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const sendWhatsAppDirectMessage = async (req, res) => {
  const userId = getUserId(req);
  const { to, message } = req.body;

  try {
    await sendWhatsAppMessage({ userId, phone: to, message });
    await createMessageLog({
      userId,
      channel: "whatsapp",
      recipient: normalizePhone(to),
      message,
      status: "sent",
    });

    res.json({ message: "WhatsApp enviado com sucesso." });
  } catch (error) {
    await createMessageLog({
      userId,
      channel: "whatsapp",
      recipient: normalizePhone(to || ""),
      message: message || "",
      status: "failed",
      errorMessage: error.message,
    });

    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const sendOrderEmail = async (req, res) => {
  const userId = getUserId(req);
  const charge = await getChargeForUser(req.params.id, userId);

  if (!charge) {
    return res.status(404).json({ message: "Cobrança não encontrada." });
  }

  try {
    const result = await sendChargeEmailNotification({
      charge,
      requestOrigin: req.get("origin"),
      templateType: "manual",
    });

    await createMessageLog({
      userId,
      channel: "email",
      recipient: charge.email,
      chargeId: charge.id,
      customerName: charge.nome,
      subject: "Cobrança CoéPay",
      message: `Cobrança enviada: ${result.publicChargeUrl}`,
      status: "sent",
    });

    res.json({ message: "Cobrança enviada por e-mail.", sentTo: charge.email });
  } catch (error) {
    await createMessageLog({
      userId,
      channel: "email",
      recipient: charge.email || "",
      chargeId: charge.id,
      customerName: charge.nome,
      subject: "Cobrança CoéPay",
      message: "Falha ao enviar cobrança por e-mail.",
      status: "failed",
      errorMessage: error.message,
    });

    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const sendOrderWhatsApp = async (req, res) => {
  const userId = getUserId(req);
  const charge = await getChargeForUser(req.params.id, userId);

  if (!charge) {
    return res.status(404).json({ message: "Cobrança não encontrada." });
  }

  const recipient = req.body?.to || charge.whatsapp_devedor || charge.telefone;

  if (!recipient) {
    return res.status(400).json({
      message: "Esta cobrança não possui telefone/WhatsApp. Informe um destino.",
    });
  }

  try {
    const template = await findTemplateForEvent({
      userId,
      channel: "whatsapp",
      eventType: "manual",
    });
    const variables = await buildChargeVariables({ charge, requestOrigin: req.get("origin") });
    const message = renderTemplate(template.body, variables);
    const normalizedRecipient = normalizePhone(recipient);

    try {
      await sendWhatsAppMessage({ userId, phone: recipient, message });
    } catch (error) {
      if (!isWhatsAppSessionError(error)) throw error;

      const whatsappUrl = buildWhatsAppWebLink({ phone: recipient, message });

      await createMessageLog({
        userId,
        channel: "whatsapp",
        recipient: normalizedRecipient,
        chargeId: charge.id,
        customerName: charge.nome,
        message,
        status: "link_generated",
      });

      return res.json({
        message: "WhatsApp desconectado. Abrimos um link do WhatsApp Web para envio manual.",
        sentTo: normalizedRecipient,
        whatsappUrl,
        fallback: true,
      });
    }

    await createMessageLog({
      userId,
      channel: "whatsapp",
      recipient: normalizedRecipient,
      chargeId: charge.id,
      customerName: charge.nome,
      message,
      status: "sent",
    });

    res.json({ message: "Cobrança enviada por WhatsApp.", sentTo: normalizedRecipient });
  } catch (error) {
    await createMessageLog({
      userId,
      channel: "whatsapp",
      recipient: normalizePhone(recipient || ""),
      chargeId: charge.id,
      customerName: charge.nome,
      message: "Falha ao enviar cobrança por WhatsApp.",
      status: "failed",
      errorMessage: error.message,
    });

    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
