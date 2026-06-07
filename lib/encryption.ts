import crypto from "crypto";

function key() {
  const raw = process.env.ENCRYPTION_KEY || "dev-only-32-character-key-000000";
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(payload?: string | null) {
  if (!payload) return "";
  const [ivRaw, tagRaw, encryptedRaw] = payload.split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedRaw, "base64")), decipher.final()]).toString("utf8");
}

