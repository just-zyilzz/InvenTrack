import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const KLIKRESI_API_KEY = process.env.KLIKRESI_API_KEY || "";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const transactionId = searchParams.get("transactionId");

        if (!transactionId) {
            return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            select: {
                id: true,
                trackingNumber: true,
                courierCode: true,
                trackingStatus: true,
                trackingData: true,
                lastTrackedAt: true,
            },
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: transaction });
    } catch (error) {
        console.error("Tracking GET error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// Manual trigger to check tracking status
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { transactionId } = await req.json();

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            select: {
                id: true,
                trackingNumber: true,
                courierCode: true,
            },
        });

        if (!transaction || !transaction.trackingNumber || !transaction.courierCode) {
            return NextResponse.json({ error: "No tracking info found" }, { status: 400 });
        }

        // Call KlikResi API
        const trackingResult = await fetchKlikResi(transaction.trackingNumber, transaction.courierCode);

        if (trackingResult.error) {
            return NextResponse.json({ error: trackingResult.error }, { status: 400 });
        }

        // Update transaction with tracking data
        const updated = await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                trackingStatus: trackingResult.status,
                trackingData: trackingResult.data as any,
                lastTrackedAt: new Date(),
            },
            select: {
                id: true,
                trackingNumber: true,
                courierCode: true,
                trackingStatus: true,
                trackingData: true,
                lastTrackedAt: true,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("Tracking POST error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

async function fetchKlikResi(trackingNumber: string, courierCode: string) {
    try {
        const res = await fetch(
            `https://klikresi.com/api/trackings/${trackingNumber}/couriers/${courierCode}`,
            {
                method: "GET",
                headers: {
                    "x-api-key": KLIKRESI_API_KEY,
                },
            }
        );

        if (!res.ok) {
            const text = await res.text();
            console.error("KlikResi error:", res.status, text);
            return { error: `KlikResi API error: ${res.status}` };
        }

        const json = await res.json();

        // Map KlikResi status directly to our internal status
        const apiStatus = (json.data?.status || "").toLowerCase().replace(/\s+/g, "");
        const statusMap: Record<string, string> = {
            delivered: "delivered",
            intransit: "in_transit",
            in_transit: "in_transit",
            outfordelivery: "out_for_delivery",
            out_for_delivery: "out_for_delivery",
            inforeceived: "info_received",
            info_received: "info_received",
            pickup: "picked_up",
            picked_up: "picked_up",
            failed: "failed",
            returned: "returned",
        };
        const status = statusMap[apiStatus] || (json.data?.histories?.length > 0 ? "in_transit" : "unknown");

        return { status, data: json.data || json };
    } catch (error) {
        console.error("KlikResi fetch error:", error);
        return { error: "Failed to connect to KlikResi API" };
    }
}
