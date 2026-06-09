"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenus, createMenu, updateMenu, deleteMenu } from "@/services/supabase/menus";
import { getRecipes } from "@/services/supabase/recipes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MenuForm } from "./components/menu-form";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import type { Menu } from "@/types/database";

export default function MenusPage() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Menu | null>(null);
  const [deleting, setDeleting] = useState<Menu | null>(null);
  const queryClient = useQueryClient();

  const { data: menus, isLoading } = useQuery({ queryKey: ["menus"], queryFn: getMenus });
  const { data: recipes } = useQuery({ queryKey: ["recipes"], queryFn: getRecipes });

  const deleteMutation = useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["menus"] }),
  });

  const filtered = menus?.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteMutation.mutateAsync(deleting.id);
    setDeleting(null);
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Cari menu..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Tambah Menu
        </Button>
      </div>

      {filtered && filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">Belum ada menu. Tambahkan menu pertama kamu.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Resep</TableHead>
                <TableHead>HPP</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.recipe_name}</TableCell>
                  <TableCell>{formatCurrency(m.hpp)}</TableCell>
                  <TableCell>{formatCurrency(m.selling_price)}</TableCell>
                  <TableCell>
                    <Badge variant="success">
                      {formatCurrency(m.margin)} ({formatPercent(m.margin_percent)})
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(m); setFormOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleting(m)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <MenuForm
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(null); }}
        editingMenu={editing}
        recipes={recipes ?? []}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["menus"] })}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Menu?</AlertDialogTitle>
            <AlertDialogDescription>Menu <strong>{deleting?.name}</strong> akan dihapus secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
