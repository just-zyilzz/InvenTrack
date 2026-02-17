// All couriers supported by KlikResi API
export const COURIERS = [
    { code: "jne", name: "JNE (Jalur Nugraha Ekakurir)" },
    { code: "jnt", name: "J&T Express" },
    { code: "sicepat", name: "SiCepat Express" },
    { code: "anteraja", name: "AnterAja" },
    { code: "pos", name: "Pos Indonesia" },
    { code: "lion", name: "Lion Parcel" },
    { code: "ninja", name: "Ninja Express" },
    { code: "ide", name: "ID Express" },
    { code: "sap", name: "SAP Express" },
    { code: "wahana", name: "Wahana Prestasi Logistik" },
    { code: "spx", name: "Shopee Express" },
    { code: "lex", name: "Lazada Logistics" },
    { code: "tiki", name: "TIKI" },
    { code: "rpx", name: "RPX One Stop Logistics" },
    { code: "pcp", name: "PCP Express" },
    { code: "jet", name: "JET Express" },
    { code: "dse", name: "DSE (21 Express)" },
    { code: "first", name: "First Logistics" },
    { code: "ncs", name: "NCS (Nusantara Card Semesta)" },
    { code: "star", name: "Star Cargo" },
] as const;

export type CourierCode = typeof COURIERS[number]["code"];

export function getCourierName(code: string): string {
    return COURIERS.find((c) => c.code === code)?.name || code.toUpperCase();
}

// Tracking status labels
export const TRACKING_STATUSES: Record<string, { label: string; color: string }> = {
    pending: { label: "Menunggu", color: "bg-gray-100 text-gray-700" },
    info_received: { label: "Info Diterima", color: "bg-sky-100 text-sky-700" },
    picked_up: { label: "Diambil Kurir", color: "bg-blue-100 text-blue-700" },
    in_transit: { label: "Dalam Pengiriman", color: "bg-amber-100 text-amber-700" },
    out_for_delivery: { label: "Sedang Diantar", color: "bg-indigo-100 text-indigo-700" },
    delivered: { label: "Terkirim", color: "bg-emerald-100 text-emerald-700" },
    failed: { label: "Gagal", color: "bg-red-100 text-red-700" },
    returned: { label: "Dikembalikan", color: "bg-rose-100 text-rose-700" },
    unknown: { label: "Tidak Diketahui", color: "bg-gray-100 text-gray-600" },
};
