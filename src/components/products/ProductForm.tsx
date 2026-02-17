"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductInput } from "@/lib/validations/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

interface Category {
    id: string;
    name: string;
}

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
    const [uploading, setUploading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(initialData?.image || null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProductInput>({
        resolver: zodResolver(productSchema),
        defaultValues: initialData
            ? {
                name: initialData.name,
                sku: initialData.sku,
                description: initialData.description || "",
                buyPrice: initialData.buyPrice,
                sellPrice: initialData.sellPrice,
                stock: initialData.stock,
                minStock: initialData.minStock,
                unit: initialData.unit,
                categoryId: initialData.categoryId || "",
            }
            : {
                stock: 0,
                minStock: 5,
                unit: "pcs",
            },
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/products?limit=0&categories=true");
            const json = await res.json();
            if (json.categories) setCategories(json.categories);
        } catch (error) {
            // Categories are optional
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const json = await res.json();
            if (json.success) {
                setUploadedImage(json.data.originalPath);
                toast({ title: "Gambar berhasil diupload" });
            } else {
                toast({ title: "Upload gagal", description: json.error, variant: "destructive" });
                setImagePreview(null);
            }
        } catch {
            toast({ title: "Upload gagal", variant: "destructive" });
            setImagePreview(null);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setUploadedImage(null);
    };

    const onSubmit = async (data: ProductInput) => {
        try {
            const url = isEditing ? `/api/products/${initialData.id}` : "/api/products";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, image: uploadedImage }),
            });

            const json = await res.json();

            if (json.success) {
                toast({ title: isEditing ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan" });
                router.push("/products");
                router.refresh();
            } else {
                toast({ title: "Gagal", description: json.error, variant: "destructive" });
            }
        } catch {
            toast({ title: "Terjadi kesalahan", variant: "destructive" });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Informasi Produk</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Produk *</Label>
                                <Input id="name" placeholder="Contoh: Laptop ASUS" {...register("name")} className={errors.name ? "border-destructive" : ""} />
                                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU *</Label>
                                <Input id="sku" placeholder="Contoh: ELEC-001" {...register("sku")} className={errors.sku ? "border-destructive" : ""} />
                                {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea id="description" placeholder="Deskripsi produk..." {...register("description")} rows={3} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="buyPrice">Harga Beli (Rp) *</Label>
                                <Input id="buyPrice" type="number" placeholder="0" {...register("buyPrice", { valueAsNumber: true })} className={errors.buyPrice ? "border-destructive" : ""} />
                                {errors.buyPrice && <p className="text-xs text-destructive">{errors.buyPrice.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sellPrice">Harga Jual (Rp) *</Label>
                                <Input id="sellPrice" type="number" placeholder="0" {...register("sellPrice", { valueAsNumber: true })} className={errors.sellPrice ? "border-destructive" : ""} />
                                {errors.sellPrice && <p className="text-xs text-destructive">{errors.sellPrice.message}</p>}
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stok</Label>
                                <Input id="stock" type="number" placeholder="0" {...register("stock", { valueAsNumber: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minStock">Minimal Stok</Label>
                                <Input id="minStock" type="number" placeholder="5" {...register("minStock", { valueAsNumber: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Satuan</Label>
                                <Input id="unit" placeholder="pcs" {...register("unit")} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Image & Category */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gambar Produk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {imagePreview ? (
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-sm text-muted-foreground">Upload gambar</span>
                                    <span className="text-xs text-muted-foreground">Max 5MB</span>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            )}
                            {uploading && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Mengupload...
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Kategori</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select onValueChange={(val) => setValue("categoryId", val)} defaultValue={initialData?.categoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Batal
                </Button>
                <Button type="submit" disabled={isSubmitting || uploading}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : isEditing ? (
                        "Perbarui Produk"
                    ) : (
                        "Tambah Produk"
                    )}
                </Button>
            </div>
        </form>
    );
}
