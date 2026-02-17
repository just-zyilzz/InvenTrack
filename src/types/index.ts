import { Product, Category, Transaction, TransactionItem, Debt, User } from "@prisma/client";

export type ProductWithCategory = Product & {
    category: Category | null;
    createdBy: Pick<User, "id" | "name">;
};

export type TransactionWithItems = Transaction & {
    items: (TransactionItem & {
        product: Pick<Product, "id" | "name" | "sku">;
    })[];
    createdBy: Pick<User, "id" | "name">;
    debt: Debt | null;
};

export type DebtWithTransaction = Debt & {
    transaction: (Transaction & {
        items: (TransactionItem & {
            product: Pick<Product, "id" | "name">;
        })[];
    }) | null;
};

export type DashboardStats = {
    totalProducts: number;
    lowStockProducts: number;
    totalSales: number;
    totalPurchases: number;
    totalRevenue: number;
    totalExpenses: number;
    recentTransactions: TransactionWithItems[];
    monthlySales: { month: string; total: number }[];
};

export type ApiResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};

export type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};
