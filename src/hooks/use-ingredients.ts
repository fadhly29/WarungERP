"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "@/services/supabase/ingredients";

export function useIngredients() {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: getIngredients,
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...values }: { id: string; name: string; unit: string; current_price: number; supplier?: string }) =>
      updateIngredient(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}
