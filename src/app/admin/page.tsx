"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-slate-500">Redirecting to dashboard…</p>
    </div>
  );
}
