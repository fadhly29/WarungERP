import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  current_price: z.coerce.number().min(0, "Harga minimal 0"),
  supplier: z.string().optional(),
});

export type IngredientFormValues = z.infer<typeof ingredientSchema>;
