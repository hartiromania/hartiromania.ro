"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { buttonClass } from "@/components/admin/ui";
import { removeMessage } from "../../actions";

// Deleting is permanent, so it asks once more, in place, instead of a modal.
export function DeleteMessage({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={buttonClass("danger")}>
        <Trash2 aria-hidden /> Șterge
      </button>
    );
  }

  return (
    <form action={removeMessage.bind(null, id)} className="flex items-center gap-2">
      <span className="text-sm text-(--danger)">Sigur? Nu se poate anula.</span>
      <button type="submit" className={buttonClass("danger")}>
        Da, șterge
      </button>
      <button type="button" onClick={() => setConfirming(false)} className={buttonClass("ghost")}>
        Renunță
      </button>
    </form>
  );
}
