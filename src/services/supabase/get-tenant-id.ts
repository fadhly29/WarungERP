import { createClient } from "@/lib/supabase/client";

let cachedTenantId: string | null = null;

export async function getTenantId(): Promise<string> {
  if (cachedTenantId) return cachedTenantId;

  const supabase = createClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  const userEmail = sessionData.session?.user?.email ?? "";

  if (!userId) {
    throw new Error("Session tidak ditemukan. Silakan login kembali.");
  }

  // cek apakah user row sudah ada
  const { data: existingUser } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", userId)
    .single();

  if (existingUser?.tenant_id) {
    cachedTenantId = existingUser.tenant_id;
    return existingUser.tenant_id;
  }

  // auto-create tenant + user row (fallback kalau trigger database belum terpasang)
  const tenantName = userEmail.split("@")[0];
  const tenantSlug =
    tenantName.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 8);

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({ name: tenantName, slug: tenantSlug })
    .select("id")
    .single();

  if (tenantError || !tenant) throw new Error("Gagal membuat data tenant: " + (tenantError?.message ?? "response kosong"));

  const { error: userError } = await supabase
    .from("users")
    .insert({ id: userId, email: userEmail, tenant_id: tenant!.id, role: "owner" });

  if (userError) throw new Error("Gagal membuat data user: " + userError.message);

  cachedTenantId = tenant!.id;
  return tenant!.id;
}
