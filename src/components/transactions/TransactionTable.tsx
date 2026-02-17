"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getCourierName, TRACKING_STATUSES } from "@/lib/couriers";
import { Package, Eye } from "lucide-react";
import TrackingTimeline from "./TrackingTimeline";

interface Transaction {
    id: string;
    type: string;
    totalAmount: number;
    notes: string | null;
    createdAt: string;
    createdBy: { name: string };
    trackingNumber?: string | null;
    courierCode?: string | null;
    trackingStatus?: string | null;
    trackingData?: any;
    lastTrackedAt?: string | null;
    items: {
        product: { name: string; sku: string };
        quantity: number;
        price: number;
        subtotal: number;
    }[];
}

interface TransactionTableProps {
    transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
    const [selectedTracking, setSelectedTracking] = useState<Transaction | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const showTrackingColumn = transactions.some((tx) => tx.trackingNumber);

    return (
        <>
            {/* Mobile View (Cards) */}
            <div className="block md:hidden space-y-4">
                {transactions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>Belum ada transaksi</p>
                    </div>
                ) : (
                    transactions.map((tx) => {
                        const statusInfo = tx.trackingStatus
                            ? TRACKING_STATUSES[tx.trackingStatus] || TRACKING_STATUSES.unknown
                            : null;

                        return (
                            <div key={tx.id} className="bg-card border rounded-lg p-4 space-y-3 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={tx.type === "SALE" ? "success" : "default"} className="text-[10px]">
                                                {tx.type === "SALE" ? "Jual" : "Beli"}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(tx.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </div>
                                        <div className="font-semibold text-lg">
                                            {formatCurrency(tx.totalAmount)}
                                        </div>
                                    </div>
                                    {showTrackingColumn && tx.trackingNumber && (
                                        <Badge variant="outline" className={`text-[10px] ${statusInfo?.color || ""}`}>
                                            {statusInfo?.label || "Pending"}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-1 pt-2 border-t">
                                    {tx.items.slice(0, 3).map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="truncate max-w-[60%]">{item.product.name}</span>
                                            <span className="text-muted-foreground">x{item.quantity}</span>
                                        </div>
                                    ))}
                                    {tx.items.length > 3 && (
                                        <div className="text-xs text-primary font-medium">
                                            +{tx.items.length - 3} item lainnya
                                        </div>
                                    )}
                                </div>

                                {showTrackingColumn && tx.trackingNumber && (
                                    <div className="pt-2 border-t flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium">{tx.trackingNumber}</span>
                                            <span className="text-[10px] text-muted-foreground">{getCourierName(tx.courierCode || "")}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs"
                                            onClick={() => setSelectedTracking(tx)}
                                        >
                                            <Package className="h-3 w-3 mr-1" />
                                            Lacak
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto rounded-md border">
                <Table className="table-fixed w-full">
                    <TableHeader>
                        <TableRow className="bg-muted/40">
                            <TableHead className="w-[140px]">Tanggal</TableHead>
                            <TableHead className="w-[90px]">Tipe</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="w-[130px] text-right">Total</TableHead>
                            {showTrackingColumn && <TableHead className="w-[200px]">Resi & Status</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={showTrackingColumn ? 5 : 4} className="text-center py-12 text-muted-foreground">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    Belum ada transaksi
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx) => {
                                const statusInfo = tx.trackingStatus
                                    ? TRACKING_STATUSES[tx.trackingStatus] || TRACKING_STATUSES.unknown
                                    : null;
                                const isExpanded = expandedRow === tx.id;

                                return (
                                    <TableRow
                                        key={tx.id}
                                        className="group hover:bg-muted/30 transition-colors"
                                    >
                                        {/* Tanggal */}
                                        <TableCell className="py-3">
                                            <span className="text-sm font-medium">
                                                {new Date(tx.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                            <br />
                                            <span className="text-[11px] text-muted-foreground">
                                                {new Date(tx.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </TableCell>

                                        {/* Tipe */}
                                        <TableCell className="py-3">
                                            <Badge variant={tx.type === "SALE" ? "success" : "default"} className="text-[11px]">
                                                {tx.type === "SALE" ? "Jual" : "Beli"}
                                            </Badge>
                                        </TableCell>

                                        {/* Items — compact with expand */}
                                        <TableCell className="py-3">
                                            <div className="space-y-0.5">
                                                {(isExpanded ? tx.items : tx.items.slice(0, 2)).map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between gap-2 text-sm">
                                                        <span className="truncate">{item.product.name}</span>
                                                        <span className="shrink-0 text-muted-foreground text-xs">
                                                            x{item.quantity} @{formatCurrency(item.price)}
                                                        </span>
                                                    </div>
                                                ))}
                                                {tx.items.length > 2 && !isExpanded && (
                                                    <button
                                                        onClick={() => setExpandedRow(tx.id)}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        +{tx.items.length - 2} item lainnya
                                                    </button>
                                                )}
                                                {isExpanded && tx.items.length > 2 && (
                                                    <button
                                                        onClick={() => setExpandedRow(null)}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        Tutup
                                                    </button>
                                                )}
                                            </div>

                                        </TableCell>

                                        {/* Total */}
                                        <TableCell className="py-3 text-right">
                                            <span className={`font-semibold text-sm ${tx.type === "SALE" ? "text-emerald-600" : "text-rose-600"}`}>
                                                {formatCurrency(tx.totalAmount)}
                                            </span>
                                        </TableCell>

                                        {/* Resi & Status */}
                                        {showTrackingColumn && (
                                            <TableCell className="py-3">
                                                {tx.trackingNumber ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-auto p-1.5 gap-1.5 font-normal w-full justify-start"
                                                        onClick={() => setSelectedTracking(tx)}
                                                    >
                                                        <Package className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                                                        <span className="flex flex-col items-start min-w-0 text-left">
                                                            <span className="text-xs font-medium truncate max-w-[140px]" title={tx.trackingNumber || ""}>
                                                                {tx.trackingNumber}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {getCourierName(tx.courierCode || "")}
                                                            </span>
                                                            {statusInfo && (
                                                                <Badge variant="outline" className={`text-[10px] h-4 px-1 mt-0.5 ${statusInfo.color}`}>
                                                                    {statusInfo.label}
                                                                </Badge>
                                                            )}
                                                        </span>
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Tanpa resi</span>
                                                )}
                                            </TableCell>
                                        )}

                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Tracking dialog */}
            {selectedTracking && selectedTracking.trackingNumber && selectedTracking.courierCode && (
                <TrackingTimeline
                    transactionId={selectedTracking.id}
                    trackingNumber={selectedTracking.trackingNumber}
                    courierCode={selectedTracking.courierCode}
                    trackingStatus={selectedTracking.trackingStatus || "pending"}
                    trackingData={selectedTracking.trackingData}
                    lastTrackedAt={selectedTracking.lastTrackedAt || null}
                    onClose={() => setSelectedTracking(null)}
                />
            )}
        </>
    );
}
