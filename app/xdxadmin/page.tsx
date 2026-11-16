"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Set admin cookie that expires in 24 hours
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    document.cookie = `xdxadmin=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

    // Add a small delay to ensure cookie is set before redirect
    setTimeout(() => {
      router.push("/");
    }, 100);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">Activating admin mode...</p>
    </div>
  );
}
