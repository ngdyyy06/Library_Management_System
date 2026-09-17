"use client";

import { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/app/components/RoleGuard";
import { getBorrowings, returnBook } from "@/app/lib/api";

type Condition = "GOOD" | "DAMAGED" | "LOST";

export default function StaffReturnsPage() {
    const [borrowings, setBorrowings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter & Search states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "OVERDUE" | "ON_TIME">("ALL");

    // Modal state
    const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
    const [condition, setCondition] = useState<Condition>("GOOD");

    const [returning, setReturning] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadBorrowings();
    }, []);

    async function loadBorrowings() {
        try {
            setLoading(true);
            setError("");

            const data = await getBorrowings();
            const borrowingList = Array.isArray(data) ? data : [];

            const borrowingWithDetails = await Promise.all(
                borrowingList.map(async (borrowing: any) => {
                    try {
                        const token = localStorage.getItem("token");
                        const response = await fetch(
                            `http://localhost:8080/api/borrowings/${borrowing.id}/details`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (!response.ok) {
                            return {
                                ...borrowing,
                                details: [],
                            };
                        }

                        const details = await response.json();
                        return {
                            ...borrowing,
                            details: Array.isArray(details) ? details : [],
                        };
                    } catch {
                        return {
                            ...borrowing,
                            details: [],
                        };
                    }
                })
            );

            setBorrowings(borrowingWithDetails);
        } catch (err: any) {
            console.error("Failed to load borrowings:", err);
            setError(err?.message || "Failed to load borrowing records.");
        } finally {
            setLoading(false);
        }
    }

    function openReturnModal(detail: any) {
        setSelectedDetail(detail);
        setCondition("GOOD");
        setError("");
        setSuccess("");
    }

    function closeReturnModal() {
        if (returning) return;
        setSelectedDetail(null);
        setCondition("GOOD");
        setError("");
    }

    async function handleReturn() {
        if (!selectedDetail) return;

        try {
            setReturning(true);
            setError("");
            setSuccess("");

            await returnBook(selectedDetail.id, condition);

            setSuccess("Book copy checked in successfully.");
            await loadBorrowings();

            setTimeout(() => {
                setSelectedDetail(null);
                setSuccess("");
            }, 600);
        } catch (err: any) {
            console.error("Failed to return book:", err);
            setError(err?.message || "Failed to process return.");
        } finally {
            setReturning(false);
        }
    }

    // Unreturned line items
    const activeDetails = useMemo(() => {
        return borrowings.flatMap((borrowing) =>
            (borrowing.details || [])
                .filter((detail: any) => !detail.returnedAt)
                .map((detail: any) => ({
                    ...detail,
                    borrowing,
                }))
        );
    }, [borrowings]);

    // Check if item is overdue
    const isItemOverdue = (dueDate: string | null) => {
        if (!dueDate) return false;
        const due = new Date(dueDate).getTime();
        const now = new Date().setHours(0, 0, 0, 0);
        return due < now;
    };

    // Filter Logic
    const filteredDetails = useMemo(() => {
        return activeDetails.filter((item: any) => {
            const keyword = searchTerm.trim().toLowerCase();
            const reader = item.borrowing?.reader;
            const book = item.bookCopy?.book;
            const barcode = item.bookCopy?.barcode;

            const matchesSearch =
                !keyword ||
                reader?.fullName?.toLowerCase().includes(keyword) ||
                reader?.readerCode?.toLowerCase().includes(keyword) ||
                book?.title?.toLowerCase().includes(keyword) ||
                book?.isbn?.toLowerCase().includes(keyword) ||
                barcode?.toLowerCase().includes(keyword);

            const overdue = isItemOverdue(item.borrowing?.dueDate);

            let matchesStatus = true;
            if (statusFilter === "OVERDUE") matchesStatus = overdue;
            if (statusFilter === "ON_TIME") matchesStatus = !overdue;

            return matchesSearch && matchesStatus;
        });
    }, [activeDetails, searchTerm, statusFilter]);

    // Metrics
    const totalPending = activeDetails.length;
    const overdueCount = activeDetails.filter((item: any) =>
        isItemOverdue(item.borrowing?.dueDate)
    ).length;
    const onTimeCount = totalPending - overdueCount;

    function formatDateTime(value: string | null) {
        if (!value) return "—";
        return new Date(value).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function formatDate(value: string | null) {
        if (!value) return "—";
        return new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    return (
        <RoleGuard allowedRoles={["LIBRARIAN", "ADMIN"]}>
            <div className="min-h-screen w-full bg-[#fafafa] p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* ── Page Header ── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                    Pending Returns
                                </h1>
                                <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs">
                                    Check-In Desk
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                Process physical book copy returns, assess item condition, and resolve loans.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={loadBorrowings}
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
                            Refresh Queue
                        </button>
                    </div>

                    {/* ── Error Banner ── */}
                    {error && !selectedDetail && (
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

                    {/* ── 3-Metric Strip ── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">Pending Check-Ins</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                {totalPending}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">Total physical copies currently on loan</p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">Overdue Copies</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-rose-600">
                                {overdueCount}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">Past scheduled return deadline</p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">On Schedule</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">
                                {onTimeCount}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">Within valid lending timeframe</p>
                        </div>
                    </div>

                    {/* ── Main Container: Search, Filter & Pending Queue ── */}
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
                                        placeholder="Search by reader name, code, title, ISBN, or barcode..."
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                    />
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                >
                                    <option value="ALL">All Borrowed Copies</option>
                                    <option value="OVERDUE">Overdue Only</option>
                                    <option value="ON_TIME">On Schedule Only</option>
                                </select>
                            </div>
                        </div>

                        {/* Table View */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                                <p className="mt-3 text-xs text-slate-500">
                                    Loading pending return queue...
                                </p>
                            </div>
                        ) : filteredDetails.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-800">Queue Clear</p>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    No outstanding books waiting to be returned match your criteria.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[950px] border-collapse text-left">
                                    <thead className="border-b border-slate-100 bg-slate-50/50">
                                    <tr>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Patron
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Book Title & ISBN
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Barcode
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Borrowed Date
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Due Date
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
                                    {filteredDetails.map((detail: any) => {
                                        const borrowing = detail.borrowing;
                                        const reader = borrowing?.reader;
                                        const bookCopy = detail.bookCopy;
                                        const book = bookCopy?.book;
                                        const isOverdue = isItemOverdue(borrowing?.dueDate);

                                        return (
                                            <tr
                                                key={detail.id}
                                                className="transition-colors hover:bg-slate-50/70"
                                            >
                                                {/* Reader */}
                                                <td className="px-5 py-3.5">
                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            {reader?.fullName || "General Reader"}
                                                        </p>
                                                        <p className="font-mono text-[11px] text-slate-400">
                                                            {reader?.readerCode || "N/A"}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Book Title */}
                                                <td className="px-5 py-3.5">
                                                    <div>
                                                        <p className="font-medium text-slate-900 line-clamp-1">
                                                            {book?.title || "Untitled Book"}
                                                        </p>
                                                        <p className="font-mono text-[11px] text-slate-400">
                                                            ISBN: {book?.isbn || "N/A"}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Barcode */}
                                                <td className="px-5 py-3.5">
                                                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700">
                                                            {bookCopy?.barcode || "N/A"}
                                                        </span>
                                                </td>

                                                {/* Borrow Date */}
                                                <td className="px-5 py-3.5 text-slate-600">
                                                    {formatDateTime(borrowing?.borrowedAt)}
                                                </td>

                                                {/* Due Date */}
                                                <td className="px-5 py-3.5">
                                                        <span className={isOverdue ? "font-medium text-rose-600" : "text-slate-700"}>
                                                            {formatDate(borrowing?.dueDate)}
                                                        </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-3.5">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                isOverdue
                                                                    ? "bg-rose-50 text-rose-700"
                                                                    : "bg-emerald-50 text-emerald-700"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${
                                                                    isOverdue ? "bg-rose-500" : "bg-emerald-500"
                                                                }`}
                                                            />
                                                            {isOverdue ? "Overdue" : "On Schedule"}
                                                        </span>
                                                </td>

                                                {/* Return Action */}
                                                <td className="px-5 py-3.5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => openReturnModal(detail)}
                                                        className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-2xs transition hover:bg-slate-800"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                        Check In
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── Process Return Modal ── */}
                    {selectedDetail && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]">
                            <div className="w-full max-w-lg rounded-xl border border-slate-200/80 bg-white shadow-xl">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Confirm Book Check-In
                                        </h2>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Assess copy condition and calculate fine restitution.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeReturnModal}
                                        disabled={returning}
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="space-y-4 p-6">
                                    {/* Book Copy Details */}
                                    <div className="rounded-lg border border-slate-200/70 bg-slate-50/50 p-3.5">
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                            Book Copy Information
                                        </p>
                                        <p className="mt-1 font-medium text-slate-900">
                                            {selectedDetail.bookCopy?.book?.title || "Untitled Book"}
                                        </p>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                                            <span>
                                                Barcode:{" "}
                                                <strong className="font-mono text-slate-800">
                                                    {selectedDetail.bookCopy?.barcode || "N/A"}
                                                </strong>
                                            </span>
                                            <span>•</span>
                                            <span>
                                                ISBN: {selectedDetail.bookCopy?.book?.isbn || "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Reader Details */}
                                    <div className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white p-3.5">
                                        <div>
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                                Patron
                                            </p>
                                            <p className="mt-0.5 text-xs font-medium text-slate-900 sm:text-sm">
                                                {selectedDetail.borrowing?.reader?.fullName || "General Reader"}
                                            </p>
                                        </div>
                                        <span className="font-mono text-xs text-slate-500">
                                            {selectedDetail.borrowing?.reader?.readerCode || "N/A"}
                                        </span>
                                    </div>

                                    {/* Condition Selector */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                            Physical Condition on Return
                                        </label>
                                        <select
                                            value={condition}
                                            onChange={(e) => setCondition(e.target.value as Condition)}
                                            disabled={returning}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                        >
                                            <option value="GOOD">Good Condition (No Damage)</option>
                                            <option value="DAMAGED">Damaged (Requires Repair / Fee)</option>
                                            <option value="LOST">Lost (Full Replacement Penalty)</option>
                                        </select>
                                    </div>

                                    {/* Condition Warnings */}
                                    {condition === "DAMAGED" && (
                                        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-800">
                                            <p className="font-medium">Damaged Item Notice</p>
                                            <p className="mt-0.5 text-amber-700">
                                                The system will calculate the damage penalty surcharge in addition to any overdue fines accrued.
                                            </p>
                                        </div>
                                    )}

                                    {condition === "LOST" && (
                                        <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3.5 text-xs text-rose-800">
                                            <p className="font-medium">Lost Copy Declaration</p>
                                            <p className="mt-0.5 text-rose-700">
                                                This copy status will be updated to LOST and replacement fee will be billed to the patron.
                                            </p>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                                            {success}
                                        </div>
                                    )}
                                </div>

                                {/* Modal Actions */}
                                <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-3.5">
                                    <button
                                        type="button"
                                        onClick={closeReturnModal}
                                        disabled={returning}
                                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleReturn}
                                        disabled={returning}
                                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        {returning && (
                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        )}
                                        {returning ? "Checking In..." : "Confirm Check-In"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}