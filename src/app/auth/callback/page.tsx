"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_IN") {
        router.push("/dashboard");
      }
    });

    return () => data.subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <Spinner />
        <p className="mt-2 text-sm text-slate-500">Memproses...</p>
      </div>
    </div>
  );
}
