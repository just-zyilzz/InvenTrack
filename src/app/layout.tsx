import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "InvenTrack - Inventory Management System",
    description: "Sistem manajemen inventori modern untuk bisnis Anda. Kelola produk, transaksi, dan laporan dengan mudah.",
    keywords: ["inventory", "management", "system", "produk", "transaksi"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="id" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <SessionProvider>
                    {children}
                    <Toaster />
                </SessionProvider>
            </body>
        </html>
    );
}
