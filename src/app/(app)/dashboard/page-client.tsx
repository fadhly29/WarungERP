"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent } from "@/lib/format";
import { TrendingUp, DollarSign, Percent, Star, ArrowUpRight, Package, ShoppingBasket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

interface DashboardData {
  revenue: number;
  profit: number;
  margin: number;
  best_sellers: { name: string; qty: number }[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function DashboardPage() {
  const supabase = createClient();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardData> => {
      const { data: sales } = await supabase
        .from("sales_reports")
        .select("revenue, profit, margin_percent")
        .order("date", { ascending: false })
        .limit(100);

      const totalRevenue =
        sales?.reduce((sum: number, s: { revenue: number }) => sum + Number(s.revenue), 0) ?? 0;
      const totalProfit =
        sales?.reduce((sum: number, s: { profit: number }) => sum + Number(s.profit), 0) ?? 0;
      const avgMargin =
        sales && sales.length > 0
          ? sales.reduce((sum: number, s: { margin_percent: number }) => sum + Number(s.margin_percent), 0) /
            sales.length
          : 0;

      const { data: bestSellers } = await supabase
        .from("sales_reports")
        .select("menu_name, qty")
        .order("qty", { ascending: false })
        .limit(5);

      return {
        revenue: totalRevenue,
        profit: totalProfit,
        margin: avgMargin,
        best_sellers:
          bestSellers?.map((s: { menu_name: string; qty: number }) => ({
            name: s.menu_name,
            qty: s.qty,
          })) ?? [],
      };
    },
  });

  const cards = [
    {
      title: "Pendapatan",
      value: formatCurrency(data?.revenue ?? 0),
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/20",
      bgLight: "bg-emerald-50",
    },
    {
      title: "Profit",
      value: formatCurrency(data?.profit ?? 0),
      icon: TrendingUp,
      gradient: "from-blue-500 to-indigo-500",
      shadowColor: "shadow-blue-500/20",
      bgLight: "bg-blue-50",
    },
    {
      title: "Margin Rata-Rata",
      value: formatPercent(data?.margin ?? 0),
      icon: Percent,
      gradient: "from-purple-500 to-pink-500",
      shadowColor: "shadow-purple-500/20",
      bgLight: "bg-purple-50",
    },
    {
      title: "Best Seller",
      value: data?.best_sellers?.[0]?.name ?? "-",
      icon: Star,
      gradient: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/20",
      bgLight: "bg-amber-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card rounded-2xl">
              <CardHeader>
                <Skeleton className="h-4 w-24 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {cards.map((card, index) => (
          <motion.div key={card.title} variants={cardVariants}>
            <Card className="glass-card group rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {card.title}
                </CardTitle>
                <div className={`rounded-xl p-2 bg-gradient-to-br ${card.gradient} ${card.shadowColor} shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    {card.value}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {data?.best_sellers && data.best_sellers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        >
          <Card className="glass-card rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl p-2 bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                    <ShoppingBasket className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Menu Terlaris
                  </CardTitle>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Top 5 menu
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.best_sellers.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors duration-150">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {item.qty}
                      </span>
                      <span className="text-xs text-slate-400">terjual</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
