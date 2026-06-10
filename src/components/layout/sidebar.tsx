"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  Carrot,
  BookOpen,
  ClipboardList,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  ChevronLeft,
  ChefHat,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingredients", label: "Bahan Baku", icon: Carrot },
  { href: "/recipes", label: "Resep", icon: BookOpen },
  { href: "/menus", label: "Menu", icon: ClipboardList },
  { href: "/inventory", label: "Stok", icon: Package },
  { href: "/purchase-orders", label: "Pre Order", icon: ShoppingCart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    signOut();
    router.push("/auth/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white/95 backdrop-blur-xl border-r border-slate-200/60 flex flex-col transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div className="flex h-16 items-center border-b border-slate-200/60 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm text-gradient">WarungERP</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
            <ChefHat className="h-4 w-4 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-7 w-7 rounded-lg hover:bg-slate-100"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer group",
                isActive
                  ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                "h-4 w-4 shrink-0 transition-colors duration-200",
                isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/60 p-2 space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 cursor-pointer group",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Pengaturan" : undefined}
        >
          <Settings className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
          {!collapsed && <span>Pengaturan</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 cursor-pointer group",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Keluar" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-red-500 transition-colors duration-200" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
