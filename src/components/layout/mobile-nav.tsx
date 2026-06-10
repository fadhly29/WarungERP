"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Carrot,
  BookOpen,
  ClipboardList,
  ShoppingCart,
  Package,
} from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingredients", label: "Bahan", icon: Carrot },
  { href: "/recipes", label: "Resep", icon: BookOpen },
  { href: "/menus", label: "Menu", icon: ClipboardList },
  { href: "/purchase-orders", label: "PO", icon: ShoppingCart },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/60 bg-white/95 backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all duration-200 cursor-pointer",
                isActive
                  ? "text-emerald-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                isActive
                  ? "bg-emerald-100"
                  : "bg-transparent"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
