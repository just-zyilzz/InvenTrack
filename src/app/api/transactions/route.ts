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
        const type = searchParams.get("type") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        const where: any = {};
        if (type === "SALE" || type === "PURCHASE") {
            where.type = type;
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: { select: { id: true, name: true, sku: true } },
                        },
                    },
                    createdBy: { select: { id: true, name: true } },
                    debt: true,
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.transaction.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: { data: transactions, total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("Transactions GET error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { type, items, notes, createDebt, debtContactName, debtContactPhone, trackingNumber, courierCode } = body;

        if (!type || !items || items.length === 0) {
            return NextResponse.json({ error: "Data transaksi tidak valid" }, { status: 400 });
        }

        // Calculate totals
        const processedItems: { productId: string; quantity: number; price: number; subtotal: number }[] = [];
        let totalAmount = 0;

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                return NextResponse.json({ error: `Produk tidak ditemukan` }, { status: 404 });
            }

            if (type === "SALE" && product.stock < item.quantity) {
                return NextResponse.json(
                    { error: `Stok ${product.name} tidak mencukupi (tersedia: ${product.stock})` },
                    { status: 400 }
                );
            }

            const subtotal = item.quantity * item.price;
            totalAmount += subtotal;
            processedItems.push({ ...item, subtotal });
        }

        // Create transaction with items and update stock
        const transaction = await prisma.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    type,
                    totalAmount,
                    notes,
                    trackingNumber: type === "PURCHASE" ? trackingNumber || null : null,
                    courierCode: type === "PURCHASE" ? courierCode || null : null,
                    trackingStatus: type === "PURCHASE" && trackingNumber ? "pending" : null,
                    createdById: session.user.id,
                    items: {
                        create: processedItems.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            subtotal: item.subtotal,
                        })),
                    },
                },
                include: {
                    items: { include: { product: { select: { id: true, name: true, sku: true } } } },
                    createdBy: { select: { id: true, name: true } },
                },
            });

            // Update stock
            for (const item of processedItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            [type === "SALE" ? "decrement" : "increment"]: item.quantity,
                        },
                    },
                });
            }

            // Create debt if requested
            if (createDebt && debtContactName) {
                await tx.debt.create({
                    data: {
                        type: type === "SALE" ? "RECEIVABLE" : "PAYABLE",
                        contactName: debtContactName,
                        contactPhone: debtContactPhone,
                        amount: totalAmount,
                        transactionId: newTransaction.id,
                    },
                });
            }

            return newTransaction;
        });

        return NextResponse.json({ success: true, data: transaction }, { status: 201 });
    } catch (error) {
        console.error("Transactions POST error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
