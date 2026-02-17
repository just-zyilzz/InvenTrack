"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Boxes, AlertTriangle, PackageX, DollarSign } from "lucide-react";

interface StockData {
    products: {
        id: string;
        name: string;
        sku: string;
        stock: number;
        minStock: number;
        buyPrice: number;
        unit: string;
        category: { name: string } | null;
    }[];
    totalValue: number;
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
}

export default function StockReportPage() {
    const [data, setData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            const res = await fetch("/api/reports?type=stock");
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Laporan Stok</h1>
                <div className="grid gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="pt-6"><div className="h-16 rounded bg-muted" /></CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Laporan Stok</h1>
                <p className="text-muted-foreground">Pantau stok barang dan nilai inventori</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Boxes className="h-4 w-4 text-blue-600" />
                            Total Produk
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.totalProducts || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            Nilai Inventori
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(data?.totalValue || 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            Stok Menipis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{data?.lowStockCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <PackageX className="h-4 w-4 text-red-600" />
                            Stok Habis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{data?.outOfStockCount || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Stock Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Detail Stok Produk</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Mobile View (Cards) */}
                    <div className="block md:hidden space-y-4">
                        {data?.products.map((product) => {
                            const stockValue = product.stock * product.buyPrice;
                            const isOut = product.stock === 0;
                            const isLow = product.stock > 0 && product.stock <= product.minStock;

                            return (
                                <div key={product.id} className="rounded-lg border p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium">{product.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{product.sku}</code>
                                                <Badge variant={isOut ? "destructive" : isLow ? "warning" : "success"} className="text-[10px] h-5">
                                                    {isOut ? "Habis" : isLow ? "Menipis" : "Aman"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-muted-foreground">Stok</div>
                                            <div className="font-bold">{product.stock} {product.unit}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                                        <div>
                                            <div className="text-muted-foreground text-xs">Min. Stok</div>
                                            <div>{product.minStock} {product.unit}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground text-xs">Nilai Stok</div>
                                            <div className="font-medium">{formatCurrency(stockValue)}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead className="text-center">Stok</TableHead>
                                    <TableHead className="text-center">Min. Stok</TableHead>
                                    <TableHead className="text-right">Harga Beli</TableHead>
                                    <TableHead className="text-right">Nilai Stok</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.products.map((product) => {
                                    const stockValue = product.stock * product.buyPrice;
                                    const isOut = product.stock === 0;
                                    const isLow = product.stock > 0 && product.stock <= product.minStock;

                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>
                                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{product.sku}</code>
                                            </TableCell>
                                            <TableCell>{product.category?.name || "-"}</TableCell>
                                            <TableCell className="text-center font-medium">
                                                {product.stock} {product.unit}
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">{product.minStock}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(product.buyPrice)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(stockValue)}</TableCell>
                                            <TableCell>
                                                {isOut ? (
                                                    <Badge variant="destructive">Habis</Badge>
                                                ) : isLow ? (
                                                    <Badge variant="warning">Menipis</Badge>
                                                ) : (
                                                    <Badge variant="success">Aman</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
