"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserRole } from "@/app/lib/api";

interface RoleGuardProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

export default function RoleGuard({
                                      allowedRoles,
                                      children,
                                  }: RoleGuardProps) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const role = getCurrentUserRole();

        if (!role) {
            router.replace("/login");
            return;
        }

        if (!allowedRoles.includes(role)) {
            router.replace("/unauthorized");
            return;
        }

        setAuthorized(true);
    }, [allowedRoles, router]);

    if (!authorized) {
        return null;
    }

    return <>{children}</>;
}