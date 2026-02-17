import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const notifications: {
            id: string;
            type: "low_stock" | "out_of_stock" | "sale" | "purchase" | "debt_overdue";
            title: string;
            message: string;
            createdAt: string;
            read: boolean;
        }[] = [];

        // 1. Low stock & out of stock products
        const lowStockProducts = await prisma.product.findMany({
            where: {
                stock: { lte: 10 },
            },
            orderBy: { stock: "asc" },
            take: 20,
        });

        lowStockProducts.forEach((product) => {
            if (product.stock === 0) {
                notifications.push({
                    id: `out-${product.id}`,
                    type: "out_of_stock",
                    title: "Stok Habis!",
                    message: `${product.name} (${product.sku}) sudah habis. Segera lakukan restok.`,
                    createdAt: new Date().toISOString(),
                    read: false,
                });
            } else if (product.stock <= product.minStock) {
                notifications.push({
                    id: `low-${product.id}`,
                    type: "low_stock",
                    title: "Stok Menipis",
                    message: `${product.name} (${product.sku}) tersisa ${product.stock} ${product.unit}.`,
                    createdAt: new Date().toISOString(),
                    read: false,
                });
            }
        });

        // 2. Recent transactions (last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const recentTransactions = await prisma.transaction.findMany({
            where: { createdAt: { gte: oneDayAgo } },
            include: {
                items: { include: { product: { select: { name: true } } } },
                createdBy: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        recentTransactions.forEach((tx) => {
            const itemNames = tx.items.map((i) => i.product.name).join(", ");
            const totalFormatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(tx.totalAmount);

            notifications.push({
                id: `tx-${tx.id}`,
                type: tx.type === "SALE" ? "sale" : "purchase",
                title: tx.type === "SALE" ? "Penjualan Baru" : "Pembelian Baru",
                message: `${totalFormatted} — ${itemNames} oleh ${tx.createdBy.name}`,
                createdAt: tx.createdAt.toISOString(),
                read: false,
            });
        });

        // 3. Overdue debts
        const overdueDebts = await prisma.debt.findMany({
            where: {
                status: { in: ["PENDING", "PARTIAL"] },
                dueDate: { lt: new Date() },
            },
            take: 10,
        });

        overdueDebts.forEach((debt) => {
            const remaining = debt.amount - debt.paidAmount;
            const totalFormatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(remaining);

            notifications.push({
                id: `debt-${debt.id}`,
                type: "debt_overdue",
                title: debt.type === "RECEIVABLE" ? "Piutang Jatuh Tempo" : "Hutang Jatuh Tempo",
                message: `${debt.contactName} — sisa ${totalFormatted}`,
                createdAt: debt.updatedAt.toISOString(),
                read: false,
            });
        });

        // Sort by priority: out_of_stock > debt_overdue > low_stock > sale/purchase
        const priorityOrder = { out_of_stock: 0, debt_overdue: 1, low_stock: 2, sale: 3, purchase: 4 };
        notifications.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

        return NextResponse.json({
            success: true,
            data: notifications,
            unreadCount: notifications.filter((n) => !n.read).length,
        });
    } catch (error) {
        console.error("Notifications error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
