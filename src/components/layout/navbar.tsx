"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/ingredients": "Bahan Baku",
  "/recipes": "Resep",
  "/menus": "Menu",
  "/inventory": "Stok",
  "/purchase-orders": "Purchase Order",
  "/settings": "Pengaturan",
};

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const title =
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ??
    "WarungERP";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-6">
      <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
            {user?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            {user?.email ?? ""}
          </span>
        </div>
      </div>
    </header>
  );
}
