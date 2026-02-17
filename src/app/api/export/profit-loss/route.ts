import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const dateFilter: any = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        const where = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

        // Get aggregated data
        const [salesAgg, purchasesAgg] = await Promise.all([
            prisma.transaction.aggregate({
                where: { ...where, type: "SALE" },
                _sum: { totalAmount: true },
                _count: true,
            }),
            prisma.transaction.aggregate({
                where: { ...where, type: "PURCHASE" },
                _sum: { totalAmount: true },
                _count: true,
            }),
        ]);

        // Get detailed transactions
        const [salesDetail, purchasesDetail] = await Promise.all([
            prisma.transaction.findMany({
                where: { ...where, type: "SALE" },
                include: {
                    items: { include: { product: { select: { name: true, sku: true } } } },
                    createdBy: { select: { name: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.transaction.findMany({
                where: { ...where, type: "PURCHASE" },
                include: {
                    items: { include: { product: { select: { name: true, sku: true } } } },
                    createdBy: { select: { name: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const totalRevenue = salesAgg._sum.totalAmount || 0;
        const totalCost = purchasesAgg._sum.totalAmount || 0;
        const profit = totalRevenue - totalCost;
        const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : "0";

        // Build workbook
        const wb = XLSX.utils.book_new();

        // Sheet 1: Ringkasan
        const summaryData = [
            ["LAPORAN LABA RUGI"],
            [startDate && endDate ? `Periode: ${startDate} s/d ${endDate}` : "Periode: Semua"],
            [],
            ["Keterangan", "Jumlah (Rp)"],
            ["Total Pendapatan (Penjualan)", totalRevenue],
            [`  Jumlah Transaksi Penjualan`, salesAgg._count],
            [],
            ["Total Pengeluaran (Pembelian)", totalCost],
            [`  Jumlah Transaksi Pembelian`, purchasesAgg._count],
            [],
            [profit >= 0 ? "LABA BERSIH" : "RUGI BERSIH", Math.abs(profit)],
            ["Margin (%)", `${margin}%`],
        ];
        const wsRingkasan = XLSX.utils.aoa_to_sheet(summaryData);
        wsRingkasan["!cols"] = [{ wch: 35 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, wsRingkasan, "Ringkasan");

        // Sheet 2: Detail Penjualan
        const salesRows = [["Tanggal", "Produk", "SKU", "Jumlah", "Harga", "Subtotal", "Total Transaksi", "Catatan", "Oleh"]];
        for (const tx of salesDetail) {
            for (const item of tx.items) {
                salesRows.push([
                    new Date(tx.createdAt).toLocaleDateString("id-ID"),
                    item.product.name,
                    item.product.sku,
                    item.quantity as any,
                    item.price as any,
                    item.subtotal as any,
                    tx.totalAmount as any,
                    tx.notes || "-",
                    tx.createdBy.name,
                ]);
            }
        }
        const wsSales = XLSX.utils.aoa_to_sheet(salesRows);
        wsSales["!cols"] = [{ wch: 14 }, { wch: 25 }, { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, wsSales, "Detail Penjualan");

        // Sheet 3: Detail Pembelian
        const purchaseRows = [["Tanggal", "Produk", "SKU", "Jumlah", "Harga", "Subtotal", "Total Transaksi", "Catatan", "Oleh"]];
        for (const tx of purchasesDetail) {
            for (const item of tx.items) {
                purchaseRows.push([
                    new Date(tx.createdAt).toLocaleDateString("id-ID"),
                    item.product.name,
                    item.product.sku,
                    item.quantity as any,
                    item.price as any,
                    item.subtotal as any,
                    tx.totalAmount as any,
                    tx.notes || "-",
                    tx.createdBy.name,
                ]);
            }
        }
        const wsPurchases = XLSX.utils.aoa_to_sheet(purchaseRows);
        wsPurchases["!cols"] = [{ wch: 14 }, { wch: 25 }, { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, wsPurchases, "Detail Pembelian");

        // Generate buffer
        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        const dateStr = new Date().toISOString().split("T")[0];
        return new Response(buf, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="Laporan_Laba_Rugi_${dateStr}.xlsx"`,
            },
        });
    } catch (error) {
        console.error("Export profit-loss error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
