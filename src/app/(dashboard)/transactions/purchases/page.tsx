"use client";

import { useState, useEffect } from "react";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionTable from "@/components/transactions/TransactionTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Plus, FileSpreadsheet, FileText } from "lucide-react";
import { exportTransactionsPdf } from "@/lib/exportPdf";

export default function PurchasesPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await fetch("/api/transactions?type=PURCHASE");
            const json = await res.json();
            if (json.success) setTransactions(json.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExcel = async () => {
        const res = await fetch("/api/export/sales?type=PURCHASE");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Laporan_Pembelian_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleDownloadPdf = () => {
        exportTransactionsPdf(transactions, "PURCHASE");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pembelian</h1>
                    <p className="text-muted-foreground">Kelola transaksi pembelian</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleDownloadExcel} size="sm" className="gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        Excel
                    </Button>
                    <Button variant="outline" onClick={handleDownloadPdf} size="sm" className="gap-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        PDF
                    </Button>
                    <Button onClick={() => setShowForm(!showForm)} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        {showForm ? "Lihat Daftar" : "Transaksi Baru"}
                    </Button>
                </div>
            </div>

            {showForm ? (
                <TransactionForm type="PURCHASE" />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Riwayat Pembelian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                                ))}
                            </div>
                        ) : (
                            <TransactionTable transactions={transactions} />
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
