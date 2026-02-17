"use client";

import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Menu } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { toggleMobile } = useSidebar();

    const initials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    return (
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b bg-card/80 backdrop-blur-sm px-3 sm:px-6">
            <div className="flex items-center gap-3">
                {/* Hamburger — mobile only */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden shrink-0"
                    onClick={toggleMobile}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="min-w-0">
                    <h2 className="text-sm sm:text-lg font-semibold text-foreground truncate">
                        Halo, {user?.name || "User"}! 👋
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                        Kelola inventory Anda dengan mudah
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                {/* Notifications */}
                <NotificationDropdown />

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-400 text-primary-foreground font-semibold text-xs sm:text-sm">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <span className="flex flex-col space-y-1">
                                <span className="text-sm font-medium leading-none">{user?.name}</span>
                                <span className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </span>
                            </span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Pengaturan</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Keluar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
