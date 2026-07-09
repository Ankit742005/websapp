import "server-only";
import { randomBytes, createHash } from "node:crypto";

/**
 * One-time tokens for email verification and password reset. We email the raw
 * token but persist only its SHA-256 hash, so a leaked database row can't be
 * used to hijack the flow (§ "hashed at rest, invalidated on first use").
 */
export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h
export const PASSWORD_RESET_TTL_MS = 20 * 60 * 1000; // 20 min

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}
