"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ingredientSchema, type IngredientFormValues } from "@/services/supabase/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface IngredientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: IngredientFormValues;
  onSubmit: (values: IngredientFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function IngredientForm({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isSubmitting,
}: IngredientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema) as unknown as Resolver<IngredientFormValues>,
    defaultValues: defaultValues ?? {
      name: "",
      unit: "",
      current_price: 0,
      supplier: "",
    },
  });

  const handleFormSubmit = async (values: IngredientFormValues) => {
    await onSubmit(values);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) reset();
        onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Bahan Baku" : "Tambah Bahan Baku"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Bahan</Label>
            <Input id="name" {...register("name")} placeholder="Tepung Terigu" />
            {errors.name && (
              <p className="text-xs text-red-600">{(errors.name as { message?: string }).message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Satuan</Label>
              <Input id="unit" {...register("unit")} placeholder="kg" />
              {errors.unit && (
                <p className="text-xs text-red-600">{(errors.unit as { message?: string }).message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_price">Harga</Label>
              <Input
                id="current_price"
                type="number"
                step="1"
                {...register("current_price")}
                placeholder="15000"
              />
              {errors.current_price && (
                <p className="text-xs text-red-600">
                  {(errors.current_price as { message?: string }).message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              {...register("supplier")}
              placeholder="Toko Maju Jaya (opsional)"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="py-0" /> : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
