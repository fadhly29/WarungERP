import { createClient } from "@/lib/supabase/client";
import type { Inventory } from "@/types/database";
import { getTenantId } from "./get-tenant-id";

export async function getInventory(): Promise<Inventory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .is("deleted_at", null)
    .order("ingredient_name");

  if (error) throw new Error(error.message);
  return data;
}

export async function updateStock(id: string, stock: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("inventory")
    .update({ stock, last_updated: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function createInventoryItem(values: {
  ingredient_id: string;
  ingredient_name: string;
  stock: number;
  unit: string;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("inventory")
    .insert({ ...values, tenant_id: await getTenantId() });

  if (error) throw new Error(error.message);
}
