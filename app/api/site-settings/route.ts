import { NextResponse } from "next/server";

import { getSettings } from "@/lib/settings";

// The public site's switches (set from the admin). Cached for a minute; the admin
// refreshes it right away when a switch changes.
export const revalidate = 60;

export async function GET() {
  const { copyProtection } = await getSettings();
  return NextResponse.json({ copyProtection });
}
