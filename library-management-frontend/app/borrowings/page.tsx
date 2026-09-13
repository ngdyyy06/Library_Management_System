"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/app/components/RoleGuard";
import { getBorrowings } from "@/app/lib/api";
import { useRouter } from "next/navigation";

export default function BorrowingsPage() {
    const [borrowings, setBorrowings] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const router = useRouter();

    useEffect(() => {
        getBorrowings()
            .then((data) => {
                setBorrowings(data);
            })
            .catch((error) => {
                console.error("Failed to load borrowings:", error);
            });
    }, []);

    // Filter logic
    const filteredBorrowings = borrowings.filter((b) => {
        const matchesSearch =
            (b.reader?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(b.id).includes(searchTerm);

        const matchesStatus =
            statusFilter === "ALL" || b.status?.toUpperCase() === statusFilter.toUpperCase();

        return matchesSearch && matchesStatus;
    });

    // Quick stats
    const totalCount = borrowings.length;
    const activeCount = borrowings.filter((b) => b.status === "BORROWED" || b.status === "ACTIVE").length;
    const overdueCount = borrowings.filter((b) => b.status === "OVERDUE").length;

    // Helper render status badge
    const renderStatusBadge = (status: string) => {
        const normalized = (status || "").toUpperCase();
        switch (normalized) {
            case "BORROWED":
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {status}
                    </span>
                );
            case "RETURNED":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {status}
                    </span>
                );
            case "OVERDUE":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        {status}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                        {status || "—"}
                    </span>
                );
        }
    };

    return (
        <RoleGuard allowedRoles={["ADMIN", "LIBRARIAN"]}>
            <div className="min-h-screen bg-slate-50 p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-7xl space-y-8">

                    {/* ── Page Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                    Borrowing Management
                                </h1>
                                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/80">
                                    Circulation
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                                Monitor circulation records, due dates, and book returns.
                            </p>
                        </div>
                    </div>

                    {/* ── Quick Stats Strip ── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Total Records
                            </p>
                            <p className="mt-2 text-2xl font-extrabold text-slate-900">
                                {totalCount}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">All-time borrowing entries</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                                Active Borrowed
                            </p>
                            <p className="mt-2 text-2xl font-extrabold text-amber-700">
                                {activeCount}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">Currently in circulation</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
                                Overdue
                            </p>
                            <p className="mt-2 text-2xl font-extrabold text-rose-700">
                                {overdueCount}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">Exceeded due dates</p>
                        </div>
                    </div>

                    {/* ── Main Table Card ── */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

                        {/* Table Subtitle */}
                        <div className="border-b border-slate-100 px-6 py-5">
                            <h2 className="text-base font-bold text-slate-900">
                                Borrowing Records Directory
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-400">
                                Showing {filteredBorrowings.length} of {borrowings.length} records
                            </p>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col gap-3.5 border-b border-slate-100 bg-slate-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1 sm:max-w-md">
                                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.15 6.15a7.5 7.5 0 0 0 10.5 10.5z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by reader name or #ID..."
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 outline-none transition-all duration-150 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="BORROWING">Borrowed</option>
                                    <option value="PARTIALLY_RETURNED">Partially Returned</option>
                                    <option value="OVERDUE">Overdue</option>
                                    <option value="RETURNED">Returned</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-6 py-3.5">ID</th>
                                    <th className="px-6 py-3.5">Reader</th>
                                    <th className="px-6 py-3.5">Borrowed At</th>
                                    <th className="px-6 py-3.5">Due Date</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-center">Renewals</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {filteredBorrowings.map((borrowing) => {
                                    const readerInitial = (borrowing.reader?.fullName || "R").charAt(0).toUpperCase();

                                    return (
                                        <tr
                                            key={borrowing.id}
                                            className="transition-colors duration-150 hover:bg-slate-50/70"
                                        >
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                                                #{borrowing.id}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 text-xs font-bold text-white shadow-sm">
                                                        {readerInitial}
                                                    </div>
                                                    <span className="font-semibold text-slate-800">
                                                            {borrowing.reader?.fullName ?? "—"}
                                                        </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-xs font-medium text-slate-600">
                                                {borrowing.borrowedAt
                                                    ? new Date(borrowing.borrowedAt).toLocaleString("vi-VN")
                                                    : "—"}
                                            </td>

                                            <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                                                {borrowing.dueDate ?? "—"}
                                            </td>

                                            <td className="px-6 py-4">
                                                {renderStatusBadge(borrowing.status)}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                                        {borrowing.renewalCount ?? 0}
                                                    </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/borrowings/${borrowing.id}`)}
                                                    className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-600 active:translate-y-0"
                                                >
                                                    <span>View Detail</span>
                                                    <svg className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredBorrowings.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.121 5.121A1 1 0 0118 9.121V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <p className="mt-3 text-sm font-semibold text-slate-700">No borrowing records found</p>
                                            <p className="mt-1 text-xs text-slate-400">Try adjusting your search criteria or status filter.</p>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </RoleGuard>
    );
}