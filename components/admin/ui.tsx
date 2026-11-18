// Small building blocks shared by every admin page. Styling comes from the tokens in
// app/admin/admin.css, so light and dark follow automatically.
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-(--ink) text-(--surface) hover:opacity-90",
  secondary: "border border-(--line-strong) bg-(--surface) text-(--ink) hover:bg-(--sunken)",
  danger: "border border-(--line-strong) bg-(--surface) text-(--danger) hover:bg-(--danger-soft)",
  ghost: "text-(--ink-2) hover:bg-(--sunken) hover:text-(--ink)",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-[background-color,opacity,transform] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 ${VARIANTS[variant]} ${extra}`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export const inputClass =
  "h-11 w-full rounded-lg border border-(--line-strong) bg-(--surface) px-3.5 text-[15px] text-(--ink) placeholder:text-(--muted) transition-colors focus-visible:border-(--accent) focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] focus-visible:outline-none";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
      {children}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-xl border border-(--line) bg-(--surface) shadow-(--shadow) ${className}`}
    >
      {children}
    </section>
  );
}

/** Small colored label for a state (spam / ok / unread), always with words, never color alone. */
export function Tag({
  tone,
  children,
}: {
  tone: "ok" | "danger" | "accent" | "neutral";
  children: ReactNode;
}) {
  const tones = {
    ok: "bg-(--ok-soft) text-(--ok)",
    danger: "bg-(--danger-soft) text-(--danger)",
    accent: "bg-(--accent-soft) text-(--accent)",
    neutral: "bg-(--sunken) text-(--ink-2)",
  };
  return (
    <span
      className={`tabular inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

const RELATIVE = new Intl.RelativeTimeFormat("ro", { numeric: "auto" });

/** "acum 5 minute", "ieri", or a date for anything older than a week. */
export function timeAgo(date: Date): string {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "chiar acum";
  if (abs < 3600) return RELATIVE.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return RELATIVE.format(Math.round(seconds / 3600), "hour");
  if (abs < 7 * 86_400) return RELATIVE.format(Math.round(seconds / 86_400), "day");
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Bucharest",
  }).format(date);
}
