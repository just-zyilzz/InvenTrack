import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: { select: { products: true } },
            },
        });

        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        console.error("Categories GET error:", error);
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
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: "Nama kategori harus diisi" }, { status: 400 });
        }

        const existing = await prisma.category.findUnique({ where: { name } });
        if (existing) {
            return NextResponse.json({ error: "Nama kategori sudah ada" }, { status: 409 });
        }

        const category = await prisma.category.create({
            data: { name, description },
        });

        return NextResponse.json({ success: true, data: category }, { status: 201 });
    } catch (error) {
        console.error("Categories POST error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
