"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import { getReaderById, getBorrowings } from "@/app/lib/api";

export default function ReaderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const [reader, setReader] = useState<any>(null);
    const [borrowings, setBorrowings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        async function fetchReaderDossier() {
            try {
                setLoading(true);
                setError("");

                const [readerData, allBorrowings] = await Promise.all([
                    getReaderById(id),
                    getBorrowings().catch(() => []),
                ]);

                setReader(readerData);

                // Filter borrowings belonging to this reader
                const readerLoans = (allBorrowings || []).filter(
                    (b: any) =>
                        Number(b?.reader?.id) === id ||
                        Number(b?.readerId) === id ||
                        b?.reader?.readerCode === readerData?.readerCode
                );

                setBorrowings(readerLoans);
            } catch (err: any) {
                console.error("Failed to load reader dossier:", err);
                setError(err?.message || "Failed to load reader circulation information.");
            } finally {
                setLoading(false);
            }
        }
        fetchReaderDossier();
    }, [id]);

    // Active loans (BORROWING or OVERDUE)
    const activeLoans = useMemo(() => {
        return borrowings.filter(
            (b) => b.status === "BORROWING" || b.status === "OVERDUE"
        );
    }, [borrowings]);

    // Returned or completed loans
    const pastLoans = useMemo(() => {
        return borrowings.filter(
            (b) => b.status !== "BORROWING" && b.status !== "OVERDUE"
        );
    }, [borrowings]);

    function formatCurrency(val: number) {
        return new Intl.NumberFormat("vi-VN").format(val || 0);
    }

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-[#fafafa] p-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                    <p className="text-xs font-medium text-slate-500">
                        Loading reader profile...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !reader) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-[#fafafa] p-6">
                <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-slate-900">Reader Not Found</h2>
                    <p className="mt-1 text-xs text-slate-500">{error || "The requested reader profile could not be loaded."}</p>
                    <button
                        type="button"
                        onClick={() => router.push("/staff/readers")}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800"
                    >
                        Back to Readers
                    </button>
                </div>
            </div>
        );
    }

    const isActive = reader.status === "ACTIVE";

    return (
        <RoleGuard allowedRoles={["LIBRARIAN", "ADMIN"]}>
            <div className="min-h-screen w-full bg-[#fafafa] p-6 lg:p-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    {/* ── Breadcrumb & Navigation ── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <button
                                    type="button"
                                    onClick={() => router.push("/staff/readers")}
                                    className="transition hover:text-slate-900"
                                >
                                    Readers
                                </button>
                                <span>/</span>
                                <span className="font-medium text-slate-700">
                                    {reader.readerCode}
                                </span>
                            </div>
                            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                Reader Details
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Back
                        </button>
                    </div>

                    {/* ── Clean Profile Header Card ── */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                            <div className="flex items-start gap-4">
                                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                                            {reader.fullName}
                                        </h2>
                                        <span className="font-mono text-xs font-medium text-slate-500">
                                            ({reader.readerCode})
                                        </span>
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                        <span>Phone: {reader.phone || "—"}</span>
                                        <span>•</span>
                                        <span>Email: {reader.email || "—"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                                        isActive
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            isActive ? "bg-emerald-500" : "bg-slate-400"
                                        }`}
                                    />
                                    {isActive ? "Active Account" : "Inactive Account"}
                                </span>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1 text-right">
                                    <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                                        Active Loans
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {activeLoans.length} <span className="text-xs font-normal text-slate-500">books</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── 3-Metric Statistics Strip ── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">Lifetime Borrowings</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                {borrowings.length}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">Total loan transactions recorded</p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">Currently Possessed</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">
                                {activeLoans.length}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">Books awaiting return</p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">Returned Loans</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">
                                {pastLoans.length}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">Completed returns</p>
                        </div>
                    </div>

                    {/* ── Identity & Contact Details ── */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Identity */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Identity & Registration
                            </h3>

                            <div className="mt-4 divide-y divide-slate-100 text-xs sm:text-sm">
                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-slate-500">Reader Code</span>
                                    <span className="font-mono font-medium text-slate-800">
                                        {reader.readerCode}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-slate-500">Full Name</span>
                                    <span className="font-medium text-slate-800">
                                        {reader.fullName}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-slate-500">Date of Birth</span>
                                    <span className="text-slate-700">
                                        {reader.dateOfBirth || "—"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2.5">
                                    <span className="text-slate-500">Member Since</span>
                                    <span className="text-slate-700">
                                        {reader.createdAt
                                            ? new Date(reader.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                            : "—"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Contact & Residential
                            </h3>

                            <div className="mt-4 divide-y divide-slate-100 text-xs sm:text-sm">
                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-slate-500">Phone Number</span>
                                    <span className="font-medium text-slate-800">
                                        {reader.phone || "—"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-slate-500">Email Address</span>
                                    <span className="text-slate-700">
                                        {reader.email || "—"}
                                    </span>
                                </div>

                                <div className="flex items-start justify-between pt-2.5">
                                    <span className="text-slate-500">Address</span>
                                    <span className="max-w-[240px] text-right text-slate-700">
                                        {reader.address || "—"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Active Loans List (if any) ── */}
                    {activeLoans.length > 0 && (
                        <div className="rounded-xl border border-amber-200/90 bg-white shadow-xs">
                            <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50/40 px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Currently Borrowed Books
                                    </h2>
                                </div>
                                <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                                    {activeLoans.length} Active
                                </span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {activeLoans.map((loan) => (
                                    <button
                                        key={loan.id}
                                        type="button"
                                        onClick={() => router.push(`/borrowings/${loan.id}`)}
                                        className="group flex w-full flex-col gap-3 p-4 text-left transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-3.5">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs text-slate-500">#{loan.id}</span>
                                                    <h4 className="truncate text-xs font-medium text-slate-900 group-hover:text-slate-700 sm:text-sm">
                                                        {loan.book?.title || loan.bookTitle || "Book"}
                                                    </h4>
                                                </div>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-400">
                                                    <span>Borrowed: {loan.borrowDate}</span>
                                                    <span>•</span>
                                                    <span>Due: <span className="font-medium text-slate-700">{loan.dueDate}</span></span>
                                                    {loan.bookCopy?.barcode && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-mono">Barcode: {loan.bookCopy.barcode}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 pl-12 sm:pl-0">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    loan.status === "OVERDUE"
                                                        ? "bg-rose-50 text-rose-700"
                                                        : "bg-amber-50 text-amber-700"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        loan.status === "OVERDUE" ? "bg-rose-500" : "bg-amber-500"
                                                    }`}
                                                />
                                                {loan.status}
                                            </span>

                                            <svg className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Complete Borrowing History Ledger ── */}
                    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
                        <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Borrowing History
                                </h2>
                                <p className="text-xs text-slate-400">
                                    All past and current circulation transactions for this reader.
                                </p>
                            </div>

                            <span className="w-fit rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                {borrowings.length} Records
                            </span>
                        </div>

                        {borrowings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-800">No borrowing records found</p>
                                <p className="mt-0.5 text-xs text-slate-400">This patron has not borrowed any books yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] border-collapse text-left">
                                    <thead className="border-b border-slate-100 bg-slate-50/50">
                                    <tr>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Loan ID
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Book Title
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Borrow Date
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Due Date
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Return Date
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Fine
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
                                    {borrowings.map((b) => {
                                        const isReturned = b.status === "RETURNED";
                                        const isBorrowing = b.status === "BORROWING";
                                        const isOverdue = b.status === "OVERDUE";

                                        return (
                                            <tr
                                                key={b.id}
                                                onClick={() => router.push(`/borrowings/${b.id}`)}
                                                className="cursor-pointer transition-colors hover:bg-slate-50/70"
                                            >
                                                <td className="px-5 py-3.5">
                                                        <span className="font-mono text-xs font-semibold text-slate-700">
                                                            #{b.id}
                                                        </span>
                                                </td>

                                                <td className="px-5 py-3.5 font-medium text-slate-900">
                                                    {b.book?.title || b.bookTitle || `Book #${b.bookId || b.id}`}
                                                </td>

                                                <td className="px-5 py-3.5 text-slate-600">
                                                    {b.borrowDate || "—"}
                                                </td>

                                                <td className="px-5 py-3.5 text-slate-700">
                                                    {b.dueDate || "—"}
                                                </td>

                                                <td className="px-5 py-3.5 text-slate-600">
                                                    {b.returnDate || <span className="italic text-slate-400">Pending</span>}
                                                </td>

                                                <td className="px-5 py-3.5 font-medium text-slate-900">
                                                    {b.fineAmount && b.fineAmount > 0 ? (
                                                        <span className="text-rose-600">{formatCurrency(b.fineAmount)} ₫</span>
                                                    ) : (
                                                        <span className="text-slate-400">0 ₫</span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3.5">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                isReturned
                                                                    ? "bg-emerald-50 text-emerald-700"
                                                                    : isBorrowing
                                                                        ? "bg-amber-50 text-amber-700"
                                                                        : isOverdue
                                                                            ? "bg-rose-50 text-rose-700"
                                                                            : "bg-slate-100 text-slate-600"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${
                                                                    isReturned
                                                                        ? "bg-emerald-500"
                                                                        : isBorrowing
                                                                            ? "bg-amber-500"
                                                                            : isOverdue
                                                                                ? "bg-rose-500"
                                                                                : "bg-slate-400"
                                                                }`}
                                                            />
                                                            {b.status}
                                                        </span>
                                                </td>

                                                <td className="px-5 py-3.5 text-right">
                                                        <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900">
                                                            View
                                                        </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
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