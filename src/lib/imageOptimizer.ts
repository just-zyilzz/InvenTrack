import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/products");

export async function ensureUploadDirs() {
    const originalDir = path.join(UPLOAD_DIR, "original");
    const thumbnailDir = path.join(UPLOAD_DIR, "thumbnails");
    await fs.mkdir(originalDir, { recursive: true });
    await fs.mkdir(thumbnailDir, { recursive: true });
}

export async function optimizeImage(
    buffer: Buffer,
    filename: string
): Promise<{ originalPath: string; thumbnailPath: string }> {
    await ensureUploadDirs();

    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    const timestamp = Date.now();
    const newFilename = `${name}-${timestamp}.webp`;

    const originalPath = path.join(UPLOAD_DIR, "original", newFilename);
    const thumbnailPath = path.join(UPLOAD_DIR, "thumbnails", newFilename);

    // Optimize original - max 1200px wide, webp format
    await sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(originalPath);

    // Generate thumbnail - 300px wide
    await sharp(buffer)
        .resize(300, 300, { fit: "cover" })
        .webp({ quality: 75 })
        .toFile(thumbnailPath);

    return {
        originalPath: `/uploads/products/original/${newFilename}`,
        thumbnailPath: `/uploads/products/thumbnails/${newFilename}`,
    };
}

export async function deleteImage(imagePath: string) {
    try {
        const fullPath = path.join(process.cwd(), "public", imagePath);
        await fs.unlink(fullPath);

        // Also delete thumbnail
        const thumbnailPath = imagePath.replace("/original/", "/thumbnails/");
        const fullThumbPath = path.join(process.cwd(), "public", thumbnailPath);
        await fs.unlink(fullThumbPath);
    } catch {
        // Ignore errors if files don't exist
    }
}
