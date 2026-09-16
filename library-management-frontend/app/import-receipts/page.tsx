"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
    getImportReceipts,
    getPublishers,
    getBooks,
    createImportReceipt,
    updateImportReceipt,
    activateImportReceipt,
    deactivateImportReceipt,
    getImportReceiptDetails,
} from "@/app/lib/api";

type Publisher = {
    id: number;
    name: string;
    status: string;
};

type Book = {
    id: number;
    title: string;
    isbn: string;
    status: string;
};

type ImportDetail = {
    bookId: number;
    quantity: number;
    unitPrice: number;
};

type ImportReceipt = {
    id: number;
    receiptCode: string;
    publisher: Publisher;
    importDate: string;
    totalAmount: number;
    status: string;
    createdBy?: {
        id: number;
        username: string;
        fullName: string;
    };
};

type FormDetail = {
    bookId: string;
    quantity: string;
    unitPrice: string;
};

export default function ImportReceiptsPage() {
    const router = useRouter();

    const [receipts, setReceipts] = useState<ImportReceipt[]>([]);
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [books, setBooks] = useState<Book[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [publisherId, setPublisherId] = useState("");
    const [importDate, setImportDate] = useState("");

    const [details, setDetails] = useState<FormDetail[]>([
        {
            bookId: "",
            quantity: "",
            unitPrice: "",
        },
    ]);

    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);

            const [
                receiptData,
                publisherData,
                bookData,
            ] = await Promise.all([
                getImportReceipts(),
                getPublishers(),
                getBooks(),
            ]);

            setReceipts(receiptData || []);
            setPublishers(publisherData || []);
            setBooks(bookData || []);
        } catch (error: any) {
            setError(error.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setPublisherId("");
        setImportDate("");
        setDetails([
            {
                bookId: "",
                quantity: "",
                unitPrice: "",
            },
        ]);

        setEditingId(null);
        setError("");
    }

    function openCreateForm() {
        resetForm();

        setImportDate(
            new Date().toISOString().split("T")[0]
        );

        setShowForm(true);
    }

    async function openEditForm(receipt: ImportReceipt) {
        try {
            setError("");

            const receiptDetails =
                await getImportReceiptDetails(receipt.id);

            setEditingId(receipt.id);
            setPublisherId(String(receipt.publisher.id));
            setImportDate(receipt.importDate);

            setDetails(
                receiptDetails.map((detail: any) => ({
                    bookId: String(detail.book.id),
                    quantity: String(detail.quantity),
                    unitPrice: String(detail.unitPrice),
                }))
            );

            setShowForm(true);
        } catch (error: any) {
            setError(error.message || "Failed to load receipt");
        }
    }

    function addDetailRow() {
        setDetails([
            ...details,
            {
                bookId: "",
                quantity: "",
                unitPrice: "",
            },
        ]);
    }

    function removeDetailRow(index: number) {
        if (details.length === 1) {
            return;
        }

        setDetails(
            details.filter((_, currentIndex) => currentIndex !== index)
        );
    }

    function updateDetail(
        index: number,
        field: keyof FormDetail,
        value: string
    ) {
        setDetails(
            details.map((detail, currentIndex) =>
                currentIndex === index
                    ? {
                        ...detail,
                        [field]: value,
                    }
                    : detail
            )
        );
    }

    function calculateTotal() {
        return details.reduce((total, detail) => {
            const quantity = Number(detail.quantity) || 0;
            const unitPrice = Number(detail.unitPrice) || 0;

            return total + quantity * unitPrice;
        }, 0);
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError("");

        if (!publisherId) {
            setError("Please select a publisher");
            return;
        }

        if (!importDate) {
            setError("Please select an import date");
            return;
        }

        if (details.length === 0) {
            setError("Import receipt must contain at least one book");
            return;
        }

        for (const detail of details) {
            if (!detail.bookId) {
                setError("Please select a book for every row");
                return;
            }

            if (!detail.quantity || Number(detail.quantity) <= 0) {
                setError("Quantity must be greater than 0");
                return;
            }

            if (detail.unitPrice === "" || Number(detail.unitPrice) < 0) {
                setError("Unit price cannot be negative");
                return;
            }
        }

        try {
            setSaving(true);

            const requestData = {
                publisherId: Number(publisherId),
                importDate,
                details: details.map((detail) => ({
                    bookId: Number(detail.bookId),
                    quantity: Number(detail.quantity),
                    unitPrice: Number(detail.unitPrice),
                })),
            };

            if (editingId) {
                await updateImportReceipt(editingId, requestData);
            } else {
                await createImportReceipt(requestData);
            }

            await loadData();

            setShowForm(false);
            resetForm();
        } catch (error: any) {
            setError(error.message || "Failed to save import receipt");
        } finally {
            setSaving(false);
        }
    }

    async function handleActivate(id: number) {
        if (!window.confirm("Are you sure you want to activate this import receipt?")) {
            return;
        }

        try {
            setError("");
            await activateImportReceipt(id);
            await loadData();
        } catch (error: any) {
            setError(error.message || "Failed to activate import receipt");
        }
    }

    async function handleDeactivate(id: number) {
        if (!window.confirm("Are you sure you want to deactivate this import receipt?")) {
            return;
        }

        try {
            setError("");
            await deactivateImportReceipt(id);
            await loadData();
        } catch (error: any) {
            setError(error.message || "Failed to deactivate import receipt");
        }
    }

    const filteredReceipts = useMemo(() => {
        return receipts.filter((receipt) => {
            const keyword = search.trim().toLowerCase();

            const matchesSearch =
                !keyword ||
                receipt.receiptCode.toLowerCase().includes(keyword) ||
                receipt.publisher.name.toLowerCase().includes(keyword);

            const matchesStatus =
                statusFilter === "ALL" || receipt.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [receipts, search, statusFilter]);

    const totalReceipts = receipts.length;
    const activeReceipts = receipts.filter(
        (receipt) => receipt.status === "COMPLETED"
    ).length;
    const inactiveReceipts = receipts.filter(
        (receipt) => receipt.status === "INACTIVE"
    ).length;

    function formatCurrency(value: number) {
        return new Intl.NumberFormat("vi-VN").format(value);
    }

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] p-6 font-sans lg:p-8">
            <div className="w-full space-y-6">
                {/* ── Page Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Import Receipts
                            </h1>
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                Procurement Log
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Track book stock-in orders, publisher shipments, and purchasing costs.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] sm:text-sm"
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
                                strokeWidth={2.2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Create Receipt
                    </button>
                </div>

                {/* ── Error Banner ── */}
                {error && (
                    <div className="flex items-center justify-between rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="text-xs font-semibold text-rose-700 hover:text-rose-900"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* ── Metric Strip ── */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {/* Total Receipts */}
                    <div className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <span className="absolute right-6 top-6 h-2 w-2 rounded-full bg-indigo-500" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Total Receipts
                        </p>
                        <p className="mt-3 text-3xl font-extrabold text-slate-900">
                            {totalReceipts}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-400">
                            Historical procurement records
                        </p>
                    </div>

                    {/* Active / Completed */}
                    <div className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <span className="absolute right-6 top-6 h-2 w-2 rounded-full bg-emerald-500" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Completed / Active
                        </p>
                        <p className="mt-3 text-3xl font-extrabold text-emerald-600">
                            {activeReceipts}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-400">
                            Fulfilled stock additions
                        </p>
                    </div>

                    {/* Inactive */}
                    <div className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <span className="absolute right-6 top-6 h-2 w-2 rounded-full bg-rose-500" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Inactive
                        </p>
                        <p className="mt-3 text-3xl font-extrabold text-rose-600">
                            {inactiveReceipts}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-400">
                            Archived or cancelled receipts
                        </p>
                    </div>
                </div>

                {/* ── Main Container: Search & Table ── */}
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                    {/* Filter Bar */}
                    <div className="border-b border-slate-100 p-5">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="relative md:col-span-2">
                                <svg
                                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by receipt code or publisher name..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="COMPLETED">Active (Completed)</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Table / List View */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
                            <p className="mt-3 text-xs font-semibold text-slate-500">
                                Loading import receipts...
                            </p>
                        </div>
                    ) : filteredReceipts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.121 5.121A2 2 0 0118 9.121V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="mt-3 text-sm font-bold text-slate-900">
                                No Import Receipts Found
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Try modifying your search keyword or create a new receipt.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[950px] border-collapse text-left">
                                <thead className="border-b border-slate-100 bg-slate-50/75">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">
                                        Receipt Code
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">
                                        Publisher
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">
                                        Import Date
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">
                                        Total Amount
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                {filteredReceipts.map((receipt) => (
                                    <tr
                                        key={receipt.id}
                                        className="transition-colors hover:bg-slate-50/60"
                                    >
                                        <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-700">
                                                    {receipt.receiptCode}
                                                </span>
                                        </td>

                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {receipt.publisher.name}
                                        </td>

                                        <td className="px-6 py-4 text-slate-600">
                                            {receipt.importDate}
                                        </td>

                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {formatCurrency(receipt.totalAmount)}{" "}
                                            <span className="text-xs font-medium text-slate-400">₫</span>
                                        </td>

                                        <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                                        receipt.status === "COMPLETED"
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            receipt.status === "COMPLETED"
                                                                ? "bg-emerald-500"
                                                                : "bg-slate-400"
                                                        }`}
                                                    />
                                                    {receipt.status === "COMPLETED" ? "ACTIVE" : "INACTIVE"}
                                                </span>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Detail */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(`/import-receipts/${receipt.id}`)
                                                    }
                                                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-indigo-600 active:scale-95"
                                                >
                                                    Detail
                                                </button>

                                                {/* Edit (only completed) */}
                                                {receipt.status === "COMPLETED" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditForm(receipt)}
                                                        className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-indigo-600 active:scale-95"
                                                    >
                                                        Edit
                                                    </button>
                                                )}

                                                {/* Activate / Deactivate Toggle */}
                                                {receipt.status === "COMPLETED" ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeactivate(receipt.id)}
                                                        className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-100 active:scale-95"
                                                    >
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleActivate(receipt.id)}
                                                        className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-100 active:scale-95"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── Create / Edit Receipt Modal ── */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                        <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200/80 bg-white shadow-2xl">
                            {/* Modal Header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {editingId ? "Edit Import Receipt" : "Create Import Receipt"}
                                    </h2>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Specify the publishing vendor, procurement date, and line item stock.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                {/* Header Fields */}
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Publisher <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={publisherId}
                                            onChange={(event) => setPublisherId(event.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Select a publisher...</option>
                                            {publishers
                                                .filter((publisher) => publisher.status === "ACTIVE")
                                                .map((publisher) => (
                                                    <option key={publisher.id} value={publisher.id}>
                                                        {publisher.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Import Date <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={importDate}
                                            onChange={(event) => setImportDate(event.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Line Items Header */}
                                <div className="mt-8">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">
                                                Procured Titles
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Add books, quantities, and their unit purchase prices.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addDetailRow}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Book
                                        </button>
                                    </div>

                                    {/* Line Items Table */}
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                                        <table className="w-full min-w-[650px] border-collapse text-left">
                                            <thead className="bg-slate-50/75">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                                                    Book Title
                                                </th>
                                                <th className="w-32 px-4 py-3 text-xs font-semibold text-slate-500">
                                                    Quantity
                                                </th>
                                                <th className="w-40 px-4 py-3 text-xs font-semibold text-slate-500">
                                                    Unit Price (VND)
                                                </th>
                                                <th className="w-36 px-4 py-3 text-right text-xs font-semibold text-slate-500">
                                                    Subtotal
                                                </th>
                                                <th className="w-16 px-4 py-3 text-center" />
                                            </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                            {details.map((detail, index) => {
                                                const quantity = Number(detail.quantity) || 0;
                                                const unitPrice = Number(detail.unitPrice) || 0;
                                                const amount = quantity * unitPrice;

                                                return (
                                                    <tr key={index} className="transition-colors hover:bg-slate-50/40">
                                                        <td className="px-4 py-2.5">
                                                            <select
                                                                value={detail.bookId}
                                                                onChange={(event) =>
                                                                    updateDetail(index, "bookId", event.target.value)
                                                                }
                                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                            >
                                                                <option value="">Select a title...</option>
                                                                {books
                                                                    .filter((book) => book.status === "ACTIVE")
                                                                    .map((book) => (
                                                                        <option key={book.id} value={book.id}>
                                                                            {book.title} (ISBN: {book.isbn})
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </td>

                                                        <td className="px-4 py-2.5">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                placeholder="1"
                                                                value={detail.quantity}
                                                                onChange={(event) =>
                                                                    updateDetail(index, "quantity", event.target.value)
                                                                }
                                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                            />
                                                        </td>

                                                        <td className="px-4 py-2.5">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                placeholder="0"
                                                                value={detail.unitPrice}
                                                                onChange={(event) =>
                                                                    updateDetail(index, "unitPrice", event.target.value)
                                                                }
                                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                            />
                                                        </td>

                                                        <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                                                            {formatCurrency(amount)} ₫
                                                        </td>

                                                        <td className="px-4 py-2.5 text-center">
                                                            <button
                                                                type="button"
                                                                disabled={details.length === 1}
                                                                onClick={() => removeDetailRow(index)}
                                                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                                                                title="Remove item"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Total Summary Strip */}
                                <div className="mt-5 flex justify-end">
                                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/75 px-5 py-3">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Total Calculated Amount:
                                        </p>
                                        <p className="text-lg font-extrabold text-slate-900">
                                            {formatCurrency(calculateTotal())}{" "}
                                            <span className="text-xs font-bold text-indigo-600">VND</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            resetForm();
                                        }}
                                        className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 shadow-2xs transition hover:bg-slate-50 active:scale-95"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {saving && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                                        {saving
                                            ? "Saving Receipt..."
                                            : editingId
                                                ? "Update Receipt"
                                                : "Create Receipt"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}