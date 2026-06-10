import { createClient } from "@/lib/supabase/client";
import type { PreOrder, PreOrderItem } from "@/types/database";
import { getTenantId } from "./get-tenant-id";

export async function getPreOrders(): Promise<PreOrder[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as PreOrder[];
}

export async function getPreOrder(id: string): Promise<PreOrder | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data as PreOrder;
}

export async function getPreOrderItems(poId: string): Promise<PreOrderItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("purchase_order_items")
    .select("*")
    .eq("po_id", poId);

  if (error) throw new Error(error.message);
  return data as PreOrderItem[];
}

export async function createPreOrder(values: {
  po_number: string;
  customer_name: string;
  notes?: string;
  is_public?: boolean;
  items: { ingredient_id: string; ingredient_name: string; qty: number; unit: string; price: number; total: number }[];
}): Promise<PreOrder> {
  const supabase = createClient();
  const total = values.items.reduce((sum, item) => sum + item.total, 0);

  const { data: po, error } = await supabase
    .from("purchase_orders")
    .insert({
      po_number: values.po_number,
      supplier: values.customer_name,
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

  return po as PreOrder;
}
