import { createClient } from "@/lib/supabase/client";
import type { PurchaseOrder, PurchaseOrderItem } from "@/types/database";
import { getTenantId } from "./get-tenant-id";

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function getPOItems(poId: string): Promise<PurchaseOrderItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("purchase_order_items")
    .select("*")
    .eq("po_id", poId);

  if (error) throw new Error(error.message);
  return data;
}

export async function createPurchaseOrder(values: {
  po_number: string;
  supplier: string;
  notes?: string;
  is_public?: boolean;
  items: { ingredient_id: string; ingredient_name: string; qty: number; unit: string; price: number; total: number }[];
}): Promise<PurchaseOrder> {
  const supabase = createClient();
  const total = values.items.reduce((sum, item) => sum + item.total, 0);

  const { data: po, error } = await supabase
    .from("purchase_orders")
    .insert({
      po_number: values.po_number,
      supplier: values.supplier,
      notes: values.notes ?? null,
      is_public: values.is_public ?? false,
      total,
      status: "draft",
      tenant_id: await getTenantId(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (values.items.length > 0) {
    await supabase.from("purchase_order_items").insert(
      values.items.map((item) => ({ po_id: po.id, ...item }))
    );
  }

  return po;
}
