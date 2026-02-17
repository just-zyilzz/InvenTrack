"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Edit, Package } from "lucide-react";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        sku: string;
        image: string | null;
        buyPrice: number;
        sellPrice: number;
        stock: number;
        minStock: number;
        unit: string;
        category: { name: string } | null;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const isLowStock = product.stock <= product.minStock;

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
            <div className="relative aspect-square overflow-hidden bg-muted">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                )}
                {isLowStock && (
                    <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
                        Stok Rendah
                    </Badge>
                )}
            </div>
            <CardContent className="p-4">
                <div className="mb-2">
                    {product.category && (
                        <Badge variant="secondary" className="text-xs mb-1">
                            {product.category.name}
                        </Badge>
                    )}
                    <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-lg font-bold text-primary">
                            {formatCurrency(product.sellPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Stok: {product.stock} {product.unit}
                        </p>
                    </div>
                    <Link href={`/products/${product.id}`}>
                        <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
