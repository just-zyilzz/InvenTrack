import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") || "dashboard";

        if (type === "dashboard") {
            const [
                totalProducts,
                lowStockProducts,
                salesTransactions,
                purchaseTransactions,
                recentTransactions,
            ] = await Promise.all([
                prisma.product.count(),
                prisma.product.count({
                    where: { stock: { lte: prisma.product.fields.minStock } },
                }).catch(() => 0),
                prisma.transaction.aggregate({
                    where: { type: "SALE" },
                    _sum: { totalAmount: true },
                    _count: true,
                }),
                prisma.transaction.aggregate({
                    where: { type: "PURCHASE" },
                    _sum: { totalAmount: true },
                    _count: true,
                }),
                prisma.transaction.findMany({
                    take: 10,
                    orderBy: { createdAt: "desc" },
                    include: {
                        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
                        createdBy: { select: { id: true, name: true } },
                        debt: true,
                    },
                }),
            ]);

            // Monthly sales data for chart
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const monthlySalesRaw = await prisma.transaction.groupBy({
                by: ["createdAt"],
                where: {
                    type: "SALE",
                    createdAt: { gte: sixMonthsAgo },
                },
                _sum: { totalAmount: true },
            });

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
            const monthlySales: Record<string, number> = {};

            // Initialize last 6 months
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
                monthlySales[key] = 0;
            }

            // Aggregate raw data into months
            monthlySalesRaw.forEach((item) => {
                const d = new Date(item.createdAt);
                const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
                if (key in monthlySales) {
                    monthlySales[key] += item._sum.totalAmount || 0;
                }
            });

            return NextResponse.json({
                success: true,
                data: {
                    totalProducts,
                    lowStockProducts,
                    totalSales: salesTransactions._count,
                    totalPurchases: purchaseTransactions._count,
                    totalRevenue: salesTransactions._sum.totalAmount || 0,
                    totalExpenses: purchaseTransactions._sum.totalAmount || 0,
                    recentTransactions,
                    monthlySales: Object.entries(monthlySales).map(([month, total]) => ({ month, total })),
                },
            });
        }

        if (type === "profit-loss") {
            const { searchParams } = new URL(req.url);
            const startDate = searchParams.get("startDate");
            const endDate = searchParams.get("endDate");

            const dateFilter: any = {};
            if (startDate) dateFilter.gte = new Date(startDate);
            if (endDate) dateFilter.lte = new Date(endDate);

            const where = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

            const [sales, purchases] = await Promise.all([
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

            const totalRevenue = sales._sum.totalAmount || 0;
            const totalCost = purchases._sum.totalAmount || 0;
            const profit = totalRevenue - totalCost;

            return NextResponse.json({
                success: true,
                data: {
                    totalRevenue,
                    totalCost,
                    profit,
                    totalSalesCount: sales._count,
                    totalPurchaseCount: purchases._count,
                    profitMargin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0,
                },
            });
        }

        if (type === "stock") {
            const products = await prisma.product.findMany({
                include: { category: true },
                orderBy: { stock: "asc" },
            });

            const totalValue = products.reduce((sum, p) => sum + p.stock * p.buyPrice, 0);
            const lowStock = products.filter((p) => p.stock <= p.minStock);
            const outOfStock = products.filter((p) => p.stock === 0);

            return NextResponse.json({
                success: true,
                data: {
                    products,
                    totalValue,
                    totalProducts: products.length,
                    lowStockCount: lowStock.length,
                    outOfStockCount: outOfStock.length,
                },
            });
        }

        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    } catch (error) {
        console.error("Reports error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
