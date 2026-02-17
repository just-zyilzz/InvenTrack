"use client";

import { useState, useEffect } from "react";
import DebtTable from "@/components/debts/DebtTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft } from "lucide-react";

export default function PayablesPage() {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDebts();
    }, []);

    const fetchDebts = async () => {
        try {
            const res = await fetch("/api/debts?type=PAYABLE");
            const json = await res.json();
            if (json.success) setDebts(json.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (id: string, amount: number) => {
        try {
            const res = await fetch("/api/debts", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, amount }),
            });
            const json = await res.json();
            if (json.success) fetchDebts();
            return json;
        } catch {
            return { success: false };
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Hutang (Payables)</h1>
                <p className="text-muted-foreground">Daftar hutang yang harus dibayar ke supplier</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowDownLeft className="h-5 w-5 text-rose-600" />
                        Daftar Hutang
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                            ))}
                        </div>
                    ) : (
                        <DebtTable debts={debts} onPayment={handlePayment} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
