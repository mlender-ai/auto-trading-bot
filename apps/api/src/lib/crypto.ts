import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function createKey(secret: string) {
  return createHash("sha256").update(secret).digest();
}

export function encryptText(value: string, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", createKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptText(payload: string, secret: string) {
  const [ivHex, authTagHex, cipherHex] = payload.split(":");

  if (!ivHex || !authTagHex || !cipherHex) {
    throw new Error("Invalid encrypted payload format.");
  }

  const decipher = createDecipheriv("aes-256-gcm", createKey(secret), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(cipherHex, "hex")), decipher.final()]);

  return decrypted.toString("utf8");
}
