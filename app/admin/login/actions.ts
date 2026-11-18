"use server";

import { headers } from "next/headers";

import {
  ADMIN_EMAIL,
  audit,
  consumeCode,
  consumeToken,
  createLoginRequest,
  requestInfo,
  startSession,
} from "@/lib/admin/auth";
import { sendLoginEmail, sendNewSignInEmail } from "@/lib/admin/emails";
import { overLimit, verifyTurnstile } from "@/lib/contact/checks";

// Actions never redirect: a redirect inside an action skips the admin routing.
// They answer with the step to show; on "done" the browser goes to the panel itself.
export interface LoginState {
  step: "email" | "code" | "done";
  error?: string;
}

/** The admin host this request came to (admin.hartiromania.ro, or admin.localhost locally). */
async function origin() {
  const h = await headers();
  const host = h.get("host") ?? "admin.hartiromania.ro";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const TOO_MANY = "Prea multe încercări. Mai încearcă peste 15 minute.";

/** Step 1: email address → link + code by email. The answer never reveals whether the address is right. */
export async function requestAccess(_: LoginState, form: FormData): Promise<LoginState> {
  const { ip, location, device } = await requestInfo();
  const key = ip ?? "unknown";
  if (await overLimit(`admin:request:${key}`, 5, 15 * 60))
    return { step: "email", error: TOO_MANY };

  const turnstile = await verifyTurnstile(
    String(form.get("cf-turnstile-response") ?? "") || undefined,
    ip ?? undefined,
  );
  if (turnstile === "failed" || turnstile === "missing") {
    return {
      step: "email",
      error: "Verificarea de securitate a eșuat. Reîncarcă pagina și încearcă din nou.",
    };
  }

  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const isOwner = email === ADMIN_EMAIL;
  await audit("login.requested", { matched: isOwner });

  // A global cap as well, in case someone rotates IP addresses.
  if (isOwner && !(await overLimit("admin:request:owner", 10, 60 * 60))) {
    const { token, code } = await createLoginRequest();
    await sendLoginEmail({
      link: `${await origin()}/login/confirm?t=${encodeURIComponent(token)}`,
      code,
      location,
      device,
    });
  }
  return { step: "code" };
}

async function signIn(method: "code" | "link") {
  const info = await startSession();
  await audit("login.success", { method, location: info.location, device: info.device });
  try {
    await sendNewSignInEmail({
      location: info.location,
      device: info.device,
      ip: info.ip ?? "necunoscut",
    });
  } catch (error) {
    console.error("[admin] new sign-in email failed", error);
  }
}

/** Step 2: the 6-digit code from the email. */
export async function verifyCode(_: LoginState, form: FormData): Promise<LoginState> {
  const { ip } = await requestInfo();
  if (await overLimit(`admin:code:${ip ?? "unknown"}`, 10, 15 * 60))
    return { step: "code", error: TOO_MANY };

  const code = String(form.get("code") ?? "").replace(/\D/g, "");
  if (code.length !== 6) return { step: "code", error: "Cod invalid." };

  const result = await consumeCode(code);
  if (result === "wrong") {
    await audit("login.code_wrong");
    return { step: "code", error: "Cod invalid." };
  }
  if (result === "expired") {
    return { step: "email", error: "Cod invalid sau expirat." };
  }
  await signIn("code");
  return { step: "done" };
}

export interface ConfirmState {
  done: boolean;
  error?: string;
}

/** The link from the email, confirmed with one click (so mail scanners can't use it up). */
export async function confirmLink(_: ConfirmState, form: FormData): Promise<ConfirmState> {
  const { ip } = await requestInfo();
  if (await overLimit(`admin:link:${ip ?? "unknown"}`, 10, 15 * 60)) {
    return { done: false, error: TOO_MANY };
  }
  const token = String(form.get("token") ?? "");
  if (!token || !(await consumeToken(token))) {
    await audit("login.link_invalid");
    return { done: false, error: "Link invalid sau expirat." };
  }
  await signIn("link");
  return { done: true };
}
