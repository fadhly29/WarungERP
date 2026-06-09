"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Save } from "lucide-react";

export default function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const [tenantName, setTenantName] = useState("");

  const handleSave = async () => {
    if (!tenantName.trim()) return;
    const supabase = createClient();
    await supabase.from("tenants").upsert({ name: tenantName, slug: tenantName.toLowerCase().replace(/\s+/g, "-") });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    signOut();
    router.push("/auth/login");
  };

  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil Bisnis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm font-medium">{user?.email ?? "-"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Nama Bisnis</p>
            <div className="flex gap-2">
              <Input placeholder="Nama warung / bisnis kamu" value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3.5 w-3.5 mr-1" />
                Simpan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
