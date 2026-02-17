import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.upsert({
        where: { email: "admin@inventory.com" },
        update: {},
        create: {
            name: "Administrator",
            email: "admin@inventory.com",
            password: hashedPassword,
            role: Role.ADMIN,
        },
    });
    console.log("✅ Admin user created:", admin.email);

    // Create categories
    const categories = await Promise.all(
        [
            { name: "Elektronik", description: "Perangkat elektronik dan aksesoris" },
            { name: "Makanan & Minuman", description: "Produk makanan dan minuman" },
            { name: "Pakaian", description: "Pakaian dan aksesoris fashion" },
            { name: "Alat Tulis", description: "Peralatan tulis dan kantor" },
            { name: "Rumah Tangga", description: "Peralatan rumah tangga" },
        ].map((cat) =>
            prisma.category.upsert({
                where: { name: cat.name },
                update: {},
                create: cat,
            })
        )
    );
    console.log("✅ Categories created:", categories.length);

    // Create sample products
    const products = [
        {
            name: "Laptop ASUS VivoBook",
            sku: "ELEC-001",
            description: "Laptop ASUS VivoBook 14 inch, Intel Core i5, 8GB RAM",
            buyPrice: 7500000,
            sellPrice: 8999000,
            stock: 15,
            minStock: 3,
            unit: "unit",
            categoryId: categories[0].id,
            createdById: admin.id,
        },
        {
            name: "Mouse Logitech M331",
            sku: "ELEC-002",
            description: "Mouse wireless Logitech M331 Silent Plus",
            buyPrice: 180000,
            sellPrice: 250000,
            stock: 50,
            minStock: 10,
            unit: "pcs",
            categoryId: categories[0].id,
            createdById: admin.id,
        },
        {
            name: "Indomie Goreng",
            sku: "FOOD-001",
            description: "Indomie Mi Goreng Original",
            buyPrice: 2800,
            sellPrice: 3500,
            stock: 200,
            minStock: 50,
            unit: "pcs",
            categoryId: categories[1].id,
            createdById: admin.id,
        },
        {
            name: "Kaos Polos Hitam",
            sku: "CLTH-001",
            description: "Kaos polos cotton combed 30s warna hitam",
            buyPrice: 35000,
            sellPrice: 55000,
            stock: 100,
            minStock: 20,
            unit: "pcs",
            categoryId: categories[2].id,
            createdById: admin.id,
        },
        {
            name: "Pulpen Pilot G-2",
            sku: "STAT-001",
            description: "Pulpen gel Pilot G-2 0.5mm",
            buyPrice: 12000,
            sellPrice: 18000,
            stock: 80,
            minStock: 15,
            unit: "pcs",
            categoryId: categories[3].id,
            createdById: admin.id,
        },
        {
            name: "Sapu Ijuk",
            sku: "HOME-001",
            description: "Sapu ijuk berkualitas tinggi",
            buyPrice: 15000,
            sellPrice: 25000,
            stock: 30,
            minStock: 5,
            unit: "pcs",
            categoryId: categories[4].id,
            createdById: admin.id,
        },
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { sku: product.sku },
            update: {},
            create: product,
        });
    }
    console.log("✅ Products created:", products.length);

    console.log("🎉 Seeding completed!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
