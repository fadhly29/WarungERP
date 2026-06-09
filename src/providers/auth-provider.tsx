"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

async function fetchTenantId(userId: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", userId)
    .single();
  return data?.tenant_id ?? "";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    const hydrateUser = async (session: Session | null) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      const tenantId = await fetchTenantId(session.user.id);
      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        tenant_id: tenantId,
        role: "owner",
        created_at: session.user.created_at ?? "",
        updated_at: session.user.updated_at ?? "",
        deleted_at: null,
      });
    };

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const session = data.session;
      setSession(session);
      hydrateUser(session).then(() => setLoading(false));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      hydrateUser(session).then(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setLoading]);

  return <>{children}</>;
}
