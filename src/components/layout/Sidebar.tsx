"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/hooks/useSidebar";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    FileText,
    CreditCard,
    TrendingUp,
    ChevronLeft,
    ChevronDown,
    ChevronRight,
    Boxes,
    BarChart3,
    Receipt,
    X,
} from "lucide-react";

const menuItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Produk",
        href: "/products",
        icon: Package,
    },
    {
        title: "Transaksi",
        icon: ShoppingCart,
        children: [
            { title: "Penjualan", href: "/transactions/sales", icon: TrendingUp },
            { title: "Pembelian", href: "/transactions/purchases", icon: Truck },
        ],
    },
    {
        title: "Hutang / Piutang",
        icon: CreditCard,
        children: [
            { title: "Piutang", href: "/debts/receivables", icon: Receipt },
            { title: "Hutang", href: "/debts/payables", icon: FileText },
        ],
    },
    {
        title: "Laporan",
        icon: BarChart3,
        children: [
            { title: "Laba Rugi", href: "/reports/profit-loss", icon: TrendingUp },
            { title: "Stok", href: "/reports/stock", icon: Package },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState<string[]>(["Transaksi", "Hutang / Piutang", "Laporan"]);
    const { mobileOpen, setMobileOpen } = useSidebar();

    const toggleMenu = (title: string) => {
        setOpenMenus((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    };

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4">
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Boxes className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                            InvenTrack
                        </span>
                    </Link>
                )}
                {collapsed && (
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Boxes className="h-5 w-5 text-primary-foreground" />
                    </div>
                )}
            </div>

            <Separator />

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        if (item.children) {
                            const isOpen = openMenus.includes(item.title);
                            const isActive = item.children.some((child) =>
                                pathname.startsWith(child.href)
                            );

                            return (
                                <li key={item.title}>
                                    <button
                                        onClick={() => toggleMenu(item.title)}
                                        className={cn(
                                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "text-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        {!collapsed && (
                                            <>
                                                <span className="flex-1 text-left">{item.title}</span>
                                                {isOpen ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </>
                                        )}
                                    </button>
                                    {isOpen && !collapsed && (
                                        <ul className="ml-4 mt-1 space-y-1 border-l pl-3">
                                            {item.children.map((child) => (
                                                <li key={child.href}>
                                                    <Link
                                                        href={child.href}
                                                        onClick={() => setMobileOpen(false)}
                                                        className={cn(
                                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                                            pathname === child.href
                                                                ? "bg-primary/10 text-primary font-medium"
                                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        )}
                                                    >
                                                        <child.icon className="h-4 w-4 shrink-0" />
                                                        <span>{child.title}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        }

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href!}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === item.href
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4 shrink-0" />
                                    {!collapsed && <span>{item.title}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Collapse Button — desktop only */}
            <div className="hidden lg:block border-t p-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
                    {!collapsed && <span className="ml-2">Tutup Menu</span>}
                </Button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "relative hidden lg:flex h-screen flex-col border-r bg-card transition-all duration-300",
                    collapsed ? "w-[70px]" : "w-[260px]"
                )}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Sidebar panel */}
                    <aside className="absolute left-0 top-0 h-full w-[280px] bg-card shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
                        {/* Close button */}
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted z-10"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}
