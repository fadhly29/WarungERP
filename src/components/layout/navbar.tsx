"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { Bell, Search } from "lucide-react";

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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-6">
      <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      <div className="ml-auto flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200 cursor-pointer">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-1.5 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-sm">
            {user?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:inline">
            {user?.email ?? ""}
          </span>
        </div>
      </div>
    </header>
  );
}
