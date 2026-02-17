"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { CreditCard } from "lucide-react";

interface Debt {
    id: string;
    type: string;
    contactName: string;
    contactPhone: string | null;
    amount: number;
    paidAmount: number;
    dueDate: string | null;
    status: string;
    createdAt: string;
}

interface DebtTableProps {
    debts: Debt[];
    onPayment: (id: string, amount: number) => Promise<any>;
}

const statusColors: Record<string, string> = {
    PENDING: "warning",
    PARTIAL: "default",
    PAID: "success",
    OVERDUE: "destructive",
};

const statusLabels: Record<string, string> = {
    PENDING: "Belum Bayar",
    PARTIAL: "Sebagian",
    PAID: "Lunas",
    OVERDUE: "Jatuh Tempo",
};

export default function DebtTable({ debts, onPayment }: DebtTableProps) {
    const { toast } = useToast();
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paying, setPaying] = useState(false);

    const selectedDebt = debts.find((d) => d.id === paymentId);
    const remaining = selectedDebt ? selectedDebt.amount - selectedDebt.paidAmount : 0;

    const handlePayment = async () => {
        if (!paymentId || !paymentAmount) return;
        const amount = parseFloat(paymentAmount);
        if (amount <= 0 || amount > remaining) {
            toast({ title: "Jumlah pembayaran tidak valid", variant: "destructive" });
            return;
        }
        setPaying(true);
        const result = await onPayment(paymentId, amount);
        if (result.success) {
            toast({ title: "Pembayaran berhasil dicatat" });
        }
        setPaying(false);
        setPaymentId(null);
        setPaymentAmount("");
    };

    return (
        <>
            {/* Mobile View (Cards) */}
            <div className="block md:hidden space-y-4">
                {debts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card">
                        <p>Tidak ada data</p>
                    </div>
                ) : (
                    debts.map((debt) => (
                        <div key={debt.id} className="bg-card border rounded-lg p-4 space-y-3 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium">{debt.contactName}</div>
                                    {debt.contactPhone && (
                                        <div className="text-xs text-muted-foreground">{debt.contactPhone}</div>
                                    )}
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {formatDate(debt.createdAt)}
                                    </div>
                                </div>
                                <Badge variant={statusColors[debt.status] as any} className="text-[10px] h-5">
                                    {statusLabels[debt.status] || debt.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                                <div>
                                    <div className="text-muted-foreground text-xs">Total</div>
                                    <div className="font-medium">{formatCurrency(debt.amount)}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground text-xs">Dibayar</div>
                                    <div className="font-medium text-emerald-600">{formatCurrency(debt.paidAmount)}</div>
                                </div>
                                <div className="col-span-2 pt-1">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-muted-foreground text-xs">Sisa Tagihan</div>
                                            <div className="font-bold text-rose-600">
                                                {formatCurrency(debt.amount - debt.paidAmount)}
                                            </div>
                                        </div>
                                        {debt.status !== "PAID" && (
                                            <Button size="sm" variant="outline" onClick={() => setPaymentId(debt.id)} className="h-8 text-xs">
                                                <CreditCard className="h-3 w-3 mr-1" />
                                                Bayar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kontak</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Dibayar</TableHead>
                            <TableHead className="text-right">Sisa</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {debts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Tidak ada data
                                </TableCell>
                            </TableRow>
                        ) : (
                            debts.map((debt) => (
                                <TableRow key={debt.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{debt.contactName}</p>
                                            {debt.contactPhone && (
                                                <p className="text-xs text-muted-foreground">{debt.contactPhone}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(debt.amount)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(debt.paidAmount)}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(debt.amount - debt.paidAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusColors[debt.status] as any}>
                                            {statusLabels[debt.status] || debt.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">{formatDate(debt.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        {debt.status !== "PAID" && (
                                            <Button size="sm" variant="outline" onClick={() => setPaymentId(debt.id)}>
                                                <CreditCard className="h-3 w-3 mr-1" />
                                                Bayar
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!paymentId} onOpenChange={() => setPaymentId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Catat Pembayaran</DialogTitle>
                        <DialogDescription>
                            Sisa yang harus dibayar: {formatCurrency(remaining)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Jumlah Pembayaran</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                max={remaining}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentId(null)}>Batal</Button>
                        <Button onClick={handlePayment} disabled={paying}>
                            {paying ? "Memproses..." : "Simpan Pembayaran"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
