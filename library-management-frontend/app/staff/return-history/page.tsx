"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import { getBorrowings } from "@/app/lib/api";

interface Reader {
    id: number;
    readerCode: string;
    fullName: string;
}

interface Book {
    id: number;
    title: string;
    isbn: string;
}

interface BookCopy {
    id: number;
    barcode: string;
    book: Book;
}

interface Borrowing {
    id: number;
    reader: Reader;
    borrowedAt: string;
    dueDate: string;
    status: string;
}

interface BorrowingDetail {
    id: number;
    borrowing: Borrowing;
    bookCopy: BookCopy;
    returnedAt: string | null;
    fine: number;
    damageFine: number;
}

interface ReturnHistoryItem {
    id: number;
    borrowingId: number;
    reader: Reader;
    book: Book;
    barcode: string;
    borrowedAt: string;
    dueDate: string;
    returnedAt: string;
    fine: number;
    damageFine: number;
}

export default function ReturnHistoryPage() {
    const router = useRouter();

    const [history, setHistory] = useState<ReturnHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [fineFilter, setFineFilter] = useState<"ALL" | "OVERDUE_ONLY" | "DAMAGE_ONLY" | "NO_FINE">("ALL");

    const loadReturnHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const borrowings: Borrowing[] = await getBorrowings();
            const token = localStorage.getItem("token");

            // Fetch borrowing details concurrently in parallel batches
            const detailPromises = (borrowings || []).map(async (borrowing) => {
                try {
                    const response = await fetch(
                        `http://localhost:8080/api/borrowings/${borrowing.id}/details`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (!response.ok) return [];
                    const details: BorrowingDetail[] = await response.json();
                    return details.map((detail) => ({
                        ...detail,
                        borrowingParentId: borrowing.id,
                    }));
                } catch {
                    return [];
                }
            });

            const results = await Promise.all(detailPromises);
            const allDetails = results.flat();

            const returnedItems: ReturnHistoryItem[] = allDetails
                .filter((detail) => detail.returnedAt !== null)
                .map((detail: any) => ({
                    id: detail.id,
                    borrowingId: detail.borrowing?.id || detail.borrowingParentId,
                    reader: detail.borrowing?.reader || {
                        id: 0,
                        readerCode: "N/A",
                        fullName: "General Patron",
                    },
                    book: detail.bookCopy?.book || {
                        id: 0,
                        title: "Untitled Catalog",
                        isbn: "N/A",
                    },
                    barcode: detail.bookCopy?.barcode || "N/A",
                    borrowedAt: detail.borrowing?.borrowedAt || detail.borrowedAt || "",
                    dueDate: detail.borrowing?.dueDate || detail.dueDate || "",
                    returnedAt: detail.returnedAt!,
                    fine: detail.fine || 0,
                    damageFine: detail.damageFine || 0,
                }))
                .sort(
                    (a, b) =>
                        new Date(b.returnedAt).getTime() -
                        new Date(a.returnedAt).getTime()
                );

            setHistory(returnedItems);
        } catch (err: any) {
            console.error("Failed to load return history:", err);
            setError(err?.message || "Failed to load complete return history ledger.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReturnHistory();
    }, []);

    // Filter Logic
    const filteredHistory = useMemo(() => {
        return history.filter((item) => {
            const keyword = searchTerm.trim().toLowerCase();
            const matchesSearch =
                !keyword ||
                item.reader?.fullName?.toLowerCase().includes(keyword) ||
                item.reader?.readerCode?.toLowerCase().includes(keyword) ||
                item.book?.title?.toLowerCase().includes(keyword) ||
                item.book?.isbn?.toLowerCase().includes(keyword) ||
                item.barcode?.toLowerCase().includes(keyword);

            let matchesFine = true;
            if (fineFilter === "OVERDUE_ONLY") {
                matchesFine = item.fine > 0;
            } else if (fineFilter === "DAMAGE_ONLY") {
                matchesFine = item.damageFine > 0;
            } else if (fineFilter === "NO_FINE") {
                matchesFine = item.fine === 0 && item.damageFine === 0;
            }

            return matchesSearch && matchesFine;
        });
    }, [history, searchTerm, fineFilter]);

    // Financial calculations
    const totalReturns = history.length;
    const totalOverdueFine = history.reduce((sum, item) => sum + (item.fine || 0), 0);
    const totalDamageFine = history.reduce((sum, item) => sum + (item.damageFine || 0), 0);
    const totalRevenue = totalOverdueFine + totalDamageFine;

    function formatCurrency(val: number) {
        return new Intl.NumberFormat("vi-VN").format(val || 0);
    }

    const formatDateTime = (value: string) => {
        if (!value) return "—";
        return new Date(value).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (value: string) => {
        if (!value) return "—";
        return new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <RoleGuard allowedRoles={["LIBRARIAN", "ADMIN"]}>
            <div className="min-h-screen w-full bg-[#fafafa] p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* ── Page Header ── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                    Return History
                                </h1>
                                <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs">
                                    Archive Ledger
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                Audit ledger of all returned books, condition assessments, and collected fines.
                            </p>
                        </div>

                        {/* Refresh Button */}
                        <button
                            type="button"
                            onClick={loadReturnHistory}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 sm:self-auto sm:text-sm"
                        >
                            <svg
                                className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin text-slate-900" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                            </svg>
                            Refresh Log
                        </button>
                    </div>

                    {/* ── Error Banner ── */}
                    {error && (
                        <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-3 text-xs text-rose-700 sm:text-sm">
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setError("")}
                                className="text-xs font-medium text-rose-600 hover:text-rose-800"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* ── 3-Metric Statistics Strip ── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Total Returns */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">Confirmed Returns</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                {totalReturns}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">Total physical copies restocked</p>
                        </div>

                        {/* Overdue Fines */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">Overdue Fines</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">
                                {formatCurrency(totalOverdueFine)}{" "}
                                <span className="text-xs font-normal text-slate-400">₫</span>
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">Late return restitution</p>
                        </div>

                        {/* Damage & Total Penalties */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">Damage/Lost Penalties</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-rose-600">
                                {formatCurrency(totalDamageFine)}{" "}
                                <span className="text-xs font-normal text-slate-400">₫</span>
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Total penalties: {formatCurrency(totalRevenue)} ₫
                            </p>
                        </div>
                    </div>

                    {/* ── Main Container: Search, Filter & Audit Table ── */}
                    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
                        {/* Filter Bar */}
                        <div className="border-b border-slate-100 p-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="relative sm:col-span-2">
                                    <svg
                                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                        />
                                    </svg>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by patron name, code, title, ISBN, or barcode..."
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                    />
                                </div>

                                <select
                                    value={fineFilter}
                                    onChange={(e) => setFineFilter(e.target.value as any)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                >
                                    <option value="ALL">All Return Records</option>
                                    <option value="OVERDUE_ONLY">With Overdue Fines</option>
                                    <option value="DAMAGE_ONLY">With Damage Penalties</option>
                                    <option value="NO_FINE">Clean Returns (Zero Fines)</option>
                                </select>
                            </div>
                        </div>

                        {/* Audit Table */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                                <p className="mt-3 text-xs text-slate-500">
                                    Compiling return history records...
                                </p>
                            </div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-800">No return records found</p>
                                <p className="mt-0.5 text-xs text-slate-400">No items match your filter criteria.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px] border-collapse text-left">
                                    <thead className="border-b border-slate-100 bg-slate-50/50">
                                    <tr>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Patron
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Book & Barcode
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Borrowed
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Due Date
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Returned At
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Overdue Fine
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Damage Fine
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                    {filteredHistory.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="transition-colors hover:bg-slate-50/70"
                                        >
                                            {/* Reader */}
                                            <td className="px-5 py-3.5">
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => router.push(`/staff/readers/${item.reader.id}`)}
                                                        className="font-medium text-slate-900 transition hover:underline"
                                                    >
                                                        {item.reader.fullName}
                                                    </button>
                                                    <p className="font-mono text-[11px] text-slate-400">
                                                        {item.reader.readerCode}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Book & Barcode */}
                                            <td className="px-5 py-3.5">
                                                <div>
                                                    <p className="font-medium text-slate-900 line-clamp-1">
                                                        {item.book.title}
                                                    </p>
                                                    <div className="mt-0.5 flex items-center gap-2 text-xs">
                                                            <span className="font-mono text-[11px] text-slate-400">
                                                                {item.book.isbn}
                                                            </span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[10px] font-medium text-slate-600">
                                                                {item.barcode}
                                                            </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Borrowed At */}
                                            <td className="px-5 py-3.5 text-slate-600">
                                                {formatDateTime(item.borrowedAt)}
                                            </td>

                                            {/* Due Date */}
                                            <td className="px-5 py-3.5 text-slate-700 font-medium">
                                                {formatDate(item.dueDate)}
                                            </td>

                                            {/* Returned At */}
                                            <td className="px-5 py-3.5 font-medium text-slate-900">
                                                {formatDateTime(item.returnedAt)}
                                            </td>

                                            {/* Overdue Fine */}
                                            <td className="px-5 py-3.5">
                                                {item.fine > 0 ? (
                                                    <span className="font-semibold text-rose-600">
                                                            {formatCurrency(item.fine)} ₫
                                                        </span>
                                                ) : (
                                                    <span className="text-slate-400">0 ₫</span>
                                                )}
                                            </td>

                                            {/* Damage Fine */}
                                            <td className="px-5 py-3.5">
                                                {item.damageFine > 0 ? (
                                                    <span className="font-semibold text-rose-600">
                                                            {formatCurrency(item.damageFine)} ₫
                                                        </span>
                                                ) : (
                                                    <span className="text-slate-400">0 ₫</span>
                                                )}
                                            </td>

                                            {/* Status Pill */}
                                            <td className="px-5 py-3.5">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Returned
                                                    </span>
                                            </td>

                                            {/* Action */}
                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/borrowings/${item.borrowingId}`)}
                                                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
                                                >
                                                    View Loan
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}