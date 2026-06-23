import { calcularJuros } from "../utils/juros.js";
import { EmailTemplate, MessageTemplate, UserProfile } from "../models/initModels.js";
import { sendTransactionalEmail } from "./email.service.js";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
});

const defaultTemplates = {
  manual: {
    label: "Cobrança manual",
    subject: "Cobrança {{nome_empresa}} - {{valor}}",
    body:
      "Olá, {{nome_cliente}}.\n\n{{nome_empresa}} enviou uma cobrança no valor de {{valor}}, com vencimento em {{data_vencimento}}.\n\nDescrição: {{descricao}}\n\nAcesse o link para pagar com PIX: {{link_pagamento}}\n\nCódigo PIX copia e cola:\n{{codigo_pix}}\n\n{{qr_code_pix}}",
  },
  before_due: {
    label: "Antes do vencimento",
    subject: "Lembrete: cobrança vence em {{data_vencimento}}",
    body:
      "Olá, {{nome_cliente}}.\n\nPassando para lembrar que sua cobrança de {{valor}} vence em {{data_vencimento}}.\n\nVocê pode pagar pelo link: {{link_pagamento}}",
  },
  due_today: {
    label: "No dia do vencimento",
    subject: "Sua cobrança vence hoje - {{valor}}",
    body:
      "Olá, {{nome_cliente}}.\n\nSua cobrança no valor de {{valor}} vence hoje.\n\nPague pelo link: {{link_pagamento}}\n\nCódigo PIX:\n{{codigo_pix}}",
  },
  after_due: {
    label: "Após vencimento",
    subject: "Cobrança vencida - {{valor}}",
    body:
      "Olá, {{nome_cliente}}.\n\nIdentificamos uma cobrança vencida no valor atualizado de {{valor}}.\n\nRegularize pelo link: {{link_pagamento}}",
  },
  repeat_after_due: {
    label: "Repetição após vencimento",
    subject: "Lembrete de cobrança pendente - {{valor}}",
    body:
      "Olá, {{nome_cliente}}.\n\nEsta é uma lembrança automática sobre sua cobrança pendente de {{valor}}.\n\nLink de pagamento: {{link_pagamento}}",
  },
  payment_confirmed: {
    label: "Confirmação de pagamento",
    subject: "Pagamento confirmado - {{nome_empresa}}",
    body:
      "Olá, {{nome_cliente}}.\n\nRecebemos a confirmação do pagamento da cobrança de {{valor}}. Obrigado!",
  },
};

export const getDefaultEmailTemplates = () =>
  Object.entries(defaultTemplates).map(([template_type, template]) => ({
    template_type,
    ...template,
  }));

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizePixText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .slice(0, 25)
    .toUpperCase() || "COEPAY";

const emv = (id, value) => {
  const safeValue = String(value || "");
  return `${id}${safeValue.length.toString().padStart(2, "0")}${safeValue}`;
};

const crc16 = (str) => {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i += 1) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

export const buildPixPayload = ({ pixKey, amount, merchantName }) => {
  if (!pixKey) return "";

  const merchantAccountInfo = emv("00", "BR.GOV.BCB.PIX") + emv("01", pixKey);
  const payloadWithoutCrc =
    emv("00", "01") +
    emv("26", merchantAccountInfo) +
    emv("52", "0000") +
    emv("53", "986") +
    emv("54", Number(amount || 0).toFixed(2)) +
    emv("58", "BR") +
    emv("59", normalizePixText(merchantName)) +
    emv("60", "SAO PAULO") +
    emv("62", emv("05", "***")) +
    "6304";

  return payloadWithoutCrc + crc16(payloadWithoutCrc);
};

const buildQrCodeDataUrl = async (payload) => {
  if (!payload) return "";

  try {
    const QRCode = await import("qrcode");
    return QRCode.default.toDataURL(payload, { margin: 1, width: 220 });
  } catch {
    return "";
  }
};

export const isValidEmailAddress = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

export const getCurrentChargeValue = (charge) => {
  if (!charge.taxa_juros || !charge.tipo_juros || charge.status === "paga") {
    return Number(charge.valor);
  }

  const calculationMethod = charge.metodo_calculo || "composto";

  return Number(
    calcularJuros(
      charge.valor,
      charge.taxa_juros,
      charge.tipo_juros,
      calculationMethod,
      charge.data_vencimento
    ).toFixed(2)
  );
};

export const buildPublicChargeUrl = (charge, requestOrigin) => {
  const baseUrl = process.env.FRONTEND_PUBLIC_URL || requestOrigin || "http://localhost:8080";
  const chargePath = charge.link || `/cobranca/${charge.hash}`;

  if (/^https?:\/\//i.test(chargePath)) {
    return chargePath;
  }

  return new URL(chargePath, baseUrl).toString();
};

const getChargeStatusLabel = (charge) => {
  if (charge.pago || charge.status === "paga") return "Paga";

  const dueDate = new Date(charge.data_vencimento);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return today > dueDate ? "Vencida" : "Pendente";
};

const findTemplate = async ({ userId, templateType }) => {
  const communicationTemplate = await MessageTemplate.findOne({
    where: {
      user_id: userId,
      channel: "email",
      event_type: templateType,
      enabled: true,
    },
    order: [["id", "DESC"]],
  });

  if (communicationTemplate) {
    return {
      subject: communicationTemplate.subject || defaultTemplates[templateType]?.subject,
      body: communicationTemplate.body,
    };
  }

  const savedTemplate = await EmailTemplate.findOne({
    where: {
      user_id: userId,
      template_type: templateType,
      active: true,
    },
  });

  return savedTemplate || defaultTemplates[templateType] || defaultTemplates.manual;
};

const renderSubject = (subject, variables) =>
  subject.replace(/\{\{\s*([\w_]+)\s*\}\}/g, (_match, key) => variables[key] || "");

const renderBodyHtml = (body, variables, htmlVariables) => {
  const regex = /\{\{\s*([\w_]+)\s*\}\}/g;
  let rendered = "";
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(body)) !== null) {
    rendered += escapeHtml(body.slice(lastIndex, match.index));
    const key = match[1];
    rendered += htmlVariables[key] !== undefined ? htmlVariables[key] : escapeHtml(variables[key] || "");
    lastIndex = regex.lastIndex;
  }

  rendered += escapeHtml(body.slice(lastIndex));

  return rendered
    .split(/\n{2,}/)
    .map((paragraph) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
};

const buildVariables = async ({ charge, creditor, profile, publicChargeUrl, currentValue, pixKey }) => {
  const formattedValue = currencyFormatter.format(currentValue);
  const dueDate = dateFormatter.format(new Date(charge.data_vencimento));
  const status = getChargeStatusLabel(charge);
  const description = charge.descricao || "Cobrança registrada no CoéPay";
  const pixPayload = buildPixPayload({
    pixKey,
    amount: currentValue,
    merchantName: creditor?.name || "CoéPay",
  });
  const qrCodePix = await buildQrCodeDataUrl(pixPayload);

  return {
    variables: {
      nome_cliente: charge.nome,
      valor: formattedValue,
      data_vencimento: dueDate,
      status,
      link_pagamento: publicChargeUrl,
      descricao: description,
      nome_empresa: profile?.name || creditor?.name || "CoéPay",
      email_empresa: profile?.email || creditor?.email || "",
      telefone_empresa: profile?.phone || profile?.whatsapp_phone || "",
      pix: pixKey || "",
      codigo_pix: pixPayload || pixKey || "",
      qr_code_pix: qrCodePix ? "QR Code PIX anexo no e-mail" : "",
    },
    htmlVariables: {
      link_pagamento: `<a href="${escapeHtml(publicChargeUrl)}" style="color:#b91c1c;font-weight:700;">${escapeHtml(publicChargeUrl)}</a>`,
      codigo_pix: pixPayload
        ? `<code style="display:block;white-space:pre-wrap;word-break:break-all;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;padding:10px;font-size:12px;">${escapeHtml(pixPayload)}</code>`
        : escapeHtml(pixKey || ""),
      qr_code_pix: qrCodePix
        ? `<img src="${qrCodePix}" alt="QR Code PIX" width="220" height="220" style="display:block;margin:12px auto;border:1px solid #e5e7eb;border-radius:8px;" />`
        : "",
    },
    pixPayload,
    qrCodePix,
  };
};

const wrapEmailHtml = ({ title, bodyHtml, publicChargeUrl }) => `
  <!doctype html>
  <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:24px;background:#991b1b;color:#ffffff;">
                  <p style="margin:0;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#fee2e2;">CoéPay</p>
                  <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;">
                  ${bodyHtml}
                  <div style="margin-top:24px;">
                    <a href="${escapeHtml(publicChargeUrl)}" style="display:inline-block;background:#b91c1c;color:#ffffff;text-decoration:none;font-weight:700;border-radius:6px;padding:12px 18px;">Abrir cobrança</a>
                  </div>
                  <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6b7280;">Mensagem enviada pelo CoéPay. Se o botão não funcionar, copie o link de pagamento exibido acima.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

export const sendChargeEmailNotification = async ({
  charge,
  requestOrigin,
  templateType = "manual",
}) => {
  if (!isValidEmailAddress(charge.email)) {
    const error = new Error("Esta cobrança não possui um e-mail de devedor válido.");
    error.statusCode = 400;
    throw error;
  }

  const creditor = charge.User;
  const profile = await UserProfile.findOne({ where: { user_id: charge.user_id } });
  const pixKey = charge.pix_cobranca || creditor?.pix || "";
  const currentValue = getCurrentChargeValue(charge);
  const publicChargeUrl = buildPublicChargeUrl(charge, requestOrigin);
  const template = await findTemplate({
    userId: charge.user_id,
    templateType,
  });
  const { variables, htmlVariables, pixPayload } = await buildVariables({
    charge,
    creditor,
    profile,
    publicChargeUrl,
    currentValue,
    pixKey,
  });
  const subject = renderSubject(template.subject, variables);
  const bodyHtml = renderBodyHtml(template.body, variables, htmlVariables);
  const html = wrapEmailHtml({
    title: defaultTemplates[templateType]?.label || "Cobrança CoéPay",
    bodyHtml,
    publicChargeUrl,
  });
  const text = renderSubject(template.body, variables);

  const providerResponse = await sendTransactionalEmail({
    userId: charge.user_id,
    to: charge.email.trim(),
    subject,
    html,
    text,
  });

  return {
    sentTo: charge.email,
    chargeId: charge.id,
    currentValue,
    publicChargeUrl,
    pixPayload,
    templateType,
    providerMessageId: providerResponse?.messageId,
  };
};
