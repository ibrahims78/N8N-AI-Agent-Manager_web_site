import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set in production");
    }
    return "dev-access-secret-change-in-prod-32chars";
  }
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_REFRESH_SECRET must be set in production");
    }
    return "dev-refresh-secret-change-in-prod-32chars";
  }
  return `refresh_${secret}`;
}

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, getRefreshSecret()) as TokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const COMMON_PASSWORDS = [
  "123456", "password", "123456789", "12345678", "12345", "1234567",
  "1234567890", "qwerty", "abc123", "000000", "iloveyou", "admin",
  "welcome", "monkey", "dragon", "master", "letmein", "sunshine",
  "princess", "football", "pass@123", "admin@123",
];

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };
  }
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return { valid: false, message: "كلمة المرور شائعة جداً، اختر كلمة مرور أقوى" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل" };
  }
  return { valid: true };
}
