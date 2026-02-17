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
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
            ];
        }
        if (category) {
            where.categoryId = category;
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    createdBy: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                data: products,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Products GET error:", error);
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
        const { name, sku, description, image, buyPrice, sellPrice, stock, minStock, unit, categoryId } = body;

        if (!name || !sku || buyPrice === undefined || sellPrice === undefined) {
            return NextResponse.json({ error: "Field wajib harus diisi" }, { status: 400 });
        }

        const existingSku = await prisma.product.findUnique({ where: { sku } });
        if (existingSku) {
            return NextResponse.json({ error: "SKU sudah digunakan" }, { status: 409 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                sku,
                description,
                image,
                buyPrice: parseFloat(buyPrice),
                sellPrice: parseFloat(sellPrice),
                stock: parseInt(stock) || 0,
                minStock: parseInt(minStock) || 5,
                unit: unit || "pcs",
                categoryId: categoryId || null,
                createdById: session.user.id,
            },
            include: {
                category: true,
                createdBy: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error) {
        console.error("Products POST error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
