"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SidebarProvider } from "@/hooks/useSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/login");
        },
    });

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Memuat...</p>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-1 flex-col min-w-0">
                    <Navbar />
                    <main className="flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-6">{children}</main>
                    <Footer />
                </div>
            </div>
        </SidebarProvider>
    );
}
