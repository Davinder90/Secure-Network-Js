import crypto from "crypto";
import { env_var } from "@/src/config/env.config";

// 32-byte secret key derived from environment
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(env_var.JWT_SECRET || "secnet-secret-encryption-salt-key-32b")
  .digest();

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV for GCM

/**
 * Encrypts a database ObjectId or string into a tamper-proof URL-safe string.
 */
export const encryptId = (rawId: string | object): string => {
  if (!rawId) return "";
  const plainText = typeof rawId === "object" ? rawId.toString() : String(rawId);

  // Generate a random IV for each encryption event
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Combined Payload: [IV (12B)] + [AuthTag (16B)] + [Encrypted Data]
  const combined = Buffer.concat([iv, authTag, encrypted]);

  // Output as URL-safe base64url string
  return combined.toString("base64url");
};

/**
 * Decrypts a URL-safe token back to the original database ID.
 * Returns null if the token is invalid or has been modified/tampered with.
 */
export const decryptId = (encryptedToken: string): string | null => {
  if (!encryptedToken || typeof encryptedToken !== "string") return null;

  try {
    const buffer = Buffer.from(encryptedToken.trim(), "base64url");

    // Must be at least IV (12) + AuthTag (16) + 1 byte data = 29 bytes
    if (buffer.length < IV_LENGTH + 16 + 1) {
      return null;
    }

    const iv = buffer.subarray(0, IV_LENGTH);
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
    const encryptedText = buffer.subarray(IV_LENGTH + 16);

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    // Return null if tampering or bad token detected
    return null;
  }
};
