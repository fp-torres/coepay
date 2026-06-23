import crypto from "crypto";

const algorithm = "aes-256-gcm";

const getSecretKey = () => {
  const rawSecret =
    process.env.SETTINGS_ENCRYPTION_KEY ||
    process.env.GOOGLE_CLIENT_SECRET ||
    "coepay-local-development-secret";

  return crypto.createHash("sha256").update(rawSecret).digest();
};

export const encryptSecret = (plainText) => {
  if (!plainText) return null;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getSecretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
};

export const decryptSecret = (encryptedText) => {
  if (!encryptedText) return null;

  const [ivRaw, tagRaw, encryptedRaw] = String(encryptedText).split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) return null;

  const decipher = crypto.createDecipheriv(
    algorithm,
    getSecretKey(),
    Buffer.from(ivRaw, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};
