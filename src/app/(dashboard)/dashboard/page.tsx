"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Package,
    AlertTriangle,
    ShoppingCart,
    Truck,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ArrowUpRight,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface DashboardData {
    totalProducts: number;
    lowStockProducts: number;
    totalSales: number;
    totalPurchases: number;
    totalRevenue: number;
    totalExpenses: number;
    recentTransactions: any[];
    monthlySales: { month: string; total: number }[];
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await fetch("/api/reports?type=dashboard");
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-2">
                                <div className="h-4 w-24 rounded bg-muted" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-32 rounded bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: "Total Produk",
            value: data?.totalProducts || 0,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            description: "Produk terdaftar",
        },
        {
            title: "Stok Menipis",
            value: data?.lowStockProducts || 0,
            icon: AlertTriangle,
            color: "text-amber-600",
            bgColor: "bg-amber-100",
            description: "Perlu restock",
        },
        {
            title: "Total Penjualan",
            value: formatCurrency(data?.totalRevenue || 0),
            icon: TrendingUp,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
            description: `${data?.totalSales || 0} transaksi`,
        },
        {
            title: "Total Pembelian",
            value: formatCurrency(data?.totalExpenses || 0),
            icon: TrendingDown,
            color: "text-rose-600",
            bgColor: "bg-rose-100",
            description: `${data?.totalPurchases || 0} transaksi`,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
                <Badge variant="outline" className="text-xs w-fit">
                    Data Real-time
                </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-primary/5" />
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Sales Chart */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="h-5 w-5" />
                            Grafik Penjualan Bulanan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.monthlySales || []}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="month" className="text-xs" />
                                    <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value), "Penjualan"]}
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowUpRight className="h-5 w-5" />
                            Transaksi Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                            <div className="space-y-4">
                                {data.recentTransactions.slice(0, 5).map((tx: any) => (
                                    <div
                                        key={tx.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`rounded-full p-2 shrink-0 ${tx.type === "SALE"
                                                    ? "bg-emerald-100 text-emerald-600"
                                                    : "bg-blue-100 text-blue-600"
                                                    }`}
                                            >
                                                {tx.type === "SALE" ? (
                                                    <ShoppingCart className="h-4 w-4" />
                                                ) : (
                                                    <Truck className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {tx.type === "SALE" ? "Penjualan" : "Pembelian"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateTime(tx.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-sm font-semibold sm:text-right ${tx.type === "SALE" ? "text-emerald-600" : "text-blue-600"
                                                }`}
                                        >
                                            {tx.type === "SALE" ? "+" : "-"}
                                            {formatCurrency(tx.totalAmount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <DollarSign className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Belum ada transaksi
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
