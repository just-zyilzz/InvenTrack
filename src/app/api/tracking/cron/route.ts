import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const KLIKRESI_API_KEY = process.env.KLIKRESI_API_KEY || "";

// Cron endpoint: auto-check all active tracking every 8 hours
// Can be triggered by Vercel Cron, external cron service, or manually
export async function GET() {
    try {
        // Find all PURCHASE transactions with tracking number that are not delivered
        const transactions = await prisma.transaction.findMany({
            where: {
                type: "PURCHASE",
                trackingNumber: { not: null },
                courierCode: { not: null },
                trackingStatus: { notIn: ["delivered", "returned", "failed"] },
            },
            select: {
                id: true,
                trackingNumber: true,
                courierCode: true,
            },
        });

        if (transactions.length === 0) {
            return NextResponse.json({ success: true, message: "No active trackings", checked: 0 });
        }

        let updated = 0;
        let errors = 0;

        for (const tx of transactions) {
            try {
                const res = await fetch(
                    `https://klikresi.com/api/trackings/${tx.trackingNumber}/couriers/${tx.courierCode}`,
                    {
                        method: "GET",
                        headers: { "x-api-key": KLIKRESI_API_KEY },
                    }
                );

                if (!res.ok) {
                    errors++;
                    continue;
                }

                const json = await res.json();

                // Map KlikResi status directly
                const apiStatus = (json.data?.status || "").toLowerCase().replace(/\s+/g, "");
                const statusMap: Record<string, string> = {
                    delivered: "delivered",
                    intransit: "in_transit",
                    outfordelivery: "out_for_delivery",
                    inforeceived: "info_received",
                    pickup: "picked_up",
                    failed: "failed",
                    returned: "returned",
                };
                const status = statusMap[apiStatus] || (json.data?.histories?.length > 0 ? "in_transit" : "unknown");

                await prisma.transaction.update({
                    where: { id: tx.id },
                    data: {
                        trackingStatus: status,
                        trackingData: json.data || json,
                        lastTrackedAt: new Date(),
                    },
                });
                updated++;

                // Small delay to avoid rate limiting
                await new Promise((r) => setTimeout(r, 500));
            } catch (err) {
                console.error(`Tracking cron error for ${tx.id}:`, err);
                errors++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Checked ${transactions.length} trackings`,
            updated,
            errors,
        });
    } catch (error) {
        console.error("Tracking cron error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
