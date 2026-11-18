// The admin menu. A new section = one line here + a folder in app/admin/(panel).
import { Gauge, Inbox, ScrollText, Settings, ShieldCheck, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shows the number of unread messages next to the label. */
  badge?: "unread";
}

export const NAV: NavItem[] = [
  { href: "/", label: "Panou", icon: Gauge },
  { href: "/mesaje", label: "Mesaje", icon: Inbox, badge: "unread" },
  { href: "/setari", label: "Setări", icon: Settings },
  { href: "/jurnal", label: "Jurnal", icon: ScrollText },
  { href: "/securitate", label: "Securitate", icon: ShieldCheck },
];
