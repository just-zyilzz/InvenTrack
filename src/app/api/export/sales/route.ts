import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TransactionType } from "@prisma/client";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = (searchParams.get("type") || "SALE") as TransactionType;

        const transactions = await prisma.transaction.findMany({
            where: { type },
            include: {
                items: { include: { product: { select: { name: true, sku: true } } } },
                createdBy: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const wb = XLSX.utils.book_new();
        const label = type === "SALE" ? "Penjualan" : "Pembelian";

        const rows: any[][] = [
            [`LAPORAN ${label.toUpperCase()}`],
            [`Tanggal Export: ${new Date().toLocaleDateString("id-ID")}`],
            [],
            ["No", "Tanggal", "Produk", "SKU", "Jumlah", "Harga", "Subtotal", "Total Transaksi", "Catatan", "Oleh"],
        ];

        let no = 1;
        for (const tx of transactions) {
            for (const item of tx.items) {
                rows.push([
                    no++,
                    new Date(tx.createdAt).toLocaleDateString("id-ID"),
                    item.product.name,
                    item.product.sku,
                    item.quantity,
                    item.price,
                    item.subtotal,
                    tx.totalAmount,
                    tx.notes || "-",
                    tx.createdBy.name,
                ]);
            }
        }

        // Add total row
        const totalAmount = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
        rows.push([]);
        rows.push(["", "", "", "", "", "", "TOTAL", totalAmount, "", ""]);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws["!cols"] = [
            { wch: 5 }, { wch: 14 }, { wch: 25 }, { wch: 12 },
            { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 18 },
            { wch: 20 }, { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(wb, ws, label);

        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
        const dateStr = new Date().toISOString().split("T")[0];

        return new Response(buf, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="Laporan_${label}_${dateStr}.xlsx"`,
            },
        });
    } catch (error) {
        console.error("Export sales error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
