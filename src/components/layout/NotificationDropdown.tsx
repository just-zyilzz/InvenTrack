"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Bell,
    AlertTriangle,
    PackageX,
    ShoppingCart,
    Truck,
    CreditCard,
    X,
    RefreshCw,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Notification {
    id: string;
    type: "low_stock" | "out_of_stock" | "sale" | "purchase" | "debt_overdue";
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
}

const typeConfig = {
    out_of_stock: {
        icon: PackageX,
        color: "text-red-600",
        bg: "bg-red-100",
        badge: "destructive" as const,
    },
    low_stock: {
        icon: AlertTriangle,
        color: "text-amber-600",
        bg: "bg-amber-100",
        badge: "warning" as const,
    },
    sale: {
        icon: ShoppingCart,
        color: "text-emerald-600",
        bg: "bg-emerald-100",
        badge: "success" as const,
    },
    purchase: {
        icon: Truck,
        color: "text-blue-600",
        bg: "bg-blue-100",
        badge: "default" as const,
    },
    debt_overdue: {
        icon: CreditCard,
        color: "text-rose-600",
        bg: "bg-rose-100",
        badge: "destructive" as const,
    },
};

export default function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/notifications");
            const json = await res.json();
            if (json.success) {
                setNotifications(json.data);
                setUnreadCount(json.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => {
                    setOpen(!open);
                    if (!open) fetchNotifications();
                }}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </Button>

            {open && (
                <div className="absolute right-0 top-12 z-50 w-96 rounded-xl border bg-card shadow-2xl animate-in slide-in-from-top-2 fade-in-0 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 pb-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">Notifikasi</h3>
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs h-5">
                                    {unreadCount} baru
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={fetchNotifications}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <div className="px-4 pb-2">
                            <button
                                onClick={markAllRead}
                                className="text-xs text-primary hover:underline"
                            >
                                Tandai semua sudah dibaca
                            </button>
                        </div>
                    )}

                    <Separator />

                    {/* Notification List */}
                    <div className="max-h-[420px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">Tidak ada notifikasi</p>
                                <p className="text-xs text-muted-foreground mt-1">Semua sudah terkendali! 🎉</p>
                            </div>
                        ) : (
                            notifications.map((notification, index) => {
                                const config = typeConfig[notification.type];
                                const Icon = config.icon;

                                return (
                                    <div key={notification.id}>
                                        <div
                                            className={`flex gap-3 p-4 transition-colors hover:bg-muted/50 cursor-pointer ${!notification.read ? "bg-primary/5" : ""
                                                }`}
                                            onClick={() => {
                                                setNotifications((prev) =>
                                                    prev.map((n) =>
                                                        n.id === notification.id ? { ...n, read: true } : n
                                                    )
                                                );
                                                setUnreadCount((prev) =>
                                                    notification.read ? prev : Math.max(0, prev - 1)
                                                );
                                            }}
                                        >
                                            <div className={`shrink-0 rounded-full p-2 mt-0.5 ${config.bg}`}>
                                                <Icon className={`h-4 w-4 ${config.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-semibold leading-tight">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <span className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/70 mt-1">
                                                    {formatDateTime(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        {index < notifications.length - 1 && <Separator />}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <>
                            <Separator />
                            <div className="p-3 text-center">
                                <p className="text-xs text-muted-foreground">
                                    Menampilkan {notifications.length} notifikasi terbaru
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
