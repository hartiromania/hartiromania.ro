"use server";

import { audit, requestInfo } from "@/lib/admin/auth";
import { overLimit } from "@/lib/contact/checks";

/** One journal line per admin page opened. Capped per IP so nobody can flood the journal. */
export async function trackView(path: string) {
  const clean = path.replace(/^\/admin(?=\/|$)/, "").slice(0, 200) || "/";
  const { ip } = await requestInfo();
  if (await overLimit(`admin:view:${ip ?? "unknown"}`, 300, 60 * 60)) return;
  await audit("page.view", { path: clean });
}
