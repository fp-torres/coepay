import { MessageTemplate } from "../models/initModels.js";

export const defaultMessageTemplates = [
  {
    channel: "email",
    name: "E-mail de cobrança manual",
    event_type: "manual",
    subject: "Cobrança {{nome_empresa}} - {{valor}}",
    body:
      "Olá, {{nome_cliente}}.\n\n{{nome_empresa}} enviou uma cobrança no valor de {{valor}}, com vencimento em {{data_vencimento}}.\n\nDescrição: {{descricao}}\n\nLink de pagamento: {{link_pagamento}}\n\nCódigo PIX:\n{{codigo_pix}}",
  },
  {
    channel: "email",
    name: "E-mail antes do vencimento",
    event_type: "before_due",
    subject: "Lembrete: cobrança vence em {{data_vencimento}}",
    body:
      "Olá, {{nome_cliente}}.\n\nPassando para lembrar que sua cobrança de {{valor}} vence em {{data_vencimento}}.\n\nPague pelo link: {{link_pagamento}}",
  },
  {
    channel: "email",
    name: "E-mail no vencimento",
    event_type: "due_today",
    subject: "Sua cobrança vence hoje - {{valor}}",
    body:
      "Olá, {{nome_cliente}}.\n\nSua cobrança no valor de {{valor}} vence hoje.\n\nPague pelo link: {{link_pagamento}}\n\nCódigo PIX:\n{{codigo_pix}}",
  },
  {
    channel: "email",
    name: "E-mail de cobrança vencida",
    event_type: "after_due",
    subject: "Cobrança vencida - {{valor}}",
    body:
      "Olá, {{nome_cliente}}.\n\nIdentificamos uma cobrança vencida no valor atualizado de {{valor}}.\n\nRegularize pelo link: {{link_pagamento}}",
  },
  {
    channel: "email",
    name: "E-mail de repetição após vencimento",
    event_type: "repeat_after_due",
    subject: "Lembrete de cobrança pendente - {{valor}}",
    body:
      "Olá, {{nome_cliente}}.\n\nEsta é uma lembrança automática sobre sua cobrança pendente de {{valor}}.\n\nLink de pagamento: {{link_pagamento}}",
  },
  {
    channel: "email",
    name: "E-mail de pagamento confirmado",
    event_type: "payment_confirmed",
    subject: "Pagamento confirmado - {{nome_empresa}}",
    body:
      "Olá, {{nome_cliente}}.\n\nRecebemos a confirmação do pagamento da cobrança de {{valor}}. Obrigado!",
  },
  {
    channel: "whatsapp",
    name: "WhatsApp de cobrança manual",
    event_type: "manual",
    subject: null,
    body:
      "*{{nome_empresa}}*\n\nOlá, {{nome_cliente}}.\nSua cobrança de {{valor}} vence em {{data_vencimento}}.\n\nDescrição: {{descricao}}\n\nPague pelo link:\n{{link_pagamento}}\n\nPIX: {{codigo_pix}}",
  },
  {
    channel: "whatsapp",
    name: "WhatsApp antes do vencimento",
    event_type: "before_due",
    subject: null,
    body:
      "Olá, {{nome_cliente}}. Lembrete da {{nome_empresa}}: sua cobrança de {{valor}} vence em {{data_vencimento}}.\n\nLink: {{link_pagamento}}",
  },
  {
    channel: "whatsapp",
    name: "WhatsApp no vencimento",
    event_type: "due_today",
    subject: null,
    body:
      "Olá, {{nome_cliente}}. Sua cobrança de {{valor}} vence hoje.\n\nPague pelo link: {{link_pagamento}}\n\nPIX: {{codigo_pix}}",
  },
  {
    channel: "whatsapp",
    name: "WhatsApp de cobrança vencida",
    event_type: "after_due",
    subject: null,
    body:
      "Olá, {{nome_cliente}}. Sua cobrança de {{valor}} está vencida.\n\nRegularize pelo link: {{link_pagamento}}",
  },
  {
    channel: "whatsapp",
    name: "WhatsApp de repetição após vencimento",
    event_type: "repeat_after_due",
    subject: null,
    body:
      "Olá, {{nome_cliente}}. Este é um lembrete sobre sua cobrança pendente de {{valor}}.\n\nLink: {{link_pagamento}}",
  },
  {
    channel: "whatsapp",
    name: "WhatsApp de pagamento confirmado",
    event_type: "payment_confirmed",
    subject: null,
    body:
      "Olá, {{nome_cliente}}. Pagamento confirmado no valor de {{valor}}. Obrigado!\n\n{{nome_empresa}}",
  },
  {
    channel: "whatsapp",
    name: "Novo pedido",
    event_type: "new_order",
    subject: null,
    body:
      "*NOVO PEDIDO - {{businessName}}*\n──────────────────────────\n\n👤 *Cliente:* {{customerName}}\n📍 *Endereço:* {{customerAddress}}\n\n🛒 *Itens do pedido*\n\n{{orderItems}}\n──────────────────────────\n💰 *Total do Pedido:* {{total}}\n\n💳 *Pagamento:* {{paymentMethod}}\n{{changeFor}}\n\n📝 *Observações:* {{obs}}",
  },
];

export const renderTemplate = (template, variables = {}) =>
  String(template || "").replace(/\{\{\s*([\w_]+)\s*\}\}/g, (_match, key) => {
    const value = variables[key];
    return value === undefined || value === null ? "" : String(value);
  });

export const listTemplatesForUser = async (userId) => {
  const savedTemplates = await MessageTemplate.findAll({
    where: { user_id: userId },
    order: [
      ["channel", "ASC"],
      ["event_type", "ASC"],
      ["name", "ASC"],
    ],
  });

  return savedTemplates;
};

export const findTemplateForEvent = async ({ userId, channel, eventType }) => {
  const savedTemplate = await MessageTemplate.findOne({
    where: {
      user_id: userId,
      channel,
      event_type: eventType,
      enabled: true,
    },
    order: [["id", "DESC"]],
  });

  if (savedTemplate) return savedTemplate;

  return (
    defaultMessageTemplates.find(
      (template) => template.channel === channel && template.event_type === eventType
    ) ||
    defaultMessageTemplates.find(
      (template) => template.channel === channel && template.event_type === "manual"
    )
  );
};

export const formatOrderItems = (items = []) =>
  items
    .map((item) => {
      const quantity = Number(item.quantity || 1);
      const price = Number(item.price || 0);
      const subtotal = price * quantity;
      const lines = [`*${quantity}x* _${item.name || "Item"}_`];

      if (item.obs) lines.push(`📝 Obs do item: ${item.obs}`);
      if (item.complements?.length) lines.push(`• Complementos: ${item.complements.join(", ")}`);
      if (item.syrup) lines.push(`• Calda: ${item.syrup}`);
      if (item.drink) lines.push(`• Bebida: ${item.drink}`);

      lines.push(`> R$ ${price.toFixed(2)} un. | *Subtotal: R$ ${subtotal.toFixed(2)}*`);
      return lines.join("\n");
    })
    .join("\n\n");

export const assembleWhatsAppOrderMessage = (order, businessName = "CoéPay") => {
  const total =
    order.total !== undefined
      ? Number(order.total)
      : (order.items || []).reduce(
          (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1),
          0
        );

  const variables = {
    businessName,
    customerName: order.customerName || "Não informado",
    customerAddress: order.customerAddress || "Não informado",
    orderItems: formatOrderItems(order.items || []),
    total: `R$ ${total.toFixed(2)}`,
    paymentMethod: order.paymentMethod ? String(order.paymentMethod).toUpperCase() : "Não informado",
    changeFor:
      order.paymentMethod === "dinheiro" && order.changeFor
        ? `💵 *Troco para:* R$ ${order.changeFor}`
        : "",
    obs: order.obs || "Nenhuma",
  };

  const defaultOrderTemplate = defaultMessageTemplates.find(
    (template) => template.channel === "whatsapp" && template.event_type === "new_order"
  );

  return renderTemplate(defaultOrderTemplate.body, variables);
};
