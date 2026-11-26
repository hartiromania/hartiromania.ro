// The admin menu. A new section = one line here + a folder in app/admin/(panel).
import {
  Cookie,
  Gauge,
  Inbox,
  ScrollText,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shows the number of unread messages next to the label. */
  badge?: "unread";
}

export const NAV: NavItem[] = [
  { href: "/", label: "Panou", icon: Gauge },
  { href: "/messages", label: "Mesaje", icon: Inbox, badge: "unread" },
  { href: "/cookies", label: "Cookie-uri", icon: Cookie },
  { href: "/settings", label: "Setări", icon: Settings },
  { href: "/journal", label: "Jurnal", icon: ScrollText },
  { href: "/security", label: "Securitate", icon: ShieldCheck },
];
