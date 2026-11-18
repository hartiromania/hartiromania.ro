// Admin sign-in: one owner, no passwords.
//
// 1. The owner asks for access with the site's email address.
// 2. We email a one-time link and a 6-digit code (valid 10 minutes, usable once).
// 3. Either one opens a session: a random token in an httpOnly cookie that only the
//    admin host receives; the database keeps just its hash.
// Every step is rate-limited and written to the audit log.
import "server-only";

import { and, desc, eq, gt, isNull, ne, sql } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db, schema } from "@/lib/db";
import { deviceOf, visitorOf } from "@/lib/request-info";
import { hashCode, hashToken, newCode, newToken, sameHash } from "./tokens";
import { adminPath } from "./url";

export const ADMIN_EMAIL = "contact@hartiromania.ro";

const SESSION_COOKIE = "__Host-hr-admin";
const PENDING_COOKIE = "__Host-hr-admin-pending";
const SESSION_DAYS = 14;
const LOGIN_MINUTES = 10;
const MAX_CODE_ATTEMPTS = 5;

const cookieBase = { httpOnly: true, secure: true, sameSite: "strict", path: "/" } as const;

function codeSecret(): string {
  const secret = process.env.ADMIN_AUTH_SECRET || process.env.UNSUBSCRIBE_TOKEN_SECRET;
  if (!secret) throw new Error("ADMIN_AUTH_SECRET lipsește");
  // Domain separation: the same key is never used for anything else in this form.
  return `admin-login-code:${secret}`;
}

export async function requestInfo() {
  const h = await headers();
  const visitor = visitorOf(h);
  return {
    ip: visitor.ip ?? null,
    location: visitor.location,
    device: deviceOf(h.get("user-agent")),
  };
}

/** Writes one line to the security journal, with who/where/what device it came from. */
export async function audit(action: string, detail?: Record<string, unknown>) {
  const { ip, location, device } = await requestInfo();
  const session = await currentSession();
  await db()
    .insert(schema.adminAuditLog)
    .values({ action, detail, ip, location, device, sessionId: session?.id ?? null });
}

/** Creates a sign-in request; the caller emails the link and the code. */
export async function createLoginRequest() {
  const { ip } = await requestInfo();
  const token = newToken();
  const code = newCode();
  const [row] = await db()
    .insert(schema.adminLoginRequests)
    .values({
      tokenHash: hashToken(token),
      codeHash: hashCode(code, codeSecret()),
      expiresAt: new Date(Date.now() + LOGIN_MINUTES * 60_000),
      ip,
    })
    .returning({ id: schema.adminLoginRequests.id });
  // Remembers which request the code belongs to, in this browser only.
  (await cookies()).set(PENDING_COOKIE, row.id, { ...cookieBase, maxAge: LOGIN_MINUTES * 60 });
  return { token, code };
}

export async function pendingRequestId(): Promise<string | undefined> {
  return (await cookies()).get(PENDING_COOKIE)?.value;
}

/** Uses a sign-in link. Atomic: two clicks on the same link can't both succeed. */
export async function consumeToken(token: string): Promise<boolean> {
  const used = await db()
    .update(schema.adminLoginRequests)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(schema.adminLoginRequests.tokenHash, hashToken(token)),
        isNull(schema.adminLoginRequests.usedAt),
        gt(schema.adminLoginRequests.expiresAt, new Date()),
      ),
    )
    .returning({ id: schema.adminLoginRequests.id });
  return used.length === 1;
}

export type CodeResult = "ok" | "wrong" | "expired";

/** Checks a typed code. After MAX_CODE_ATTEMPTS wrong tries the request is dead. */
export async function consumeCode(code: string): Promise<CodeResult> {
  const id = await pendingRequestId();
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) return "expired";
  const [request] = await db()
    .select()
    .from(schema.adminLoginRequests)
    .where(eq(schema.adminLoginRequests.id, id));
  if (
    !request ||
    request.usedAt ||
    request.expiresAt < new Date() ||
    request.attempts >= MAX_CODE_ATTEMPTS
  ) {
    return "expired";
  }
  if (!sameHash(request.codeHash, hashCode(code, codeSecret()))) {
    await db()
      .update(schema.adminLoginRequests)
      .set({ attempts: sql`${schema.adminLoginRequests.attempts} + 1` })
      .where(eq(schema.adminLoginRequests.id, id));
    return request.attempts + 1 >= MAX_CODE_ATTEMPTS ? "expired" : "wrong";
  }
  const used = await db()
    .update(schema.adminLoginRequests)
    .set({ usedAt: new Date() })
    .where(and(eq(schema.adminLoginRequests.id, id), isNull(schema.adminLoginRequests.usedAt)))
    .returning({ id: schema.adminLoginRequests.id });
  return used.length === 1 ? "ok" : "expired";
}

/** Opens a session in this browser. */
export async function startSession() {
  const info = await requestInfo();
  const token = newToken();
  await db()
    .insert(schema.adminSessions)
    .values({
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000),
      ip: info.ip,
      location: info.location,
      device: info.device,
    });
  const jar = await cookies();
  jar.delete(PENDING_COOKIE);
  jar.set(SESSION_COOKIE, token, { ...cookieBase, maxAge: SESSION_DAYS * 86_400 });
  return info;
}

/** The current session, or null. Cached per request. */
export const currentSession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [session] = await db()
    .select()
    .from(schema.adminSessions)
    .where(
      and(
        eq(schema.adminSessions.tokenHash, hashToken(token)),
        isNull(schema.adminSessions.revokedAt),
        gt(schema.adminSessions.expiresAt, new Date()),
      ),
    );
  if (!session) return null;
  // "Last active" is refreshed at most every 5 minutes, not on every click.
  if (Date.now() - session.lastSeenAt.getTime() > 5 * 60_000) {
    await db()
      .update(schema.adminSessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(schema.adminSessions.id, session.id));
  }
  return session;
});

/** For every admin page and action: no session, no access. */
export async function requireAdmin() {
  const session = await currentSession();
  if (!session) redirect(adminPath("/conectare"));
  return session;
}

export async function endSession() {
  const session = await currentSession();
  if (session) {
    await db()
      .update(schema.adminSessions)
      .set({ revokedAt: new Date() })
      .where(eq(schema.adminSessions.id, session.id));
  }
  (await cookies()).delete(SESSION_COOKIE);
}

/** Signs out every other browser. */
export async function revokeOtherSessions(currentId: string) {
  await db()
    .update(schema.adminSessions)
    .set({ revokedAt: new Date() })
    .where(and(ne(schema.adminSessions.id, currentId), isNull(schema.adminSessions.revokedAt)));
}

export async function activeSessions() {
  return db()
    .select()
    .from(schema.adminSessions)
    .where(
      and(isNull(schema.adminSessions.revokedAt), gt(schema.adminSessions.expiresAt, new Date())),
    )
    .orderBy(desc(schema.adminSessions.lastSeenAt));
}
