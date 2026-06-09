import { createClient } from "@/lib/supabase/client";
import type { Ingredient } from "@/types/database";
import { getTenantId } from "./get-tenant-id";

export async function getIngredients(): Promise<Ingredient[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .is("deleted_at", null)
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function getIngredient(id: string): Promise<Ingredient | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function createIngredient(values: {
  name: string;
  unit: string;
  current_price: number;
  supplier?: string;
}): Promise<Ingredient> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ingredients")
    .insert({ ...values, tenant_id: await getTenantId() })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateIngredient(
  id: string,
  values: {
    name: string;
    unit: string;
    current_price: number;
    supplier?: string;
  }
): Promise<Ingredient> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ingredients")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteIngredient(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("ingredients")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
