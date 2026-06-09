"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const session = data.session;
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          tenant_id: "",
          role: "owner",
          created_at: session.user.created_at ?? "",
          updated_at: session.user.updated_at ?? "",
          deleted_at: null,
        });
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          tenant_id: "",
          role: "owner",
          created_at: session.user.created_at ?? "",
          updated_at: session.user.updated_at ?? "",
          deleted_at: null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setLoading]);

  return <>{children}</>;
}
