"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPreOrders } from "@/services/supabase/pre-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PreOrderForm } from "./components/po-form";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Search, Eye } from "lucide-react";

export default function PreOrdersPage() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: pos, isLoading } = useQuery({
    queryKey: ["pre-orders"],
    queryFn: getPreOrders,
  });

  const filtered = pos?.filter(
    (p) =>
      p.po_number.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Cari Pre Order..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Buat Pre Order
        </Button>
      </div>

      {filtered && filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">Belum ada Pre Order.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No PO</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.po_number}</TableCell>
                  <TableCell>{po.customer_name}</TableCell>
                  <TableCell>
                    <Badge variant={po.status === "fulfilled" ? "success" : po.status === "confirmed" ? "default" : "secondary"}>
                      {po.status === "draft" ? "Draft" : po.status === "confirmed" ? "Dikonfirmasi" : "Selesai"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(po.total)}</TableCell>
                  <TableCell className="text-slate-500">{formatDate(po.created_at)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={`/pre-orders/${po.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PreOrderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["pre-orders"] })}
      />
    </div>
  );
}
