import "server-only";
import { hash, compare } from "bcryptjs";

// bcrypt cost 12 (§ "bcrypt cost ≥12"). Pure-JS bcryptjs = no native build,
// works on any serverless runtime. bcrypt truncates at 72 bytes — the register
// schema caps password length accordingly.
const BCRYPT_COST = 12;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, BCRYPT_COST);
}

export function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return compare(plain, hashed);
}
