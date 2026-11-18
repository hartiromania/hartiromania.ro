import { PageHeader, Panel } from "@/components/admin/ui";
import { getSettings, SETTINGS, type SettingKey } from "@/lib/settings";
import { SettingSwitch } from "./setting-switch";

export const metadata = { title: "Setări" };

export default async function SettingsPage() {
  const settings = await getSettings();
  const keys = Object.keys(SETTINGS) as SettingKey[];

  return (
    <>
      <PageHeader title="Setări" />
      <Panel>
        <ul className="divide-y divide-(--line)">
          {keys.map((key) => (
            <li key={key} className="flex items-start justify-between gap-6 px-5 py-4">
              <div className="min-w-0">
                <div id={`${key}-label`} className="font-medium">
                  {SETTINGS[key].label}
                </div>
                <p className="mt-0.5 max-w-[60ch] text-sm leading-relaxed text-(--ink-2)">
                  {SETTINGS[key].description}
                </p>
              </div>
              <SettingSwitch settingKey={key} value={settings[key]} labelledBy={`${key}-label`} />
            </li>
          ))}
        </ul>
      </Panel>
      <p className="mt-3 text-sm text-(--muted)">Schimbările apar pe site în cel mult un minut.</p>
    </>
  );
}
