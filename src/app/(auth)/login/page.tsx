"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setError("");
        try {
            // 1. Get CSRF token
            const csrfRes = await fetch("/api/auth/csrf");
            const { csrfToken } = await csrfRes.json();

            // 2. POST to credentials callback directly
            // This bypasses the broken new URL() in next-auth/react signIn()
            const res = await fetch("/api/auth/callback/credentials", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Auth-Return-Redirect": "1",
                },
                body: new URLSearchParams({
                    csrfToken,
                    email: data.email,
                    password: data.password,
                    callbackUrl: "/dashboard",
                    json: "true",
                }),
            });

            const responseData = await res.json();

            if (res.ok) {
                // Check if the redirect URL contains an error
                if (responseData.url && responseData.url.includes("error")) {
                    setError("Email atau password salah.");
                } else {
                    router.push("/dashboard");
                    router.refresh();
                }
            } else {
                setError("Email atau password salah.");
            }
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-4">
                        <Boxes className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                        InvenTrack
                    </h1>
                </div>

                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Masuk</CardTitle>
                        <CardDescription>
                            Masuk ke akun Anda untuk melanjutkan
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    {...register("email")}
                                    className={errors.email ? "border-destructive" : ""}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">{errors.email.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...register("password")}
                                        className={errors.password ? "border-destructive pr-10" : "pr-10"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-destructive">{errors.password.message}</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    "Masuk"
                                )}
                            </Button>
                            <p className="text-sm text-center text-muted-foreground">
                                Belum punya akun?{" "}
                                <Link href="/register" className="text-primary font-medium hover:underline">
                                    Daftar sekarang
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
