import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Boxes, ArrowRight, BarChart3, Package, Shield } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Navbar */}
            <nav className="border-b bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <Boxes className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                            InvenTrack
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost">Masuk</Button>
                        </Link>
                        <Link href="/register">
                            <Button>
                                Daftar Gratis
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="container mx-auto px-4 py-20 text-center">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-6 inline-flex items-center rounded-full border bg-white px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
                        ✨ Sistem Inventory Modern untuk Bisnis Anda
                    </div>
                    <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                        Kelola Inventory{" "}
                        <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                            Lebih Cerdas
                        </span>
                    </h1>
                    <p className="mb-10 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Pantau stok produk, kelola transaksi penjualan & pembelian, lacak hutang piutang,
                        dan lihat laporan keuangan — semua dalam satu platform yang intuitif.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register">
                            <Button size="lg" className="text-base px-8 shadow-lg shadow-primary/25">
                                Mulai Sekarang
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="text-base px-8">
                                Masuk ke Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-4 pb-20">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="group rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                            <Package className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">Manajemen Produk</h3>
                        <p className="text-muted-foreground">
                            Kelola produk dengan gambar, kategori, SKU, harga beli & jual, dan pelacakan stok minimum.
                        </p>
                    </div>
                    <div className="group rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">Laporan Real-time</h3>
                        <p className="text-muted-foreground">
                            Lihat laporan laba rugi, stok barang, dan analisis penjualan dengan grafik interaktif.
                        </p>
                    </div>
                    <div className="group rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">Aman & Terpercaya</h3>
                        <p className="text-muted-foreground">
                            Autentikasi aman dengan role-based access control. Data Anda terlindungi.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-white py-8">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} InvenTrack. Built with Next.js, TypeScript & Tailwind CSS.
                </div>
            </footer>
        </div>
    );
}
