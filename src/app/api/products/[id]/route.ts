import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                category: true,
                createdBy: { select: { id: true, name: true } },
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, sku, description, image, buyPrice, sellPrice, stock, minStock, unit, categoryId } = body;

        const existing = await prisma.product.findUnique({ where: { id: params.id } });
        if (!existing) {
            return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
        }

        if (sku && sku !== existing.sku) {
            const skuExists = await prisma.product.findUnique({ where: { sku } });
            if (skuExists) {
                return NextResponse.json({ error: "SKU sudah digunakan" }, { status: 409 });
            }
        }

        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                name: name ?? existing.name,
                sku: sku ?? existing.sku,
                description: description ?? existing.description,
                image: image ?? existing.image,
                buyPrice: buyPrice !== undefined ? parseFloat(buyPrice) : existing.buyPrice,
                sellPrice: sellPrice !== undefined ? parseFloat(sellPrice) : existing.sellPrice,
                stock: stock !== undefined ? parseInt(stock) : existing.stock,
                minStock: minStock !== undefined ? parseInt(minStock) : existing.minStock,
                unit: unit ?? existing.unit,
                categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
            },
            include: {
                category: true,
                createdBy: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const existing = await prisma.product.findUnique({ where: { id: params.id } });
        if (!existing) {
            return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
        }

        await prisma.product.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true, message: "Produk berhasil dihapus" });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
