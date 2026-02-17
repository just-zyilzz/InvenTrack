"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Plus, Trash2, Package } from "lucide-react";
import { COURIERS } from "@/lib/couriers";

interface Product {
    id: string;
    name: string;
    sku: string;
    sellPrice: number;
    buyPrice: number;
    stock: number;
}

interface TransactionFormProps {
    type: "SALE" | "PURCHASE";
}

interface TransactionItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export default function TransactionForm({ type }: TransactionFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [items, setItems] = useState<TransactionItem[]>([]);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createDebt, setCreateDebt] = useState(false);
    const [debtContact, setDebtContact] = useState("");
    const [debtPhone, setDebtPhone] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [courierCode, setCourierCode] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products?limit=100");
            const json = await res.json();
            if (json.success) setProducts(json.data.data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        }
    };

    const addItem = () => {
        setItems([...items, { productId: "", productName: "", quantity: 1, price: 0, subtotal: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        if (field === "productId") {
            const product = products.find((p) => p.id === value);
            if (product) {
                item.productName = product.name;
                item.price = type === "SALE" ? product.sellPrice : product.buyPrice;
                item.subtotal = item.quantity * item.price;
            }
        }
        if (field === "quantity" || field === "price") {
            item.subtotal = item.quantity * item.price;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const handleSubmit = async () => {
        if (items.length === 0 || items.some((i) => !i.productId)) {
            toast({ title: "Pilih minimal 1 produk", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    items: items.map((i) => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        price: i.price,
                    })),
                    notes,
                    trackingNumber: type === "PURCHASE" ? trackingNumber : undefined,
                    courierCode: type === "PURCHASE" ? courierCode : undefined,
                    createDebt,
                    debtContactName: debtContact,
                    debtContactPhone: debtPhone,
                }),
            });

            const json = await res.json();
            if (json.success) {
                toast({ title: "Transaksi berhasil disimpan" });
                router.push(type === "SALE" ? "/transactions/sales" : "/transactions/purchases");
                router.refresh();
            } else {
                toast({ title: "Gagal", description: json.error, variant: "destructive" });
            }
        } catch {
            toast({ title: "Terjadi kesalahan", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle>Item Transaksi</CardTitle>
                        <Button onClick={addItem} size="sm" className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Klik &quot;Tambah Item&quot; untuk memulai transaksi
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div key={index} className="flex flex-col lg:flex-row gap-3 items-start lg:items-end rounded-lg border p-4 bg-muted/10">
                                <div className="w-full lg:flex-1 space-y-2">
                                    <Label>Produk</Label>
                                    <Select value={item.productId} onValueChange={(val) => updateItem(index, "productId", val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih produk" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name} ({p.sku}) - Stok: {p.stock}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 lg:flex gap-3 w-full lg:w-auto">
                                    <div className="w-full lg:w-24 space-y-2">
                                        <Label>Jumlah</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <div className="w-full lg:w-40 space-y-2">
                                        <Label>Harga</Label>
                                        <Input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full lg:w-auto items-end">
                                    <div className="flex-1 lg:w-40 space-y-2">
                                        <Label>Subtotal</Label>
                                        <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-medium">
                                            {formatCurrency(item.subtotal)}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeItem(index)}>
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}

                    {items.length > 0 && (
                        <div className="flex justify-end border-t pt-4">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Catatan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Catatan transaksi (opsional)..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </CardContent>
                </Card>

                {type === "PURCHASE" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Info Pengiriman
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Kurir</Label>
                                <Select value={courierCode} onValueChange={setCourierCode}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kurir" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COURIERS.map((c) => (
                                            <SelectItem key={c.code} value={c.code}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Nomor Resi</Label>
                                <Input
                                    placeholder="Masukkan nomor resi (opsional)"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">💡 Resi bisa ditambahkan nanti saat sudah tersedia</p>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Hutang / Piutang</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="createDebt"
                                checked={createDebt}
                                onChange={(e) => setCreateDebt(e.target.checked)}
                                className="rounded"
                            />
                            <Label htmlFor="createDebt">
                                Buat sebagai {type === "SALE" ? "piutang (customer belum bayar)" : "hutang (belum dibayar)"}
                            </Label>
                        </div>
                        {createDebt && (
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label>Nama Kontak</Label>
                                    <Input
                                        placeholder="Nama customer/supplier"
                                        value={debtContact}
                                        onChange={(e) => setDebtContact(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>No. Telepon</Label>
                                    <Input
                                        placeholder="08xxxxxxxxxx"
                                        value={debtPhone}
                                        onChange={(e) => setDebtPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => router.back()}>Batal</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || items.length === 0}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        "Simpan Transaksi"
                    )}
                </Button>
            </div>
        </div>
    );
}
