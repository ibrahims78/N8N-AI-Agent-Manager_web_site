import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (key) {
    if (key.length === 64) {
      return Buffer.from(key, "hex");
    }
    if (key.length >= 32) {
      return Buffer.from(key.slice(0, 32), "utf8");
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ENCRYPTION_KEY environment variable must be set in production (64 hex chars = 32 bytes)");
  }

  const devKey = "dev-encryption-key-change-in-prod!";
  return Buffer.from(devKey.slice(0, 32), "utf8");
}

export function encryptApiKey(plaintext: string): { encryptedKey: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    encryptedKey: encrypted,
    iv: iv.toString("hex"),
  };
}

export function decryptApiKey(encryptedKey: string, iv: string): string {
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encryptedKey, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
