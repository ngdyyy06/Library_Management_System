"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminNavbar from "./admin/AdminNavbar";
import StaffNavbar from "./staff/StaffNavbar";
import ReaderNavbar from "./reader/ReaderNavbar";
import { getCurrentUserRole } from "@/app/lib/api";

export default function AppLayout({
                                      children,
                                  }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        setRole(getCurrentUserRole());
    }, []);

    const isLoginPage = pathname === "/login";
    const isRegisterPage = pathname === "/register";

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (isRegisterPage) {
        return <>{children}</>;
    }

    return (
        <>
            {role === "ADMIN" && <AdminNavbar />}
            {role === "LIBRARIAN" && <StaffNavbar />}
            {role === "READER" && <ReaderNavbar />}

            <main className="ml-64 min-h-screen">
                {children}
            </main>
        </>
    );
}