"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface Product {
    id: string;
    name: string;
    sku: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    minStock: number;
    unit: string;
    category: { name: string } | null;
}

interface ProductTableProps {
    products: Product[];
    onDelete: (id: string) => Promise<any>;
}

export default function ProductTable({ products, onDelete }: ProductTableProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        await onDelete(deleteId);
        setDeleting(false);
        setDeleteId(null);
    };

    return (
        <>
            {/* Mobile View (Cards) */}
            <div className="block md:hidden space-y-4">
                {products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card">
                        <p>Belum ada produk</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product.id} className="bg-card border rounded-lg p-4 space-y-3 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold">{product.name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{product.sku}</code>
                                        {product.category && (
                                            <Badge variant="secondary" className="text-[10px] h-5">
                                                {product.category.name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                                        <Link href={`/products/${product.id}`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setDeleteId(product.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                                <div>
                                    <div className="text-muted-foreground text-xs">Harga Beli</div>
                                    <div className="font-medium">{formatCurrency(product.buyPrice)}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground text-xs">Harga Jual</div>
                                    <div className="font-medium text-emerald-600">{formatCurrency(product.sellPrice)}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground text-xs">Stok</div>
                                    <Badge variant={product.stock <= product.minStock ? "destructive" : "success"} className="mt-0.5">
                                        {product.stock} {product.unit}
                                    </Badge>
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
                            <TableHead>Produk</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead className="text-right">Harga Beli</TableHead>
                            <TableHead className="text-right">Harga Jual</TableHead>
                            <TableHead className="text-center">Stok</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Belum ada produk
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{product.sku}</code>
                                    </TableCell>
                                    <TableCell>
                                        {product.category ? (
                                            <Badge variant="secondary">{product.category.name}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(product.buyPrice)}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(product.sellPrice)}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={product.stock <= product.minStock ? "destructive" : "success"}>
                                            {product.stock} {product.unit}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/products/${product.id}`}>
                                                    <Edit className="h-3 w-3" />
                                                </Link>
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(product.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Produk</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? "Menghapus..." : "Hapus"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
