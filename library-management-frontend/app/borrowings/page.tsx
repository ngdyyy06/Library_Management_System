"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import {
    getBorrowings,
    getReaders,
    getBookCopies,
    createBorrowing,
} from "@/app/lib/api";

type Reader = {
    id: number;
    readerCode: string;
    fullName: string;
    phone?: string;
    status: string;
};

type BookCopy = {
    id: number;
    barcode: string;
    status: string;
    book: {
        id: number;
        title: string;
        isbn: string;
    };
};

export default function BorrowingsPage() {
    const router = useRouter();

    const [borrowings, setBorrowings] = useState<any[]>([]);
    const [readers, setReaders] = useState<Reader[]>([]);
    const [bookCopies, setBookCopies] = useState<BookCopy[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedReaderId, setSelectedReaderId] = useState("");
    const [borrowDate, setBorrowDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [selectedCopyIds, setSelectedCopyIds] = useState<number[]>([]);
    const [copySearchQuery, setCopySearchQuery] = useState("");

    useEffect(() => {
        loadInitialData();
    }, []);

    async function loadInitialData() {
        try {
            setLoading(true);
            setError("");

            const [borrowingData, readerData, copyData] = await Promise.all([
                getBorrowings().catch(() => []),
                getReaders().catch(() => []),
                getBookCopies().catch(() => []),
            ]);

            setBorrowings(Array.isArray(borrowingData) ? borrowingData : []);
            setReaders(Array.isArray(readerData) ? readerData : []);
            setBookCopies(Array.isArray(copyData) ? copyData : []);
        } catch (err: any) {
            console.error("Failed to load circulation records:", err);
            setError(err?.message || "Failed to load circulation records.");
        } finally {
            setLoading(false);
        }
    }

    // Initialize Default Dates for Create Form
    function openCreateModal() {
        const today = new Date();
        const defaultDue = new Date();
        defaultDue.setDate(today.getDate() + 14); // Default 14 days loan

        setBorrowDate(today.toISOString().split("T")[0]);
        setDueDate(defaultDue.toISOString().split("T")[0]);
        setSelectedReaderId("");
        setSelectedCopyIds([]);
        setCopySearchQuery("");
        setError("");
        setSuccess("");
        setShowCreateModal(true);
    }

    function closeCreateModal() {
        if (saving) return;
        setShowCreateModal(false);
        setError("");
    }

    // Preset Date Adjuster
    function setQuickDays(days: number) {
        const base = borrowDate ? new Date(borrowDate) : new Date();
        const target = new Date(base);
        target.setDate(base.getDate() + days);
        setDueDate(target.toISOString().split("T")[0]);
    }

    // Toggle copy selection
    function toggleCopySelection(copyId: number) {
        setSelectedCopyIds((prev) =>
            prev.includes(copyId) ? prev.filter((id) => id !== copyId) : [...prev, copyId]
        );
    }

    // Available Copies for borrowing
    const availableCopies = useMemo(() => {
        return bookCopies.filter((c) => c.status === "AVAILABLE");
    }, [bookCopies]);

    // Filter available copies in the modal search
    const filteredAvailableCopies = useMemo(() => {
        const q = copySearchQuery.trim().toLowerCase();
        if (!q) return availableCopies;
        return availableCopies.filter(
            (c) =>
                c.barcode.toLowerCase().includes(q) ||
                c.book?.title?.toLowerCase().includes(q) ||
                c.book?.isbn?.toLowerCase().includes(q)
        );
    }, [availableCopies, copySearchQuery]);

    // Handle Create Submit
    async function handleCreateBorrowing(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!selectedReaderId) {
            setError("Please select a registered library reader.");
            return;
        }

        if (!dueDate) {
            setError("Please specify the scheduled return due date.");
            return;
        }

        if (selectedCopyIds.length === 0) {
            setError("Please select at least one available book copy to issue.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                readerId: Number(selectedReaderId),
                borrowDate: borrowDate ? `${borrowDate}T00:00:00` : undefined,
                dueDate: `${dueDate}T23:59:59`,
                bookCopyIds: selectedCopyIds,
            };

            await createBorrowing(payload);
            setSuccess("Borrowing ticket created successfully!");

            await loadInitialData();
            setTimeout(() => {
                setShowCreateModal(false);
                setSuccess("");
            }, 600);
        } catch (err: any) {
            console.error("Failed to create borrowing ticket:", err);
            setError(err?.message || "Failed to create borrowing ticket.");
        } finally {
            setSaving(false);
        }
    }

    // Filter Logic for Main Table
    const filteredBorrowings = useMemo(() => {
        return borrowings.filter((b) => {
            const keyword = searchTerm.trim().toLowerCase();
            const reader = b.reader;
            const matchesSearch =
                !keyword ||
                String(b.id).includes(keyword) ||
                reader?.fullName?.toLowerCase().includes(keyword) ||
                reader?.readerCode?.toLowerCase().includes(keyword) ||
                b.book?.title?.toLowerCase().includes(keyword);

            const matchesStatus =
                statusFilter === "ALL" || b.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [borrowings, searchTerm, statusFilter]);

    // Metrics
    const totalBorrowings = borrowings.length;
    const activeBorrowings = borrowings.filter(
        (b) => b.status === "BORROWING" || b.status === "OVERDUE"
    ).length;
    const returnedBorrowings = borrowings.filter((b) => b.status === "RETURNED").length;

    return (
        <RoleGuard allowedRoles={["LIBRARIAN", "ADMIN"]}>
            <div className="min-h-screen w-full bg-[#fafafa] p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* ── Page Header ── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                    Borrowings & Circulation
                                </h1>
                                <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs">
                                    Loan Ledger
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                Issue loan slips, inspect active book borrowings, and track return deadlines.
                            </p>
                        </div>

                        {/* Create Borrowing CTA Button */}
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] sm:text-sm"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Borrowing
                        </button>
                    </div>

                    {/* ── Error Banner ── */}
                    {error && !showCreateModal && (
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
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">Total Loan Records</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                {totalBorrowings}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">All-time circulation transactions</p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">Currently Checked Out</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">
                                {activeBorrowings}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">Awaiting physical return</p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">Completed Returns</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">
                                {returnedBorrowings}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">Restocked back into catalog</p>
                        </div>
                    </div>

                    {/* ── Main Container: Search, Filter & Table ── */}
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
                                        placeholder="Search by ticket ID, reader name, code, or book title..."
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                    />
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="BORROWING">Active Loans (Borrowing)</option>
                                    <option value="OVERDUE">Overdue Only</option>
                                    <option value="RETURNED">Returned & Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                                <p className="mt-3 text-xs text-slate-500">
                                    Loading borrowing tickets...
                                </p>
                            </div>
                        ) : filteredBorrowings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-800">No borrowing records found</p>
                                <p className="mt-0.5 text-xs text-slate-400">Try adjusting your filters or issue a new loan.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] border-collapse text-left">
                                    <thead className="border-b border-slate-100 bg-slate-50/50">
                                    <tr>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Ticket ID
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Patron
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
                                            Status
                                        </th>
                                        <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                    {filteredBorrowings.map((borrowing) => {
                                        const isReturned = borrowing.status === "RETURNED";
                                        const isOverdue = borrowing.status === "OVERDUE";
                                        const isBorrowing = borrowing.status === "BORROWING";

                                        return (
                                            <tr
                                                key={borrowing.id}
                                                className="transition-colors hover:bg-slate-50/70"
                                            >
                                                <td className="px-5 py-3.5">
                                                        <span className="font-mono text-xs font-semibold text-slate-700">
                                                            #{borrowing.id}
                                                        </span>
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            {borrowing.reader?.fullName || "General Patron"}
                                                        </p>
                                                        <p className="font-mono text-[11px] text-slate-400">
                                                            {borrowing.reader?.readerCode || "N/A"}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5 font-medium text-slate-800">
                                                    {borrowing.book?.title ||
                                                        borrowing.bookTitle ||
                                                        `Loan #${borrowing.id}`}
                                                </td>

                                                <td className="px-5 py-3.5 text-slate-600">
                                                    {borrowing.borrowDate || "—"}
                                                </td>

                                                <td className="px-5 py-3.5 text-slate-700 font-medium">
                                                    {borrowing.dueDate || "—"}
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
                                                            {borrowing.status}
                                                        </span>
                                                </td>

                                                <td className="px-5 py-3.5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.push(`/borrowings/${borrowing.id}`)
                                                        }
                                                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        Detail
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

                    {/* ── CREATE BORROWING TICKET MODAL ── */}
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]">
                            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200/80 bg-white shadow-xl">
                                {/* Modal Header */}
                                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Issue Borrowing Slip
                                        </h2>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Select reader, loan schedule, and choose available copies.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeCreateModal}
                                        disabled={saving}
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleCreateBorrowing} className="p-6 space-y-5">
                                    {/* Reader Selection */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                            Patron / Reader <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={selectedReaderId}
                                            onChange={(e) => setSelectedReaderId(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                        >
                                            <option value="">Select a registered reader...</option>
                                            {readers
                                                .filter((r) => r.status === "ACTIVE")
                                                .map((reader) => (
                                                    <option key={reader.id} value={reader.id}>
                                                        {reader.fullName} ({reader.readerCode}) {reader.phone ? `— ${reader.phone}` : ""}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    {/* Loan Schedule Dates & Preset Buttons */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                                Borrow Date
                                            </label>
                                            <input
                                                type="date"
                                                value={borrowDate}
                                                onChange={(e) => setBorrowDate(e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-xs font-medium text-slate-700">
                                                    Due Date <span className="text-rose-500">*</span>
                                                </label>
                                                {/* Presets */}
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuickDays(7)}
                                                        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                                                    >
                                                        +7d
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuickDays(14)}
                                                        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                                                    >
                                                        +14d
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuickDays(30)}
                                                        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                                                    >
                                                        +30d
                                                    </button>
                                                </div>
                                            </div>
                                            <input
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Physical Copies Selector */}
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-medium text-slate-700">
                                                Select Book Copies ({selectedCopyIds.length} selected) <span className="text-rose-500">*</span>
                                            </label>
                                            <span className="text-[11px] text-slate-400">
                                                Available inventory only
                                            </span>
                                        </div>

                                        {/* Search Filter for Copies */}
                                        <input
                                            type="text"
                                            value={copySearchQuery}
                                            onChange={(e) => setCopySearchQuery(e.target.value)}
                                            placeholder="Filter copies by title, ISBN, or barcode..."
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
                                        />

                                        {/* Copies List Container */}
                                        <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
                                            {filteredAvailableCopies.length === 0 ? (
                                                <div className="p-5 text-center text-xs text-slate-400">
                                                    No available copies match your search.
                                                </div>
                                            ) : (
                                                filteredAvailableCopies.map((copy) => {
                                                    const isSelected = selectedCopyIds.includes(copy.id);
                                                    return (
                                                        <div
                                                            key={copy.id}
                                                            onClick={() => toggleCopySelection(copy.id)}
                                                            className={`flex cursor-pointer items-center justify-between p-3 transition-colors ${
                                                                isSelected
                                                                    ? "bg-slate-50"
                                                                    : "hover:bg-slate-50/60"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleCopySelection(copy.id)}
                                                                    className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-0 focus:ring-offset-0"
                                                                />
                                                                <div>
                                                                    <p className="text-xs font-medium text-slate-900">
                                                                        {copy.book?.title || "Untitled Book"}
                                                                    </p>
                                                                    <p className="font-mono text-[10px] text-slate-400">
                                                                        ISBN: {copy.book?.isbn || "N/A"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-700 border border-slate-200">
                                                                {copy.barcode}
                                                            </span>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* Alert messages */}
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

                                    {/* Modal Actions */}
                                    <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeCreateModal}
                                            disabled={saving}
                                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={saving || selectedCopyIds.length === 0}
                                            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20 disabled:cursor-not-allowed disabled:bg-black disabled:opacity-50"
                                        >
                                            {saving && (
                                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            )}
                                            {saving ? "Creating Ticket..." : "Issue Borrowing Slip"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}