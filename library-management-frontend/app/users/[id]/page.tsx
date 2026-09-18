"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import { getUserById } from "@/app/lib/api";

interface ReaderInfo {
    id: number;
    readerCode: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    dateOfBirth: string | null;
    status: string;
    createdAt: string | null;
}

interface StaffInfo {
    id: number;
    fullName: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    dateOfBirth: string | null;
    status: string;
}

interface UserDetail {
    id: number;
    username: string;
    fullName: string;
    email: string | null;
    role: string;
    status: string;
    reader: ReaderInfo | null;
    staff: StaffInfo | null;
}

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();

    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadUser() {
            try {
                const id = Number(params.id);

                if (!id) {
                    setError("Invalid user ID.");
                    return;
                }

                const data = await getUserById(id);
                setUser(data);
            } catch (error) {
                console.error(error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load user."
                );
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, [params.id]);

    const displayValue = (
        value: string | number | null | undefined
    ) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        return value;
    };

    const renderStatus = (status: string) => {
        const isActive = status === "ACTIVE";

        return (
            <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    isActive
                        ? "text-emerald-600"
                        : "text-gray-400"
                }`}
            >
                <span
                    className={`h-1.5 w-1.5 rounded-full ${
                        isActive
                            ? "bg-emerald-500"
                            : "bg-gray-300"
                    }`}
                />

                {displayValue(status)}
            </span>
        );
    };

    return (
        <RoleGuard allowedRoles={["ADMIN"]}>
            <div className="min-h-screen bg-white p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-5xl">

                    {/* Back */}
                    <button
                        type="button"
                        onClick={() => router.push("/users")}
                        className="mb-6 text-sm font-medium text-gray-500 transition hover:text-gray-900"
                    >
                        ← Back to Users
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">
                            User Detail
                        </h1>

                        <p className="mt-1 text-sm text-gray-400">
                            View account and profile information.
                        </p>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-400">
                            Loading user information...
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* User Detail */}
                    {!loading && !error && user && (
                        <div className="space-y-6">

                            {/* =========================
                                Account Information
                            ========================= */}

                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                                    <h2 className="text-sm font-semibold text-gray-900">
                                        Account Information
                                    </h2>

                                    <p className="mt-0.5 text-xs text-gray-400">
                                        Basic information of the user account.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2">

                                    {/* User ID */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">
                                            User ID
                                        </p>

                                        <p className="mt-1 font-mono text-sm text-gray-800">
                                            #{user.id}
                                        </p>
                                    </div>

                                    {/* Username */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">
                                            Username
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                            {displayValue(user.username)}
                                        </p>
                                    </div>

                                    {/* Full Name */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">
                                            Full Name
                                        </p>

                                        <p className="mt-1 text-sm text-gray-800">
                                            {displayValue(user.fullName)}
                                        </p>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">
                                            Email
                                        </p>

                                        <p className="mt-1 text-sm text-gray-800">
                                            {displayValue(user.email)}
                                        </p>
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">
                                            Role
                                        </p>

                                        <p className="mt-1">
                                            <span className="inline-flex rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                                                {displayValue(user.role)}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">
                                            Status
                                        </p>

                                        <p className="mt-1">
                                            {renderStatus(user.status)}
                                        </p>
                                    </div>

                                </div>
                            </div>

                            {/* =========================
                                Reader Information
                            ========================= */}

                            {user.role === "READER" && (
                                <div className="overflow-hidden rounded-xl border border-gray-200">

                                    <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                                        <h2 className="text-sm font-semibold text-gray-900">
                                            Reader Information
                                        </h2>

                                        <p className="mt-0.5 text-xs text-gray-400">
                                            Reader profile linked to this account.
                                        </p>
                                    </div>

                                    {!user.reader ? (
                                        <div className="p-6 text-sm text-gray-400">
                                            This user is not linked to a reader.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2">

                                            {/* Reader ID */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Reader ID
                                                </p>

                                                <p className="mt-1 font-mono text-sm text-gray-800">
                                                    #{displayValue(
                                                    user.reader.id
                                                )}
                                                </p>
                                            </div>

                                            {/* Reader Code */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Reader Code
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    {displayValue(
                                                        user.reader.readerCode
                                                    )}
                                                </p>
                                            </div>

                                            {/* Full Name */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Full Name
                                                </p>

                                                <p className="mt-1 text-sm text-gray-800">
                                                    {displayValue(
                                                        user.reader.fullName
                                                    )}
                                                </p>
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Email
                                                </p>

                                                <p className="mt-1 text-sm text-gray-800">
                                                    {displayValue(
                                                        user.reader.email
                                                    )}
                                                </p>
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Phone
                                                </p>

                                                <p className="mt-1 text-sm text-gray-800">
                                                    {displayValue(
                                                        user.reader.phone
                                                    )}
                                                </p>
                                            </div>

                                            {/* Date of Birth */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Date of Birth
                                                </p>

                                                <p className="mt-1 text-sm text-gray-800">
                                                    {displayValue(
                                                        user.reader.dateOfBirth
                                                    )}
                                                </p>
                                            </div>

                                            {/* Address */}
                                            <div className="sm:col-span-2">
                                                <p className="text-xs font-medium text-gray-400">
                                                    Address
                                                </p>

                                                <p className="mt-1 text-sm text-gray-800">
                                                    {displayValue(
                                                        user.reader.address
                                                    )}
                                                </p>
                                            </div>

                                            {/* Reader Status */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Reader Status
                                                </p>

                                                <p className="mt-1">
                                                    {renderStatus(
                                                        user.reader.status
                                                    )}
                                                </p>
                                            </div>

                                            {/* Created At */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Created At
                                                </p>

                                                <p className="mt-1 text-sm text-gray-800">
                                                    {displayValue(
                                                        user.reader.createdAt
                                                    )}
                                                </p>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            )}

                            {/* =========================
                                Staff Information
                            ========================= */}

                            {user.role === "LIBRARIAN" && (
                                <div className="overflow-hidden rounded-xl border border-gray-200">

                                    <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                                        <h2 className="text-sm font-semibold text-gray-900">
                                            Staff Information
                                        </h2>

                                        <p className="mt-0.5 text-xs text-gray-400">
                                            Staff profile linked to this account.
                                        </p>
                                    </div>

                                    {!user.staff ? (
                                        <div className="p-6 text-sm text-gray-400">
                                            This user is not linked to a staff profile.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2">

                                            {/* Staff ID */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Staff ID
                                                </p>

                                                <p className="mt-1 font-mono text-sm text-gray-800">
                                                    #{displayValue(
                                                    user.staff.id
                                                )}
                                                </p>
                                            </div>

                                            {/* Full Name */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Full Name
                                                </p>

                                                <p className="mt-1 text-sm text-gray-800">
                                                    {displayValue(
                                                        user.staff.fullName
                                                    )}
                                                </p>
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Email
                                                </p>

                                                <p className="mt-1 text-sm text-gray-800">
                                                    {displayValue(
                                                        user.staff.email
                                                    )}
                                                </p>
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Phone
                                                </p>

                                                <p className="mt-1 text-sm text-gray-800">
                                                    {displayValue(
                                                        user.staff.phone
                                                    )}
                                                </p>
                                            </div>

                                            {/* Date of Birth */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Date of Birth
                                                </p>

                                                <p className="mt-1 text-sm text-gray-800">
                                                    {displayValue(
                                                        user.staff.dateOfBirth
                                                    )}
                                                </p>
                                            </div>

                                            {/* Address */}
                                            <div className="sm:col-span-2">
                                                <p className="text-xs font-medium text-gray-400">
                                                    Address
                                                </p>

                                                <p className="mt-1 text-sm text-gray-800">
                                                    {displayValue(
                                                        user.staff.address
                                                    )}
                                                </p>
                                            </div>

                                            {/* Staff Status */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Staff Status
                                                </p>

                                                <p className="mt-1">
                                                    {renderStatus(
                                                        user.staff.status
                                                    )}
                                                </p>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    )}

                </div>
            </div>
        </RoleGuard>
    );
}