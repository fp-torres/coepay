import { calcularJuros } from "../utils/juros.js";
import { sendTransactionalEmail } from "./email.service.js";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
});

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

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

const buildChargeEmailTemplate = ({ charge, creditor, publicChargeUrl, currentValue, pixKey }) => {
  const debtorName = escapeHtml(charge.nome);
  const creditorName = escapeHtml(creditor?.name || "CoéPay");
  const description = charge.descricao ? escapeHtml(charge.descricao) : "Cobrança registrada no CoéPay";
  const formattedValue = currencyFormatter.format(currentValue);
  const dueDate = dateFormatter.format(new Date(charge.data_vencimento));
  const safePixKey = pixKey ? escapeHtml(pixKey) : "Chave PIX disponível na página da cobrança";

  const html = `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Cobrança CoéPay</title>
      </head>
      <body style="margin:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f9;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:24px;background:#111827;color:#ffffff;">
                    <p style="margin:0;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#d1d5db;">CoéPay</p>
                    <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;">Você recebeu uma cobrança</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Olá, ${debtorName}.</p>
                    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">${creditorName} enviou uma cobrança para você. Confira os detalhes abaixo e acesse o link para realizar o pagamento por PIX.</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 20px;">
                      <tr>
                        <td style="padding:12px;border:1px solid #e5e7eb;background:#f9fafb;font-size:14px;color:#6b7280;">Valor atualizado</td>
                        <td style="padding:12px;border:1px solid #e5e7eb;font-size:16px;font-weight:700;color:#dc2626;">${formattedValue}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px;border:1px solid #e5e7eb;background:#f9fafb;font-size:14px;color:#6b7280;">Vencimento</td>
                        <td style="padding:12px;border:1px solid #e5e7eb;font-size:15px;">${dueDate}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px;border:1px solid #e5e7eb;background:#f9fafb;font-size:14px;color:#6b7280;">Descrição</td>
                        <td style="padding:12px;border:1px solid #e5e7eb;font-size:15px;">${description}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px;border:1px solid #e5e7eb;background:#f9fafb;font-size:14px;color:#6b7280;">PIX</td>
                        <td style="padding:12px;border:1px solid #e5e7eb;font-size:15px;">${safePixKey}</td>
                      </tr>
                    </table>

                    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">A página pública da cobrança contém o QR Code, a chave PIX e a opção de envio do comprovante.</p>

                    <a href="${publicChargeUrl}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;border-radius:6px;padding:12px 18px;">Abrir cobrança</a>

                    <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6b7280;">Se o botão não funcionar, copie e cole este link no navegador: ${publicChargeUrl}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = [
    `Olá, ${charge.nome}.`,
    `${creditor?.name || "CoéPay"} enviou uma cobrança para você.`,
    `Valor atualizado: ${formattedValue}`,
    `Vencimento: ${dueDate}`,
    `PIX: ${pixKey || "disponível na página da cobrança"}`,
    `Link da cobrança: ${publicChargeUrl}`,
  ].join("\n");

  return { html, text };
};

export const sendChargeEmailNotification = async ({ charge, requestOrigin }) => {
  const creditor = charge.User;
  const pixKey = charge.pix_cobranca || creditor?.pix || "";
  const currentValue = getCurrentChargeValue(charge);
  const publicChargeUrl = buildPublicChargeUrl(charge, requestOrigin);
  const { html, text } = buildChargeEmailTemplate({
    charge,
    creditor,
    publicChargeUrl,
    currentValue,
    pixKey,
  });

  const providerResponse = await sendTransactionalEmail({
    to: charge.email,
    subject: `Cobrança CoéPay - ${currencyFormatter.format(currentValue)}`,
    html,
    text,
  });

  return {
    sentTo: charge.email,
    chargeId: charge.id,
    currentValue,
    publicChargeUrl,
    providerMessageId: providerResponse?.messageId,
  };
};
