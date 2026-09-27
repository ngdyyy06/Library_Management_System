"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import {
    getBorrowingsByReaderId,
    getBorrowingDetails,
} from "@/app/lib/api";

interface Reader {
    id: number;
    readerCode: string;
    fullName: string;
    email?: string;
    phone?: string;
}

interface Borrowing {
    id: number;
    reader: Reader;
    borrowedAt: string;
    dueDate: string;
    status: string;
    renewalCount: number;
    depositAmount: number;
}

interface BorrowingDetail {
    id: number;
    quantity: number;
    goodQuantity: number;
    damagedQuantity: number;
    lostQuantity: number;
    returnedAt: string | null;
    fine: number;
    damageFine: number;
}

interface BorrowingSummary extends Borrowing {
    bookQuantity: number;
    fine: number;
    damageFine: number;
    totalFine: number;
}

type FilterType =
    | "ALL"
    | "BORROWING"
    | "OVERDUE"
    | "PARTIALLY_RETURNED"
    | "RETURNED";

export default function ReaderBorrowingHistoryPage() {
    const params = useParams();
    const router = useRouter();

    const readerId = Number(params.readerId);

    const [borrowings, setBorrowings] = useState<BorrowingSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filter, setFilter] =
        useState<FilterType>("ALL");

    useEffect(() => {
        if (!readerId || Number.isNaN(readerId)) {
            setError("Invalid reader ID.");
            setLoading(false);
            return;
        }

        loadBorrowings();
    }, [readerId]);

    async function loadBorrowings() {
        try {
            setLoading(true);
            setError("");

            const data =
                await getBorrowingsByReaderId(readerId);

            const borrowingList: Borrowing[] =
                data || [];

            const summaries: BorrowingSummary[] =
                await Promise.all(
                    borrowingList.map(
                        async (borrowing) => {
                            try {
                                const details =
                                    await getBorrowingDetails(
                                        borrowing.id
                                    );

                                const detailList:
                                    BorrowingDetail[] =
                                    details || [];

                                const bookQuantity =
                                    detailList.reduce(
                                        (sum, detail) =>
                                            sum +
                                            (detail.quantity || 0),
                                        0
                                    );

                                const fine =
                                    detailList.reduce(
                                        (sum, detail) =>
                                            sum +
                                            (Number(detail.fine) || 0),
                                        0
                                    );

                                const damageFine =
                                    detailList.reduce(
                                        (sum, detail) =>
                                            sum +
                                            (Number(detail.damageFine) || 0),
                                        0
                                    );

                                return {
                                    ...borrowing,
                                    bookQuantity,
                                    fine,
                                    damageFine,
                                    totalFine:
                                        fine + damageFine,
                                };
                            } catch (detailError) {
                                console.error(
                                    `Failed to load details for borrowing ${borrowing.id}:`,
                                    detailError
                                );

                                return {
                                    ...borrowing,
                                    bookQuantity: 0,
                                    fine: 0,
                                    damageFine: 0,
                                    totalFine: 0,
                                };
                            }
                        }
                    )
                );

            setBorrowings(summaries);
        } catch (err: any) {
            console.error(
                "Failed to load borrowing history:",
                err
            );

            setError(
                err?.message ||
                "Failed to load borrowing history."
            );
        } finally {
            setLoading(false);
        }
    }

    const reader = borrowings[0]?.reader;

    const filteredBorrowings = useMemo(() => {
        return borrowings.filter((borrowing) => {
            const status =
                borrowing.status?.toUpperCase();

            if (filter === "ALL") {
                return true;
            }

            if (filter === "OVERDUE") {
                return status === "OVERDUE";
            }

            return status === filter;
        });
    }, [borrowings, filter]);

    const totalBorrowings =
        borrowings.length;

    const currentBorrowings =
        borrowings.filter((item) =>
            [
                "BORROWING",
                "PARTIALLY_RETURNED",
            ].includes(
                item.status?.toUpperCase()
            )
        ).length;

    const overdueBorrowings =
        borrowings.filter(
            (item) =>
                item.status?.toUpperCase() === "OVERDUE"
        ).length;

    const returnedBorrowings =
        borrowings.filter(
            (item) =>
                item.status?.toUpperCase() === "RETURNED"
        ).length;

    const totalFine =
        borrowings.reduce(
            (sum, item) =>
                sum + (item.totalFine || 0),
            0
        );

    function formatDateTime(value: string) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function formatDate(value: string) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    function formatMoney(value: number) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(Number(value) || 0);
    }

    function getStatusClass(status: string) {
        switch (status?.toUpperCase()) {
            case "BORROWING":
                return "border-blue-200 bg-blue-50 text-blue-700";

            case "OVERDUE":
                return "border-red-200 bg-red-50 text-red-700";

            case "PARTIALLY_RETURNED":
                return "border-amber-200 bg-amber-50 text-amber-700";

            case "RETURNED":
                return "border-emerald-200 bg-emerald-50 text-emerald-700";

            default:
                return "border-slate-200 bg-slate-50 text-slate-600";
        }
    }

    function getStatusLabel(status: string) {
        switch (status?.toUpperCase()) {
            case "BORROWING":
                return "Borrowing";

            case "OVERDUE":
                return "Overdue";

            case "PARTIALLY_RETURNED":
                return "Partially Returned";

            case "RETURNED":
                return "Returned";

            default:
                return status || "Unknown";
        }
    }

    return (
        <RoleGuard allowedRoles={["LIBRARIAN", "ADMIN"]}>
            <div className="min-h-screen w-full bg-[#fafafa] p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-900"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>

                                Back
                            </button>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                    Borrowing History
                                </h1>

                                {reader && (
                                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs">
                                        {reader.readerCode}
                                    </span>
                                )}
                            </div>

                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                View all borrowing records for this reader.
                            </p>
                        </div>
                    </div>

                    {/* Reader Information */}
                    {reader && (
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <p className="text-xs text-slate-500">
                                        Reader Code
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                        {reader.readerCode}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Full Name
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                        {reader.fullName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Email
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                        {reader.email || "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                        {reader.phone || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-medium text-slate-500">
                                Total Borrowings
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-slate-900">
                                {totalBorrowings}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-medium text-slate-500">
                                Currently Borrowed
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-slate-900">
                                {currentBorrowings}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-medium text-slate-500">
                                Overdue
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-red-600">
                                {overdueBorrowings}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-medium text-slate-500">
                                Returned
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-emerald-600">
                                {returnedBorrowings}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-medium text-slate-500">
                                Total Fine
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-slate-900">
                                {formatMoney(totalFine)}
                            </p>
                        </div>

                    </div>

                    {/* Filter */}
                    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                        {(
                            [
                                ["ALL", "All"],
                                ["BORROWING", "Borrowing"],
                                ["OVERDUE", "Overdue"],
                                [
                                    "PARTIALLY_RETURNED",
                                    "Partially Returned",
                                ],
                                ["RETURNED", "Returned"],
                            ] as [FilterType, string][]
                        ).map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() =>
                                    setFilter(value)
                                }
                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                    filter === value
                                        ? "border-slate-900 bg-slate-900 text-white"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                                }`}
                            >
                                {label}
                            </button>
                        ))}

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                            <p className="text-sm text-slate-500">
                                Loading borrowing history...
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                            {filteredBorrowings.length === 0 ? (
                                <div className="p-10 text-center">
                                    <p className="text-sm font-medium text-slate-700">
                                        No borrowing records found.
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        There are no records matching the selected filter.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1150px] text-left">
                                        <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr>
                                            <th className="px-5 py-3 text-xs font-semibold text-slate-600">
                                                Borrowing ID
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold text-slate-600">
                                                Books
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold text-slate-600">
                                                Borrowed At
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold text-slate-600">
                                                Due Date
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold text-slate-600">
                                                Status
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold text-slate-600">
                                                Renewals
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold text-slate-600">
                                                Fine
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold text-slate-600">
                                                Damage Fine
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold text-slate-600">
                                                Total Fine
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600">
                                                Action
                                            </th>
                                        </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                        {filteredBorrowings.map(
                                            (borrowing) => (
                                                <tr
                                                    key={borrowing.id}
                                                    className="transition hover:bg-slate-50"
                                                >
                                                    <td className="px-5 py-4">
                                                            <span className="text-sm font-medium text-slate-900">
                                                                #{borrowing.id}
                                                            </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                            <span className="text-sm font-medium text-slate-700">
                                                                {borrowing.bookQuantity}
                                                            </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                            <span className="text-sm text-slate-700">
                                                                {formatDateTime(
                                                                    borrowing.borrowedAt
                                                                )}
                                                            </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                            <span className="text-sm text-slate-700">
                                                                {formatDate(
                                                                    borrowing.dueDate
                                                                )}
                                                            </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                            <span
                                                                className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-medium ${getStatusClass(
                                                                    borrowing.status
                                                                )}`}
                                                            >
                                                                {getStatusLabel(
                                                                    borrowing.status
                                                                )}
                                                            </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                            <span className="text-sm text-slate-700">
                                                                {borrowing.renewalCount ?? 0}
                                                            </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                            <span className="text-sm text-slate-700">
                                                                {formatMoney(
                                                                    borrowing.fine
                                                                )}
                                                            </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                            <span className="text-sm text-slate-700">
                                                                {formatMoney(
                                                                    borrowing.damageFine
                                                                )}
                                                            </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                            <span
                                                                className={`text-sm font-medium ${
                                                                    borrowing.totalFine > 0
                                                                        ? "text-red-600"
                                                                        : "text-slate-700"
                                                                }`}
                                                            >
                                                                {formatMoney(
                                                                    borrowing.totalFine
                                                                )}
                                                            </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/borrowings/${borrowing.id}`
                                                                )
                                                            }
                                                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </div>
                    )}

                </div>
            </div>
        </RoleGuard>
    );
}