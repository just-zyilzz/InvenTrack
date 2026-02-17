import { z } from "zod";

export const transactionItemSchema = z.object({
    productId: z.string().min(1, "Produk harus dipilih"),
    quantity: z
        .number({ invalid_type_error: "Jumlah harus berupa angka" })
        .int("Jumlah harus bilangan bulat")
        .min(1, "Jumlah minimal 1"),
    price: z
        .number({ invalid_type_error: "Harga harus berupa angka" })
        .min(0, "Harga tidak boleh negatif"),
});

export const transactionSchema = z.object({
    type: z.enum(["SALE", "PURCHASE"], {
        required_error: "Tipe transaksi harus dipilih",
    }),
    items: z
        .array(transactionItemSchema)
        .min(1, "Minimal 1 item dalam transaksi"),
    notes: z.string().optional(),
    createDebt: z.boolean().optional(),
    debtContactName: z.string().optional(),
    debtContactPhone: z.string().optional(),
    debtDueDate: z.string().optional(),
});

export const debtPaymentSchema = z.object({
    amount: z
        .number({ invalid_type_error: "Jumlah pembayaran harus berupa angka" })
        .min(1, "Jumlah pembayaran minimal 1"),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionItemInput = z.infer<typeof transactionItemSchema>;
export type DebtPaymentInput = z.infer<typeof debtPaymentSchema>;
