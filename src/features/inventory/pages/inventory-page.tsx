"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventory, updateStock } from "@/services/supabase/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Save } from "lucide-react";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [editingStocks, setEditingStocks] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => updateStock(id, stock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setEditingStocks({});
    },
  });

  const filtered = inventory?.filter((i) =>
    i.ingredient_name.toLowerCase().includes(search.toLowerCase())
  );

  const getStockDisplay = (item: typeof filtered extends (infer T)[] | undefined ? T : never) => {
    if (!item) return "";
    return editingStocks[item.id] !== undefined ? editingStocks[item.id] : item.stock;
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Cari bahan..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bahan</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Terakhir Update</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.ingredient_name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    className="w-28 h-8"
                    value={getStockDisplay(item)}
                    onChange={(e) =>
                      setEditingStocks((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                    }
                  />
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell className="text-slate-500">
                  {new Date(item.last_updated).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={editingStocks[item.id] === undefined || updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: item.id, stock: editingStocks[item.id] })}
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Simpan
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
