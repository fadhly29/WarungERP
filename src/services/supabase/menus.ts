import { createClient } from "@/lib/supabase/client";
import type { Menu } from "@/types/database";

export async function getMenus(): Promise<Menu[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .is("deleted_at", null)
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function getMenu(id: string): Promise<Menu | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function createMenu(values: {
  name: string;
  recipe_id: string;
  recipe_name: string;
  hpp: number;
  selling_price: number;
  category?: string;
}): Promise<Menu> {
  const supabase = createClient();
  const margin = values.selling_price - values.hpp;
  const margin_percent = values.hpp > 0 ? (margin / values.selling_price) * 100 : 0;

  const { data, error } = await supabase
    .from("menus")
    .insert({
      ...values,
      margin,
      margin_percent: Math.round(margin_percent * 100) / 100,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateMenu(
  id: string,
  values: {
    name: string;
    recipe_id: string;
    recipe_name: string;
    hpp: number;
    selling_price: number;
    category?: string;
  }
): Promise<Menu> {
  const supabase = createClient();
  const margin = values.selling_price - values.hpp;
  const margin_percent = values.hpp > 0 ? (margin / values.selling_price) * 100 : 0;

  const { data, error } = await supabase
    .from("menus")
    .update({
      ...values,
      margin,
      margin_percent: Math.round(margin_percent * 100) / 100,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMenu(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("menus")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
