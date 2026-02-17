export default function Footer() {
    return (
        <footer className="border-t py-4 px-6">
            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                    © {new Date().getFullYear()} <span className="font-semibold text-primary">InvenTrack</span>. All rights reserved.
                </p>
                <p className="text-xs text-muted-foreground">
                    Inventory Management System v1.0
                </p>
            </div>
        </footer>
    );
}
