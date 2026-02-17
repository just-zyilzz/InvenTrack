"use client";

import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import ProductTable from "@/components/products/ProductTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Package } from "lucide-react";

export default function ProductsPage() {
    const {
        products,
        loading,
        search,
        setSearch,
        page,
        setPage,
        totalPages,
        deleteProduct,
    } = useProducts();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Produk</h1>
                    <p className="text-muted-foreground">Kelola daftar produk Anda</p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/products/add">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Produk
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Daftar Produk
                        </CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari produk..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <ProductTable products={products} onDelete={deleteProduct} />
                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Halaman {page} dari {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page <= 1}
                                            onClick={() => setPage(page - 1)}
                                        >
                                            Sebelumnya
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page >= totalPages}
                                            onClick={() => setPage(page + 1)}
                                        >
                                            Selanjutnya
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
