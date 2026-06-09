export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface User {
  id: string;
  email: string;
  tenant_id: string;
  role: "owner" | "staff";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Ingredient {
  id: string;
  tenant_id: string;
  name: string;
  unit: string;
  current_price: number;
  supplier: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IngredientPriceHistory {
  id: string;
  ingredient_id: string;
  price: number;
  recorded_at: string;
}

export interface Recipe {
  id: string;
  tenant_id: string;
  name: string;
  hpp: number;
  yield_qty: number;
  yield_unit: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RecipeItem {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  ingredient_name: string;
  qty: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

export interface RecipeVersion {
  id: string;
  recipe_id: string;
  version: number;
  data: Record<string, unknown>;
  created_at: string;
}

export interface Menu {
  id: string;
  tenant_id: string;
  name: string;
  recipe_id: string;
  recipe_name: string;
  hpp: number;
  selling_price: number;
  margin: number;
  margin_percent: number;
  category: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Inventory {
  id: string;
  tenant_id: string;
  ingredient_id: string;
  ingredient_name: string;
  stock: number;
  unit: string;
  last_updated: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PurchaseOrder {
  id: string;
  tenant_id: string;
  po_number: string;
  supplier: string;
  status: "draft" | "sent" | "received";
  total: number;
  notes: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  ingredient_id: string;
  ingredient_name: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

export interface MarketplaceSyncLog {
  id: string;
  tenant_id: string;
  platform: string;
  status: "success" | "failed";
  synced_at: string;
}

export interface SalesReport {
  id: string;
  tenant_id: string;
  menu_id: string;
  menu_name: string;
  qty: number;
  revenue: number;
  profit: number;
  date: string;
  created_at: string;
}

export interface ProfitReport {
  id: string;
  tenant_id: string;
  total_revenue: number;
  total_profit: number;
  avg_margin: number;
  period: string;
  created_at: string;
}

export interface DashboardData {
  revenue: number;
  profit: number;
  margin: number;
  best_sellers: { name: string; qty: number }[];
}
