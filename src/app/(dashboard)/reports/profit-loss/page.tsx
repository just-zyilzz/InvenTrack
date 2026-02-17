"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { exportProfitLossPdf } from "@/lib/exportPdf";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, FileSpreadsheet, FileText } from "lucide-react";

interface ProfitLossData {
    totalRevenue: number;
    totalCost: number;
    profit: number;
    totalSalesCount: number;
    totalPurchaseCount: number;
    profitMargin: number | string;
}

export default function ProfitLossPage() {
    const [data, setData] = useState<ProfitLossData | null>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ type: "profit-loss" });
            if (startDate) params.set("startDate", startDate);
            if (endDate) params.set("endDate", endDate);

            const res = await fetch(`/api/reports?${params}`);
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExcel = async () => {
        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        const res = await fetch(`/api/export/profit-loss?${params}`);
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Laporan_Laba_Rugi_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleDownloadPdf = () => {
        if (data) {
            exportProfitLossPdf(data, startDate || undefined, endDate || undefined);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Laporan Laba Rugi</h1>
                    <p className="text-muted-foreground">Analisis pendapatan dan pengeluaran bisnis</p>
                </div>
                {data && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownloadExcel} size="sm" className="gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                            Excel
                        </Button>
                        <Button variant="outline" onClick={handleDownloadPdf} size="sm" className="gap-2">
                            <FileText className="h-4 w-4 text-red-600" />
                            PDF
                        </Button>
                    </div>
                )}
            </div>

            {/* Date Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-2">
                            <Label>Dari Tanggal</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Sampai Tanggal</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <Button onClick={fetchReport}>Filter</Button>
                        <Button variant="outline" onClick={() => { setStartDate(""); setEndDate(""); setTimeout(fetchReport, 100); }}>
                            Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="pt-6"><div className="h-20 rounded bg-muted" /></CardContent>
                        </Card>
                    ))}
                </div>
            ) : data ? (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-l-4 border-l-emerald-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                    Total Pendapatan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(data.totalRevenue)}</div>
                                <p className="text-xs text-muted-foreground mt-1">{data.totalSalesCount} transaksi penjualan</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-rose-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <TrendingDown className="h-4 w-4 text-rose-600" />
                                    Total Pengeluaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-rose-600">{formatCurrency(data.totalCost)}</div>
                                <p className="text-xs text-muted-foreground mt-1">{data.totalPurchaseCount} transaksi pembelian</p>
                            </CardContent>
                        </Card>

                        <Card className={`border-l-4 ${data.profit >= 0 ? "border-l-blue-500" : "border-l-red-500"}`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    {data.profit >= 0 ? "Laba Bersih" : "Rugi Bersih"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${data.profit >= 0 ? "text-blue-600" : "text-red-600"}`}>
                                    {formatCurrency(Math.abs(data.profit))}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={data.profit >= 0 ? "success" : "destructive"} className="text-xs">
                                        Margin: {data.profitMargin}%
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Ringkasan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b">
                                    <span className="font-medium">Total Pendapatan (Penjualan)</span>
                                    <span className="text-emerald-600 font-semibold">{formatCurrency(data.totalRevenue)}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b">
                                    <span className="font-medium">Total Pengeluaran (Pembelian)</span>
                                    <span className="text-rose-600 font-semibold">({formatCurrency(data.totalCost)})</span>
                                </div>
                                <div className="flex items-center justify-between py-3 bg-muted/50 rounded-lg px-4">
                                    <span className="text-lg font-bold">{data.profit >= 0 ? "Laba Bersih" : "Rugi Bersih"}</span>
                                    <span className={`text-lg font-bold ${data.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                        {formatCurrency(Math.abs(data.profit))}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : null}
        </div>
    );
}
