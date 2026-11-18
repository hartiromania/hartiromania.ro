// Secrets for admin sign-in. Pure functions (node:crypto only), so they are unit-tested.
//
// - Tokens (sign-in links, session cookies) are 32 random bytes: too long to guess, so a
//   plain SHA-256 is enough to store them.
// - Codes are 6 digits: few combinations, so they are stored as an HMAC with a server
//   secret; a copy of the database alone is not enough to try them all.
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function newCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function hashCode(code: string, secret: string): string {
  return createHmac("sha256", secret).update(code).digest("hex");
}

/** Constant-time comparison of two hex hashes. */
export function sameHash(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
