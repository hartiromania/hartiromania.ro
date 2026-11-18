// Server-side checks for the contact form: Cloudflare Turnstile, the email domain,
// rate limits and the stored copy of every message (for the admin panel).
// Every check degrades gracefully: a missing key or a slow network never blocks a real person.
import "server-only";

import { resolve4, resolveMx } from "node:dns/promises";
import { Redis } from "@upstash/redis";

import { db, schema } from "@/lib/db";

import type { BotSignals } from "./spam-score";

const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 600;

// The most common throwaway-inbox services. Not exhaustive on purpose: the content
// analysis catches the rest.
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "temp-mail.org",
  "tempmail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "throwawaymail.com",
  "fakeinbox.com",
  "mohmal.com",
  "emailondeck.com",
]);

function redis(): Redis | null {
  const configured = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  return configured ? Redis.fromEnv() : null;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

export async function verifyTurnstile(
  token: string | undefined,
  ip: string | undefined,
): Promise<BotSignals["turnstile"]> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return "skipped";
  if (!token) return "missing";
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success ? "passed" : "failed";
  } catch {
    // Cloudflare unreachable: do not punish the visitor for it.
    return "skipped";
  }
}

export async function checkEmailDomain(email: string): Promise<BotSignals["emailDomain"]> {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return "invalid";
  if (DISPOSABLE_DOMAINS.has(domain)) return "disposable";
  try {
    const mx = await withTimeout(resolveMx(domain), 3000).catch(
      async (error: NodeJS.ErrnoException) => {
        // A domain without MX records may still receive mail on its A record (RFC 5321).
        if (error.code === "ENODATA")
          return (await withTimeout(resolve4(domain), 3000)).length ? [1] : [];
        throw error;
      },
    );
    return mx.length > 0 ? "ok" : "invalid";
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code === "ENOTFOUND" || code === "ENODATA" ? "invalid" : "unknown";
  }
}

/** True when this IP has already sent RATE_LIMIT messages in the current window. */
export async function isRateLimited(ip: string | undefined): Promise<boolean> {
  return ip ? overLimit(`contact:rate:${ip}`, RATE_LIMIT, RATE_WINDOW_SECONDS) : false;
}

/** Counts one hit for `key`; true once it exceeds `limit` within `windowSeconds`. */
export async function overLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const kv = redis();
  if (!kv) return false;
  try {
    const count = await kv.incr(key);
    if (count === 1) await kv.expire(key, windowSeconds);
    return count > limit;
  } catch {
    return false;
  }
}

export interface StoredMessage {
  receivedAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  verdict: "ok" | "suspect";
  score: number;
  reasons: string[];
  location: string;
  ip: string;
  device: string;
  emailed: boolean;
}

/** Keeps every message (spam included) for the admin panel. Never blocks the reply. */
export async function storeMessage(record: StoredMessage): Promise<void> {
  try {
    await db()
      .insert(schema.contactMessages)
      .values({
        ...record,
        receivedAt: new Date(record.receivedAt),
        ip: record.ip === "necunoscut" ? null : record.ip,
      });
  } catch (error) {
    console.error("[contact] could not store message", error);
  }
}
