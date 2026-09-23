"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import { getStaffDashboard } from "@/app/lib/api";

export default function StaffHomePage() {
    const router = useRouter();
    const [dashboard, setDashboard] = useState<any>(null);

    useEffect(() => {
        getStaffDashboard()
            .then((data) => {
                setDashboard(data);
            })
            .catch((error) => {
                console.error("Failed to load staff dashboard:", error);
            });
    }, []);

    return (
        <RoleGuard allowedRoles={["LIBRARIAN", "ADMIN"]}>
            <div className="min-h-screen w-full bg-[#fafafa] p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* ── Operations Header Card ── */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-7">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Active Workshift
                                    </span>
                                </div>
                                <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                    Librarian Operations Hub
                                </h1>
                                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                    Circulation overview, quick actions, and daily library management metrics.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-600 sm:self-auto">
                                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.253M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                <span>Circulation Desk</span>
                            </div>
                        </div>
                    </div>

                    {/* ── 5 Statistics Cards ── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {/* 1. Books */}
                        <div
                            onClick={() => router.push("/books")}
                            className="group flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Catalog Titles
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                        {dashboard?.totalBooks ?? 0}
                                    </p>
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:bg-slate-100">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-3 text-[11px] text-slate-400">Manage titles & authors</p>
                        </div>

                        {/* 2. Book Copies */}
                        <div
                            onClick={() => router.push("/book-copies")}
                            className="group flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Physical Copies
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                        {dashboard?.totalBookCopies ?? 0}
                                    </p>
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:bg-slate-100">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v15H6.5A2.5 2.5 0 014 14.5v-10A2.5 2.5 0 016.5 2z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-3 text-[11px] text-slate-400">Barcode inventory</p>
                        </div>

                        {/* 3. Readers */}
                        <div
                            onClick={() => router.push("/staff/readers")}
                            className="group flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Patrons & Readers
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                        {dashboard?.totalReaders ?? 0}
                                    </p>
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:bg-slate-100">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-3 text-[11px] text-slate-400">Registered members</p>
                        </div>

                        {/* 4. Borrowings */}
                        <div
                            onClick={() => router.push("/borrowings")}
                            className="group flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Active Loans
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                        {dashboard?.totalBorrowings ?? 0}
                                    </p>
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:bg-slate-100">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-3 text-[11px] text-slate-400">Circulation records</p>
                        </div>

                        {/* 5. Returns */}
                        <div
                            onClick={() => router.push("/staff/return-history")}
                            className="group flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Processed Returns
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                        {dashboard?.totalReturns ?? 0}
                                    </p>
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:bg-slate-100">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-3 text-[11px] text-slate-400">Check-in archive</p>
                        </div>
                    </div>

                    {/* ── Quick Actions Grid ── */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Operations Quick Actions
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Instant shortcuts to frequent librarian workflows
                                </p>
                            </div>
                            <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                Shortcuts
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Action 1: Create Borrowing / Circulation */}
                            <button
                                type="button"
                                onClick={() => router.push("/borrowings")}
                                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50/60"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold text-slate-900 sm:text-sm">
                                            Issue Loan
                                        </span>
                                        <span className="block text-[11px] text-slate-400">
                                            New borrowing record
                                        </span>
                                    </div>
                                </div>
                                <svg className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>

                            {/* Action 2: Process Return / Check-In Desk */}
                            <button
                                type="button"
                                onClick={() => router.push("/staff/returns")}
                                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50/60"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold text-slate-900 sm:text-sm">
                                            Check In Book
                                        </span>
                                        <span className="block text-[11px] text-slate-400">
                                            Process returned copies
                                        </span>
                                    </div>
                                </div>
                                <svg className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>

                            {/* Action 3: View Readers Directory */}
                            <button
                                type="button"
                                onClick={() => router.push("/staff/readers")}
                                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50/60"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold text-slate-900 sm:text-sm">
                                            Patron Registry
                                        </span>
                                        <span className="block text-[11px] text-slate-400">
                                            Browse & manage readers
                                        </span>
                                    </div>
                                </div>
                                <svg className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>

                            {/* Action 4: Return History Ledger */}
                            <button
                                type="button"
                                onClick={() => router.push("/staff/return-history")}
                                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50/60"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold text-slate-900 sm:text-sm">
                                            Return History
                                        </span>
                                        <span className="block text-[11px] text-slate-400">
                                            Audit circulation logs
                                        </span>
                                    </div>
                                </div>
                                <svg className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </RoleGuard>
    );
}