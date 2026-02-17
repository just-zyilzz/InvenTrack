import { z } from "zod";

export const productSchema = z.object({
    name: z
        .string()
        .min(1, "Nama produk harus diisi")
        .min(2, "Nama produk minimal 2 karakter"),
    sku: z
        .string()
        .min(1, "SKU harus diisi")
        .regex(/^[A-Z0-9-]+$/, "SKU hanya boleh berisi huruf kapital, angka, dan tanda hubung"),
    description: z.string().optional(),
    buyPrice: z
        .number({ invalid_type_error: "Harga beli harus berupa angka" })
        .min(0, "Harga beli tidak boleh negatif"),
    sellPrice: z
        .number({ invalid_type_error: "Harga jual harus berupa angka" })
        .min(0, "Harga jual tidak boleh negatif"),
    stock: z
        .number({ invalid_type_error: "Stok harus berupa angka" })
        .int("Stok harus bilangan bulat")
        .min(0, "Stok tidak boleh negatif"),
    minStock: z
        .number({ invalid_type_error: "Minimal stok harus berupa angka" })
        .int("Minimal stok harus bilangan bulat")
        .min(0, "Minimal stok tidak boleh negatif"),
    unit: z.string().min(1, "Satuan harus diisi"),
    categoryId: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
