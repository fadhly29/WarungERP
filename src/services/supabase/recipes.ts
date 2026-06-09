import { createClient } from "@/lib/supabase/client";
import type { Recipe, RecipeItem } from "@/types/database";
import { getTenantId } from "./get-tenant-id";

export async function getRecipes(): Promise<Recipe[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .is("deleted_at", null)
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function getRecipeItems(recipeId: string): Promise<RecipeItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recipe_items")
    .select("*")
    .eq("recipe_id", recipeId);

  if (error) throw new Error(error.message);
  return data;
}

export async function createRecipe(values: {
  name: string;
  yield_qty: number;
  yield_unit: string;
  items: { ingredient_id: string; ingredient_name: string; qty: number; unit: string; unit_price: number; total_price: number }[];
}): Promise<Recipe> {
  const supabase = createClient();

  const hpp = values.items.reduce((sum, item) => sum + item.total_price, 0);

  const { data: recipe, error } = await supabase
    .from("recipes")
    .insert({
      name: values.name,
      hpp,
      yield_qty: values.yield_qty,
      yield_unit: values.yield_unit,
      tenant_id: await getTenantId(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (values.items.length > 0) {
    const recipeItems = values.items.map((item) => ({
      recipe_id: recipe.id,
      ...item,
    }));

    await supabase.from("recipe_items").insert(recipeItems);
  }

  return recipe;
}

export async function updateRecipe(
  id: string,
  values: {
    name: string;
    yield_qty: number;
    yield_unit: string;
    items: { ingredient_id: string; ingredient_name: string; qty: number; unit: string; unit_price: number; total_price: number }[];
  }
): Promise<Recipe> {
  const supabase = createClient();

  const hpp = values.items.reduce((sum, item) => sum + item.total_price, 0);

  const { error } = await supabase
    .from("recipes")
    .update({
      name: values.name,
      hpp,
      yield_qty: values.yield_qty,
      yield_unit: values.yield_unit,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await supabase.from("recipe_items").delete().eq("recipe_id", id);

  if (values.items.length > 0) {
    const recipeItems = values.items.map((item) => ({
      recipe_id: id,
      ...item,
    }));
    await supabase.from("recipe_items").insert(recipeItems);
  }

  return { id, hpp, ...values } as unknown as Recipe;
}

export async function deleteRecipe(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("recipes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
