import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "erine@gmail.com";
    console.log(`Checking user: ${email}`);
    
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log("✅ User found:", user);
        // Verify password if needed, but for now just existence
    } else {
        console.log("❌ User not found");
    }
}

main()
    .catch((e) => {
        console.error("Error:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
