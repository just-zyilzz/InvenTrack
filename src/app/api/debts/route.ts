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

        const where: any = {};
        if (type === "RECEIVABLE" || type === "PAYABLE") {
            where.type = type;
        }

        const debts = await prisma.debt.findMany({
            where,
            include: {
                transaction: {
                    include: {
                        items: {
                            include: { product: { select: { id: true, name: true } } },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: debts });
    } catch (error) {
        console.error("Debts GET error:", error);
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
        const { type, contactName, contactPhone, amount, dueDate, notes, transactionId } = body;

        const debt = await prisma.debt.create({
            data: {
                type,
                contactName,
                contactPhone,
                amount: parseFloat(amount),
                dueDate: dueDate ? new Date(dueDate) : null,
                notes,
                transactionId: transactionId || null,
            },
        });

        return NextResponse.json({ success: true, data: debt }, { status: 201 });
    } catch (error) {
        console.error("Debts POST error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, amount } = body;

        if (!id || !amount) {
            return NextResponse.json({ error: "ID dan jumlah pembayaran harus diisi" }, { status: 400 });
        }

        const debt = await prisma.debt.findUnique({ where: { id } });
        if (!debt) {
            return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
        }

        const newPaidAmount = debt.paidAmount + parseFloat(amount);
        let newStatus = debt.status;

        if (newPaidAmount >= debt.amount) {
            newStatus = "PAID";
        } else if (newPaidAmount > 0) {
            newStatus = "PARTIAL";
        }

        const updated = await prisma.debt.update({
            where: { id },
            data: {
                paidAmount: newPaidAmount,
                status: newStatus,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("Debts PUT error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
