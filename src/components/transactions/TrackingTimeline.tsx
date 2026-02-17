"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getCourierName, TRACKING_STATUSES } from "@/lib/couriers";
import { formatDateTime } from "@/lib/utils";
import { Package, RefreshCw, MapPin, Clock, CheckCircle2, Truck, X, User, Navigation } from "lucide-react";

interface TrackingTimelineProps {
    transactionId: string;
    trackingNumber: string;
    courierCode: string;
    trackingStatus: string;
    trackingData: any;
    lastTrackedAt: string | null;
    onClose: () => void;
}

export default function TrackingTimeline({
    transactionId,
    trackingNumber,
    courierCode,
    trackingStatus,
    trackingData: initialData,
    lastTrackedAt,
    onClose,
}: TrackingTimelineProps) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(initialData);
    const [status, setStatus] = useState(trackingStatus);
    const [lastChecked, setLastChecked] = useState(lastTrackedAt);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/tracking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactionId }),
            });
            const json = await res.json();
            if (json.success) {
                setData(json.data.trackingData);
                setStatus(json.data.trackingStatus);
                setLastChecked(json.data.lastTrackedAt);
            }
        } catch (error) {
            console.error("Failed to refresh tracking:", error);
        } finally {
            setLoading(false);
        }
    };

    const statusInfo = TRACKING_STATUSES[status] || TRACKING_STATUSES.unknown;
    const histories: any[] = data?.histories || [];
    const origin = data?.origin;
    const destination = data?.destination;

    const getStatusIcon = (historyStatus: string) => {
        const lower = (historyStatus || "").toLowerCase();
        if (lower === "delivered") {
            return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
        }
        if (lower === "intransit" || lower === "in_transit") {
            return <Truck className="h-4 w-4 text-amber-500" />;
        }
        if (lower === "pickup" || lower === "picked_up") {
            return <Package className="h-4 w-4 text-blue-500" />;
        }
        return <MapPin className="h-4 w-4 text-gray-400" />;
    };

    const formatTrackingDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-[90%] sm:max-w-md overflow-y-auto p-0">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-5 sticky top-0 bg-background z-50">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Tracking Resi
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mt-0.5">
                            <span className="text-sm font-medium">{trackingNumber}</span>

                            <span className="text-xs text-muted-foreground hidden sm:inline">—</span>

                            <span className="text-xs text-muted-foreground">{getCourierName(courierCode)}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full sm:hidden">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-0 pb-10">
                    {/* Status + Refresh */}
                    <div className="flex items-center justify-between border-b px-5 py-4 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium uppercase text-muted-foreground tracking-wider">Status</span>
                            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={loading}
                            className="gap-2 h-8"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                            <span className="sr-only sm:not-sr-only sm:inline-block">Cek</span>
                        </Button>
                    </div>

                    {lastChecked && (
                        <div className="flex items-center gap-1.5 px-5 py-2 text-[10px] text-muted-foreground border-b bg-muted/10">
                            <Clock className="h-3 w-3" />
                            Terakhir dicek: {formatDateTime(lastChecked)}
                        </div>
                    )}

                    {/* Origin & Destination */}
                    {(origin || destination) && (
                        <div className="border-b px-5 py-4 space-y-4">
                            {origin && (
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="w-8 flex flex-col items-center">
                                        <Navigation className="h-4 w-4 text-blue-500 shrink-0" />
                                        {destination && <div className="w-0.5 h-full bg-border mt-1" />}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs font-medium text-muted-foreground uppercase">Pengirim</span>
                                        <div className="font-medium mt-0.5">{origin.contact_name}</div>
                                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{origin.address}</p>
                                    </div>
                                </div>
                            )}
                            {destination && (
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="w-8 flex flex-col items-center">
                                        <User className="h-4 w-4 text-emerald-500 shrink-0" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs font-medium text-muted-foreground uppercase">Penerima</span>
                                        <div className="font-medium mt-0.5">{destination.contact_name}</div>
                                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{destination.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="p-5">
                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Riwayat Perjalanan
                        </h4>

                        {histories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed">
                                <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">Belum ada data tracking</p>
                                <p className="text-xs text-muted-foreground mt-1">Klik tombol reload di atas untuk mengambil data terbaru</p>
                            </div>
                        ) : (
                            <div className="relative ml-2">
                                {/* Vertical line */}
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />

                                <div className="space-y-6">
                                    {histories.map((h: any, i: number) => (
                                        <div key={i} className="relative flex gap-4 pl-6 group">
                                            <div className="absolute left-0 top-1 bg-background p-0.5 z-10">
                                                {getStatusIcon(h.status || "")}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] h-5 px-1.5 ${h.status.toLowerCase() === "delivered"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-blue-50 text-blue-700 border-blue-200"
                                                            }`}
                                                    >
                                                        {h.status}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {h.date ? formatTrackingDate(h.date) : ""}
                                                    </span>
                                                </div>
                                                <p className="text-sm leading-relaxed text-foreground/90">
                                                    {h.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
