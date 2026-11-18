"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { audit, endSession, requireAdmin, revokeOtherSessions } from "@/lib/admin/auth";
import { deleteMessage, updateMessage } from "@/lib/admin/messages";
import { SETTINGS, setSetting, type SettingKey } from "@/lib/settings";
import { adminPath } from "@/lib/admin/url";

export async function signOut() {
  await requireAdmin();
  await audit("logout");
  await endSession();
  redirect(adminPath("/conectare"));
}

export async function signOutOthers() {
  const session = await requireAdmin();
  await revokeOtherSessions(session.id);
  await audit("sessions.revoked_others");
  revalidatePath("/admin/securitate");
}

export async function toggleSetting(key: SettingKey, value: boolean) {
  await requireAdmin();
  if (!(key in SETTINGS)) return;
  await setSetting(key, value);
  await audit("setting.changed", { key, value });
  // The public site reads the switches through this endpoint.
  revalidatePath("/api/site-settings");
  revalidatePath("/admin/setari");
}

type MessageAction = "spam" | "ok" | "archive" | "unarchive" | "unread";

export async function messageAction(id: string, action: MessageAction) {
  await requireAdmin();
  const changes = {
    spam: { markedAs: "spam" as const },
    ok: { markedAs: "ok" as const },
    archive: { archived: true },
    unarchive: { archived: false },
    unread: { readAt: null },
  }[action];
  await updateMessage(id, changes);
  await audit(`message.${action}`, { id });
  revalidatePath("/admin", "layout");
}

export async function removeMessage(id: string) {
  await requireAdmin();
  await deleteMessage(id);
  await audit("message.deleted", { id });
  revalidatePath("/admin", "layout");
  redirect(adminPath("/mesaje"));
}
