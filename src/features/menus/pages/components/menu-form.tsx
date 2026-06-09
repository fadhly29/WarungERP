"use client";

import { useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { createMenu, updateMenu } from "@/services/supabase/menus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { Menu, Recipe } from "@/types/database";

interface MenuFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMenu: Menu | null;
  recipes: Recipe[];
  onSuccess: () => void;
}

export function MenuForm({ open, onOpenChange, editingMenu, recipes, onSuccess }: MenuFormProps) {
  const [name, setName] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [sellingPrice, setSellingPrice] = useState(0);

  useEffect(() => {
    if (editingMenu) {
      setName(editingMenu.name);
      setRecipeId(editingMenu.recipe_id);
      setSellingPrice(editingMenu.selling_price);
    } else {
      setName("");
      setRecipeId("");
      setSellingPrice(0);
    }
  }, [editingMenu, open]);

  const selectedRecipe = recipes.find((r) => r.id === recipeId);
  const hpp = selectedRecipe?.hpp ?? 0;
  const margin = sellingPrice - hpp;
  const marginPercent = sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0;

  const createMutation = useMutation({
    mutationFn: createMenu,
    onSuccess: () => { onSuccess(); onOpenChange(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }: Parameters<typeof updateMenu>[1] & { id: string }) =>
      updateMenu(id, values),
    onSuccess: () => { onSuccess(); onOpenChange(false); },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipe) return;

    const values = {
      name,
      recipe_id: recipeId,
      recipe_name: selectedRecipe.name,
      hpp: selectedRecipe.hpp,
      selling_price: sellingPrice,
    };

    try {
      if (editingMenu) {
        await updateMutation.mutateAsync({ id: editingMenu.id, ...values });
      } else {
        await createMutation.mutateAsync(values);
      }
    } catch {
      // error handled by mutation state / parent
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingMenu ? "Edit Menu" : "Tambah Menu"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Menu</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nasi Goreng Special" required />
          </div>
          <div className="space-y-2">
            <Label>Resep</Label>
            <Select value={recipeId} onValueChange={setRecipeId}>
              <SelectTrigger><SelectValue placeholder="Pilih Resep" /></SelectTrigger>
              <SelectContent>
                {recipes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name} — HPP {formatCurrency(r.hpp)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="selling_price">Harga Jual</Label>
            <Input id="selling_price" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} required />
          </div>

          {selectedRecipe && sellingPrice > 0 && (
            <div className="rounded-md bg-slate-50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">HPP</span>
                <span>{formatCurrency(hpp)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Margin</span>
                <span className="font-medium text-emerald-600">{formatCurrency(margin)} ({formatPercent(marginPercent)})</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending || !selectedRecipe}>
              {isPending ? <Spinner className="py-0" /> : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
