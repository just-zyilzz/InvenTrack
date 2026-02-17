import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import sharp from "sharp";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: "Ukuran file maks 5MB" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Compress with sharp: resize max 800px, convert to WebP, quality 80
        // Result is sharp but lightweight (~50-150KB)
        const optimizedBuffer = await sharp(buffer)
            .resize(800, 800, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        // Convert to base64 data URL for database storage
        const base64 = optimizedBuffer.toString("base64");
        const imageData = `data:image/webp;base64,${base64}`;

        return NextResponse.json({
            success: true,
            data: {
                originalPath: imageData,
                size: optimizedBuffer.length,
            },
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload gagal" }, { status: 500 });
    }
}
