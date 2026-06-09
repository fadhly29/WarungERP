"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createRecipe, updateRecipe, getRecipeItems } from "@/services/supabase/recipes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Ingredient, Recipe, RecipeItem } from "@/types/database";

interface RecipeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRecipe: Recipe | null;
  ingredients: Ingredient[];
  onSuccess: () => void;
}

interface LineItem {
  key: string;
  ingredient_id: string;
  ingredient_name: string;
  qty: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

export function RecipeForm({ open, onOpenChange, editingRecipe, ingredients, onSuccess }: RecipeFormProps) {
  const [name, setName] = useState("");
  const [yieldQty, setYieldQty] = useState(1);
  const [yieldUnit, setYieldUnit] = useState("pcs");
  const [items, setItems] = useState<LineItem[]>([]);

  const { data: existingItems } = useQuery({
    queryKey: ["recipe-items", editingRecipe?.id],
    queryFn: () => (editingRecipe ? getRecipeItems(editingRecipe.id) : []),
    enabled: !!editingRecipe,
  });

  useEffect(() => {
    if (editingRecipe) {
      setName(editingRecipe.name);
      setYieldQty(editingRecipe.yield_qty);
      setYieldUnit(editingRecipe.yield_unit);
    } else {
      setName("");
      setYieldQty(1);
      setYieldUnit("pcs");
      setItems([]);
    }
  }, [editingRecipe, open]);

  useEffect(() => {
    if (existingItems && existingItems.length > 0) {
      setItems(
        existingItems.map((ei) => ({
          key: ei.id,
          ingredient_id: ei.ingredient_id,
          ingredient_name: ei.ingredient_name,
          qty: ei.qty,
          unit: ei.unit,
          unit_price: ei.unit_price,
          total_price: ei.total_price,
        }))
      );
    }
  }, [existingItems]);

  const createMutation = useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }: Parameters<typeof updateRecipe>[1] & { id: string }) =>
      updateRecipe(id, values),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const handleAddItem = () => {
    setItems([
      ...items,
      { key: Math.random().toString(36).slice(2), ingredient_id: "", ingredient_name: "", qty: 1, unit: "", unit_price: 0, total_price: 0 },
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
          const ing = ingredients.find((i) => i.id === value);
          if (ing) {
            updated.ingredient_name = ing.name;
            updated.unit = ing.unit;
            updated.unit_price = ing.current_price;
          }
        }

        updated.total_price = updated.qty * updated.unit_price;
        return updated;
      })
    );
  };

  const hpp = items.reduce((sum, item) => sum + item.total_price, 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = {
      name,
      yield_qty: yieldQty,
      yield_unit: yieldUnit,
      items: items.map(({ key, ...rest }) => rest),
    };

    try {
      if (editingRecipe) {
        await updateMutation.mutateAsync({ id: editingRecipe.id, ...values });
      } else {
        await createMutation.mutateAsync(values);
      }
    } catch {
      // error handled by mutation state / parent
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingRecipe ? "Edit Resep" : "Tambah Resep"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Resep</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nasi Goreng Special" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yield_qty">Jumlah Yield</Label>
              <Input id="yield_qty" type="number" step="0.1" value={yieldQty} onChange={(e) => setYieldQty(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yield_unit">Satuan Yield</Label>
              <Input id="yield_unit" value={yieldUnit} onChange={(e) => setYieldUnit(e.target.value)} placeholder="pcs" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Bahan-Bahan</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-3.5 w-3.5" /> Tambah Bahan
              </Button>
            </div>

            {items.length === 0 && (
              <p className="text-xs text-slate-400">Belum ada bahan. Klik tombol di atas untuk menambahkan.</p>
            )}

            {items.map((item) => (
              <div key={item.key} className="grid grid-cols-12 gap-2 items-end rounded-md border border-slate-200 p-3">
                <div className="col-span-5">
                  <Select value={item.ingredient_id} onValueChange={(v) => handleItemChange(item.key, "ingredient_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih Bahan" /></SelectTrigger>
                    <SelectContent>
                      {ingredients.map((ing) => (
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
                  <p className="text-xs font-medium text-slate-700">{formatCurrency(item.total_price)}</p>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleRemoveItem(item.key)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-md bg-emerald-50 px-4 py-3">
            <span className="text-sm font-medium text-emerald-700">Total HPP</span>
            <span className="text-lg font-bold text-emerald-700">{formatCurrency(hpp)}</span>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending || items.length === 0}>
              {isPending ? <Spinner className="py-0" /> : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
