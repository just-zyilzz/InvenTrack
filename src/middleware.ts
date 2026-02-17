import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { pathname } = req.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/register", "/api/auth"];

    const isPublicRoute = publicRoutes.some((route) =>
        pathname === route || pathname.startsWith(route + "/")
    );

    const isApiRoute = pathname.startsWith("/api/");

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // If not authenticated, redirect to login or return 401
    if (!req.auth) {
        if (isApiRoute) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|images|uploads).*)",
    ],
};
