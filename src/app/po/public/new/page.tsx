"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createPreOrder } from "@/services/supabase/pre-orders";
import { getIngredients } from "@/services/supabase/ingredients";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/format";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

interface LineItem {
  key: string;
  ingredient_id: string;
  ingredient_name: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

export default function PublicPreOrderPage() {
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { data: ingredients } = useQuery({
    queryKey: ["public-ingredients"],
    queryFn: getIngredients,
  });

  const createMutation = useMutation({
    mutationFn: createPreOrder,
    onSuccess: () => setSubmitted(true),
  });

  const handleAddItem = () => {
    setItems([
      ...items,
      { key: Math.random().toString(36).slice(2), ingredient_id: "", ingredient_name: "", qty: 1, unit: "", price: 0, total: 0 },
    ]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((i) => i.key !== key));
  };

  const handleItemChange = (key: string, field: string, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        const updated = { ...item, [field]: value };
        if (field === "ingredient_id") {
          const ing = ingredients?.find((i) => i.id === value);
          if (ing) {
            updated.ingredient_name = ing.name;
            updated.unit = ing.unit;
            updated.price = ing.current_price;
          }
        }
        updated.total = updated.qty * updated.price;
        return updated;
      })
    );
  };

  const total = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      po_number: `PUB-${Date.now().toString().slice(-6)}`,
      customer_name: customerName,
      is_public: true,
      items: items.map(({ key, ...rest }) => rest),
    });
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle className="mt-4">Pre Order Terkirim!</CardTitle>
            <CardDescription>
              Pre order kamu sudah disimpan. Kami akan menghubungi kamu segera.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-50 p-4 pt-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Pre Order</CardTitle>
          <CardDescription>
            Isi form di bawah untuk membuat pre order.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Nama Kamu</Label>
              <Input id="customer_name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="Nama kamu..." />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Bahan yang Dipesan</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="h-3.5 w-3.5" /> Tambah
                </Button>
              </div>

              {items.map((item) => (
                <div key={item.key} className="grid grid-cols-12 gap-2 items-end rounded-md border border-slate-200 p-3">
                  <div className="col-span-5">
                    <Select value={item.ingredient_id} onValueChange={(v) => handleItemChange(item.key, "ingredient_id", v)}>
                      <SelectTrigger><SelectValue placeholder="Pilih Bahan" /></SelectTrigger>
                      <SelectContent>
                        {ingredients?.map((ing) => (
                          <SelectItem key={ing.id} value={ing.id}>{ing.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input type="number" step="0.01" value={item.qty} onChange={(e) => handleItemChange(item.key, "qty", Number(e.target.value))} placeholder="Qty" />
                  </div>
                  <div className="col-span-2">
                    <Input value={item.unit} readOnly className="bg-slate-50 text-xs" />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium">{formatCurrency(item.total)}</p>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleRemoveItem(item.key)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {items.length > 0 && (
                <div className="flex items-center justify-between rounded-md bg-emerald-50 px-4 py-3">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-lg font-bold text-emerald-700">{formatCurrency(total)}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardContent>
            <Button type="submit" className="w-full" disabled={createMutation.isPending || items.length === 0 || !customerName}>
              {createMutation.isPending ? <Spinner className="py-0" /> : "Kirim Pre Order"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
