import ProductForm from "@/components/products/ProductForm";

export default function AddProductPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tambah Produk</h1>
                <p className="text-muted-foreground">Isi informasi produk baru</p>
            </div>
            <ProductForm />
        </div>
    );
}
