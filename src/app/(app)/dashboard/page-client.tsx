"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent } from "@/lib/format";
import { TrendingUp, DollarSign, Percent, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface DashboardData {
  revenue: number;
  profit: number;
  margin: number;
  best_sellers: { name: string; qty: number }[];
}

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
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      title: "Profit",
      value: formatCurrency(data?.profit ?? 0),
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Margin Rata-Rata",
      value: formatPercent(data?.margin ?? 0),
      icon: Percent,
      color: "text-purple-600 bg-purple-100",
    },
    {
      title: "Best Seller",
      value: data?.best_sellers?.[0]?.name ?? "-",
      icon: Star,
      color: "text-amber-600 bg-amber-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {card.title}
              </CardTitle>
              <div className={`rounded-md p-1.5 ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.best_sellers && data.best_sellers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menu Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.best_sellers.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-400">
                      #{i + 1}
                    </span>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {item.qty} terjual
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
