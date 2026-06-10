"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createPreOrder } from "@/services/supabase/pre-orders";
import { getIngredients } from "@/services/supabase/ingredients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/format";
import { Plus, Trash2 } from "lucide-react";

interface LineItem {
  key: string;
  ingredient_id: string;
  ingredient_name: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

interface PreOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PreOrderForm({ open, onOpenChange, onSuccess }: PreOrderFormProps) {
  const [poNumber, setPoNumber] = useState(`PO-${Date.now().toString().slice(-6)}`);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);

  const { data: ingredients } = useQuery({
    queryKey: ["ingredients"],
    queryFn: getIngredients,
  });

  const createMutation = useMutation({
    mutationFn: createPreOrder,
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setPoNumber(`PO-${Date.now().toString().slice(-6)}`);
    setCustomerName("");
    setNotes("");
    setItems([]);
  };

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
    try {
      await createMutation.mutateAsync({
        po_number: poNumber,
        customer_name: customerName,
        notes: notes || undefined,
        items: items.map(({ key, ...rest }) => rest),
      });
    } catch {
      // error handled by mutation state
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buat Pre Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="po_number">No PO</Label>
              <Input id="po_number" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_name">Nama Pelanggan</Label>
              <Input id="customer_name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="Budi Santoso" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opsional..." />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Item Pesanan</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-3.5 w-3.5" /> Tambah Item
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
                <span className="text-sm font-medium text-emerald-700">Total</span>
                <span className="text-lg font-bold text-emerald-700">{formatCurrency(total)}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending || items.length === 0}>
              {createMutation.isPending ? <Spinner className="py-0" /> : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
