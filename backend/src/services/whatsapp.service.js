import path from "path";
import { fileURLToPath } from "url";
import { WhatsAppSession } from "../models/initModels.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clients = new Map();

export const normalizePhone = (phone = "") => String(phone).replace(/\D/g, "");

export const validateInternationalPhone = (phone = "") => {
  const normalized = normalizePhone(phone);
  return normalized.length >= 10 && normalized.length <= 15;
};

const getSessionKey = (userId) => `user_${userId}`;

const loadWhatsAppLibrary = async () => {
  try {
    return await import("whatsapp-web.js");
  } catch (error) {
    const missingDependency = new Error(
      "whatsapp-web.js não está instalado no backend. Rode npm install em backend."
    );
    missingDependency.statusCode = 500;
    missingDependency.cause = error;
    throw missingDependency;
  }
};

const qrToDataUrl = async (qr) => {
  try {
    const QRCode = await import("qrcode");
    return QRCode.default.toDataURL(qr, { margin: 1, width: 260 });
  } catch {
    return qr;
  }
};

export const serializeWhatsAppSession = (session) => {
  if (!session) {
    return {
      phone: "",
      status: "DISCONNECTED",
      session_key: null,
      last_qr_code: null,
      last_qr_at: null,
      connected_at: null,
      disconnected_at: null,
    };
  }

  return {
    id: session.id,
    user_id: session.user_id,
    phone: session.phone || "",
    status: session.status,
    session_key: session.session_key,
    last_qr_code: session.last_qr_code,
    last_qr_at: session.last_qr_at,
    connected_at: session.connected_at,
    disconnected_at: session.disconnected_at,
    created_at: session.created_at,
    updated_at: session.updated_at,
  };
};

export const getOrCreateWhatsAppSession = async (userId, phone = "") => {
  const sessionKey = getSessionKey(userId);
  const [session] = await WhatsAppSession.findOrCreate({
    where: { user_id: userId },
    defaults: {
      user_id: userId,
      phone: phone ? normalizePhone(phone) : null,
      status: "DISCONNECTED",
      session_key: sessionKey,
    },
  });

  if (phone && normalizePhone(phone) !== session.phone) {
    await session.update({ phone: normalizePhone(phone) });
  }

  return session;
};

export const saveWhatsAppPhone = async ({ userId, phone }) => {
  const normalizedPhone = normalizePhone(phone);

  if (!validateInternationalPhone(normalizedPhone)) {
    const error = new Error("Informe o WhatsApp em formato internacional, ex: 5521999999999.");
    error.statusCode = 400;
    throw error;
  }

  const session = await getOrCreateWhatsAppSession(userId, normalizedPhone);
  await session.update({ phone: normalizedPhone });
  return session;
};

export const connectWhatsAppSession = async ({ userId, phone }) => {
  const session = await saveWhatsAppPhone({ userId, phone });
  const sessionKey = getSessionKey(userId);

  if (clients.has(userId)) {
    await session.update({ status: "QR_PENDING" });
    return session;
  }

  const { Client, LocalAuth } = await loadWhatsAppLibrary();
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: sessionKey,
      dataPath: path.resolve(__dirname, "../../.wwebjs_auth"),
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  clients.set(userId, client);

  client.on("qr", async (qr) => {
    const qrDataUrl = await qrToDataUrl(qr);
    await session.update({
      status: "QR_PENDING",
      last_qr_code: qrDataUrl,
      last_qr_at: new Date(),
    });
  });

  client.on("ready", async () => {
    await session.update({
      status: "CONNECTED",
      connected_at: new Date(),
      disconnected_at: null,
      last_qr_code: null,
    });
  });

  client.on("authenticated", async () => {
    await session.update({ status: "CONNECTED", connected_at: new Date() });
  });

  client.on("auth_failure", async (message) => {
    await session.update({
      status: "FAILED",
      disconnected_at: new Date(),
      last_qr_code: null,
    });
    console.error(`Falha de autenticação WhatsApp user ${userId}:`, message);
  });

  client.on("disconnected", async () => {
    clients.delete(userId);
    await session.update({
      status: "DISCONNECTED",
      disconnected_at: new Date(),
      last_qr_code: null,
    });
  });

  await session.update({ status: "QR_PENDING", session_key: sessionKey });
  client.initialize().catch(async (error) => {
    clients.delete(userId);
    await session.update({ status: "FAILED", disconnected_at: new Date() });
    console.error(`Erro ao iniciar WhatsApp user ${userId}:`, error);
  });

  return session;
};

export const disconnectWhatsAppSession = async (userId) => {
  const session = await getOrCreateWhatsAppSession(userId);
  const client = clients.get(userId);

  if (client) {
    try {
      await client.destroy();
    } catch (error) {
      console.error(`Erro ao destruir cliente WhatsApp user ${userId}:`, error);
    }
  }

  clients.delete(userId);
  await session.update({
    status: "DISCONNECTED",
    disconnected_at: new Date(),
    last_qr_code: null,
  });

  return session;
};

export const sendWhatsAppMessage = async ({ userId, phone, message }) => {
  const normalizedPhone = normalizePhone(phone);

  if (!validateInternationalPhone(normalizedPhone)) {
    const error = new Error("Destinatário WhatsApp inválido. Use formato internacional.");
    error.statusCode = 400;
    throw error;
  }

  const session = await getOrCreateWhatsAppSession(userId);

  if (session.status !== "CONNECTED") {
    const error = new Error("WhatsApp desconectado. Conecte a sessão pelo QR Code antes de enviar.");
    error.statusCode = 400;
    throw error;
  }

  const client = clients.get(userId);

  if (!client) {
    const error = new Error("Sessão WhatsApp não está ativa neste processo. Reconecte pelo QR Code.");
    error.statusCode = 400;
    throw error;
  }

  const result = await client.sendMessage(`${normalizedPhone}@c.us`, message);
  return result;
};
