"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/products/ProductForm";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${params.id}`);
            const json = await res.json();
            if (json.success) {
                setProduct(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch product:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold">Produk tidak ditemukan</h2>
                <p className="text-muted-foreground">Produk yang Anda cari tidak ada atau telah dihapus.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Produk</h1>
                <p className="text-muted-foreground">Perbarui informasi produk</p>
            </div>
            <ProductForm initialData={product} isEditing />
        </div>
    );
}
