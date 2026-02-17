"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductWithCategory, ApiResponse, PaginatedResponse } from "@/types";

export function useProducts(initialPage = 1, initialLimit = 10) {
    const [products, setProducts] = useState<ProductWithCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(initialPage);
    const [limit] = useState(initialLimit);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (search) params.set("search", search);
            if (category) params.set("category", category);

            const res = await fetch(`/api/products?${params}`);
            const json: ApiResponse<PaginatedResponse<ProductWithCategory>> =
                await res.json();

            if (json.success && json.data) {
                setProducts(json.data.data);
                setTotal(json.data.total);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, category]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const deleteProduct = async (id: string) => {
        try {
            const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
            const json: ApiResponse = await res.json();
            if (json.success) {
                fetchProducts();
            }
            return json;
        } catch (error) {
            return { success: false, error: "Gagal menghapus produk" };
        }
    };

    return {
        products,
        loading,
        total,
        page,
        setPage,
        search,
        setSearch,
        category,
        setCategory,
        totalPages: Math.ceil(total / limit),
        refreshProducts: fetchProducts,
        deleteProduct,
    };
}
