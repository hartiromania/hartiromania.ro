// Site switches edited from the admin. Each setting has a default in code, so a missing
// row (or a database hiccup) never breaks the public site.
import "server-only";

import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";

export const SETTINGS = {
  copyProtection: {
    label: "Protecție la copiere",
    description: "Blochează click-dreapta, copierea textului și tragerea imaginilor pe site.",
    default: true,
  },
} as const;

export type SettingKey = keyof typeof SETTINGS;
// All switches are on/off for now; widen this when a setting of another kind appears.
export type SiteSettings = Record<SettingKey, boolean>;

export function defaults(): SiteSettings {
  return Object.fromEntries(
    Object.entries(SETTINGS).map(([key, def]) => [key, def.default]),
  ) as SiteSettings;
}

export async function getSettings(): Promise<SiteSettings> {
  const values = defaults();
  try {
    const rows = await db().select().from(schema.settings);
    for (const row of rows) {
      if (row.key in SETTINGS) (values as Record<string, unknown>)[row.key] = row.value;
    }
  } catch (error) {
    console.error("[settings] read failed, using defaults", error);
  }
  return values;
}

export async function setSetting<K extends SettingKey>(key: K, value: SiteSettings[K]) {
  await db()
    .insert(schema.settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: schema.settings.key,
      set: { value, updatedAt: new Date() },
    });
}

export async function deleteSetting(key: SettingKey) {
  await db().delete(schema.settings).where(eq(schema.settings.key, key));
}
