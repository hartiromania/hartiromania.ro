"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin, audit, endSession, revokeOtherSessions } from "@/lib/admin/auth";
import { deleteMessage, updateMessage } from "@/lib/admin/messages";
import { SETTINGS, setSetting, type SettingKey } from "@/lib/settings";

/** The caller sends the browser to /login afterwards. */
export async function signOut() {
  await assertAdmin();
  await audit("logout");
  await endSession();
}

export async function signOutOthers() {
  const session = await assertAdmin();
  await revokeOtherSessions(session.id);
  await audit("sessions.revoked_others");
  revalidatePath("/admin/security");
}

export async function toggleSetting(key: SettingKey, value: boolean) {
  await assertAdmin();
  if (!(key in SETTINGS)) return;
  await setSetting(key, value);
  await audit("setting.changed", { key, value });
  // The public site reads the switches through this endpoint.
  revalidatePath("/api/site-settings");
  revalidatePath("/admin/settings");
}

type MessageAction = "spam" | "ok" | "archive" | "unarchive" | "unread";

export async function messageAction(id: string, action: MessageAction) {
  await assertAdmin();
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
  await assertAdmin();
  await deleteMessage(id);
  await audit("message.deleted", { id });
  revalidatePath("/admin", "layout");
}
