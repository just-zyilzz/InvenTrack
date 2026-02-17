import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email harus diisi")
        .email("Format email tidak valid"),
    password: z
        .string()
        .min(1, "Password harus diisi")
        .min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z
    .object({
        name: z
            .string()
            .min(1, "Nama harus diisi")
            .min(2, "Nama minimal 2 karakter"),
        email: z
            .string()
            .min(1, "Email harus diisi")
            .email("Format email tidak valid"),
        password: z
            .string()
            .min(1, "Password harus diisi")
            .min(6, "Password minimal 6 karakter"),
        confirmPassword: z.string().min(1, "Konfirmasi password harus diisi"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Password tidak cocok",
        path: ["confirmPassword"],
    });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
