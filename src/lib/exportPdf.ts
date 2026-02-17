// Client-side PDF export utilities

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ProfitLossData {
    totalRevenue: number;
    totalCost: number;
    profit: number;
    totalSalesCount: number;
    totalPurchaseCount: number;
    profitMargin: number | string;
}

interface Transaction {
    id: string;
    type: string;
    totalAmount: number;
    notes: string | null;
    createdAt: string;
    createdBy: { name: string };
    items: {
        product: { name: string; sku: string };
        quantity: number;
        price: number;
        subtotal: number;
    }[];
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatTanggal(date: string | Date): string {
    return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export function exportProfitLossPdf(
    data: ProfitLossData,
    startDate?: string,
    endDate?: string
) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN LABA RUGI", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const periode = startDate && endDate
        ? `Periode: ${formatTanggal(startDate)} s/d ${formatTanggal(endDate)}`
        : "Periode: Semua";
    doc.text(periode, 105, 28, { align: "center" });
    doc.text(`Dicetak: ${formatTanggal(new Date())}`, 105, 34, { align: "center" });

    // Summary table
    autoTable(doc, {
        startY: 42,
        head: [["Keterangan", "Jumlah"]],
        body: [
            ["Total Pendapatan (Penjualan)", formatRupiah(data.totalRevenue)],
            [`  Jumlah Transaksi`, `${data.totalSalesCount} transaksi`],
            ["Total Pengeluaran (Pembelian)", `(${formatRupiah(data.totalCost)})`],
            [`  Jumlah Transaksi`, `${data.totalPurchaseCount} transaksi`],
            [
                { content: data.profit >= 0 ? "LABA BERSIH" : "RUGI BERSIH", styles: { fontStyle: "bold", fontSize: 12 } },
                { content: formatRupiah(Math.abs(data.profit)), styles: { fontStyle: "bold", fontSize: 12 } },
            ],
            ["Margin", `${data.profitMargin}%`],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 70, halign: "right" } },
        styles: { fontSize: 10 },
    });

    const dateStr = new Date().toISOString().split("T")[0];
    doc.save(`Laporan_Laba_Rugi_${dateStr}.pdf`);
}

export function exportTransactionsPdf(transactions: Transaction[], type: "SALE" | "PURCHASE") {
    const doc = new jsPDF("landscape");
    const label = type === "SALE" ? "PENJUALAN" : "PEMBELIAN";

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`LAPORAN ${label}`, 148, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak: ${formatTanggal(new Date())}`, 148, 28, { align: "center" });
    doc.text(`Total Transaksi: ${transactions.length}`, 148, 34, { align: "center" });

    // Build rows
    const rows: any[][] = [];
    let no = 1;
    for (const tx of transactions) {
        for (const item of tx.items) {
            rows.push([
                no++,
                formatTanggal(tx.createdAt),
                item.product.name,
                item.product.sku,
                item.quantity,
                formatRupiah(item.price),
                formatRupiah(item.subtotal),
                formatRupiah(tx.totalAmount),
                tx.notes || "-",
                tx.createdBy.name,
            ]);
        }
    }

    autoTable(doc, {
        startY: 40,
        head: [["No", "Tanggal", "Produk", "SKU", "Qty", "Harga", "Subtotal", "Total", "Catatan", "Oleh"]],
        body: rows,
        theme: "grid",
        headStyles: {
            fillColor: type === "SALE" ? [16, 185, 129] : [59, 130, 246],
            textColor: 255,
            fontStyle: "bold",
        },
        styles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 10 },
            4: { halign: "center" },
            5: { halign: "right" },
            6: { halign: "right" },
            7: { halign: "right" },
        },
    });

    // Add total at the bottom
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
    const finalY = (doc as any).lastAutoTable?.finalY || 50;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${formatRupiah(totalAmount)}`, 277, finalY + 10, { align: "right" });

    const labelLower = type === "SALE" ? "Penjualan" : "Pembelian";
    const dateStr = new Date().toISOString().split("T")[0];
    doc.save(`Laporan_${labelLower}_${dateStr}.pdf`);
}
