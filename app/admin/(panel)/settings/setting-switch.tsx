"use client";

import { useOptimistic, useTransition } from "react";

import type { SettingKey } from "@/lib/settings";
import { toggleSetting } from "../actions";

export function SettingSwitch({
  settingKey,
  value,
  labelledBy,
}: {
  settingKey: SettingKey;
  value: boolean;
  labelledBy: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [pending, start] = useTransition();

  const toggle = () =>
    start(async () => {
      setOptimistic(!optimistic);
      await toggleSetting(settingKey, !optimistic);
    });

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-labelledby={labelledBy}
      aria-busy={pending}
      onClick={toggle}
      className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
        optimistic ? "bg-(--accent)" : "bg-(--line-strong)"
      }`}
    >
      <span
        aria-hidden
        className={`size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
          optimistic ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
