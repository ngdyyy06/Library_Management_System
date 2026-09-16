"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
    getImportReceiptById,
    getImportReceiptDetails,
} from "@/app/lib/api";

type ImportReceipt = {
    id: number;
    receiptCode: string;
    importDate: string;
    totalAmount: number;
    status: string;
    publisher: {
        id: number;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
    };
    createdBy?: {
        id: number;
        username: string;
        fullName: string;
    };
};

type ImportReceiptDetail = {
    id: number;
    book: {
        id: number;
        title: string;
        isbn: string;
    };
    quantity: number;
    unitPrice: number;
    amount: number;
};

export default function ImportReceiptDetailPage() {
    const router = useRouter();
    const params = useParams();

    const id = Number(params.id);

    const [receipt, setReceipt] = useState<ImportReceipt | null>(null);
    const [details, setDetails] = useState<ImportReceiptDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        loadData();
    }, [id]);

    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const [receiptData, detailData] = await Promise.all([
                getImportReceiptById(id),
                getImportReceiptDetails(id),
            ]);

            setReceipt(receiptData);
            setDetails(detailData || []);
        } catch (err: any) {
            setError(err.message || "Failed to load import receipt");
        } finally {
            setLoading(false);
        }
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat("vi-VN").format(value);
    }

    // Loading State
    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc] p-6 font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                    <p className="text-sm font-semibold text-slate-500">
                        Loading receipt record...
                    </p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !receipt) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc] p-6 font-sans">
                <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-xs">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                        <svg
                            className="h-7 w-7"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                        Receipt Not Found
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        {error || "The requested import receipt could not be retrieved."}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/import-receipts")}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                        Back to Import Receipts
                    </button>
                </div>
            </div>
        );
    }

    const isCompleted = receipt.status === "COMPLETED";

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] p-6 font-sans lg:p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* ── Top Navigation & Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {/* Breadcrumbs */}
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                            <button
                                type="button"
                                onClick={() => router.push("/import-receipts")}
                                className="transition-colors hover:text-indigo-600"
                            >
                                Import Receipts
                            </button>
                            <span>/</span>
                            <span className="font-semibold text-slate-700">
                                {receipt.receiptCode}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Procurement Dossier
                            </h1>
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                Stock In Record
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Comprehensive line items, vendor details, and procurement billing.
                        </p>
                    </div>

                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="group inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-indigo-600 active:scale-[0.98] sm:self-auto sm:text-sm"
                    >
                        <svg
                            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back
                    </button>
                </div>

                {/* ── Hero Gradient Dossier Banner ── */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-500 p-7 text-white shadow-xl shadow-indigo-200/40">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="flex items-center gap-5">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner backdrop-blur-md">
                                <svg
                                    className="h-10 w-10 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.8}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.121 5.121A2 2 0 0118 9.121V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
                                    Import Receipt
                                </p>
                                <h2 className="mt-1 font-mono text-2xl font-extrabold tracking-tight sm:text-3xl">
                                    {receipt.receiptCode}
                                </h2>
                                <p className="mt-1 text-xs text-indigo-100/90">
                                    Procured on {receipt.importDate} • {details.length} title(s) registered
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span
                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold ${
                                    isCompleted
                                        ? "border-emerald-200/40 bg-emerald-500/20 text-white"
                                        : "border-white/20 bg-white/10 text-indigo-100"
                                }`}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        isCompleted ? "bg-emerald-300" : "bg-slate-300"
                                    }`}
                                />
                                {isCompleted ? "ACTIVE (COMPLETED)" : "INACTIVE"}
                            </span>

                            <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-2 backdrop-blur-md">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-100">
                                    Grand Total
                                </p>
                                <p className="text-lg font-extrabold text-white">
                                    {formatCurrency(receipt.totalAmount)}{" "}
                                    <span className="text-xs font-normal text-indigo-100">VND</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Metadata Dual Cards ── */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Receipt Specifications */}
                    <div className="relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs">
                        <span className="absolute right-6 top-6 h-2 w-2 rounded-full bg-indigo-500" />
                        <h2 className="text-sm font-bold text-slate-900">
                            Receipt Specifications
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-400">
                            Identification and system logging metadata
                        </p>

                        <div className="mt-6 space-y-4 text-xs sm:text-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <span className="text-slate-400">Receipt Code</span>
                                <span className="font-mono font-bold text-indigo-600">
                                    {receipt.receiptCode}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <span className="text-slate-400">Import Date</span>
                                <span className="font-semibold text-slate-800">
                                    {receipt.importDate}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Recorded By</span>
                                <span className="font-semibold text-slate-800">
                                    {receipt.createdBy?.fullName ||
                                        receipt.createdBy?.username ||
                                        "System Administrator"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Publisher / Vendor Details */}
                    <div className="relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs">
                        <span className="absolute right-6 top-6 h-2 w-2 rounded-full bg-emerald-500" />
                        <h2 className="text-sm font-bold text-slate-900">
                            Publishing Partner
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-400">
                            Supplier organization contact information
                        </p>

                        <div className="mt-6 space-y-4 text-xs sm:text-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <span className="text-slate-400">Company Name</span>
                                <span className="font-bold text-slate-900">
                                    {receipt.publisher.name}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <span className="text-slate-400">Phone Number</span>
                                <span className="font-medium text-slate-700">
                                    {receipt.publisher.phone || "Not recorded"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Email Address</span>
                                <span className="font-medium text-slate-700">
                                    {receipt.publisher.email || "Not recorded"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Line Items Catalog Section ── */}
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                    {/* Header */}
                    <div className="flex flex-col gap-2 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Procured Books Catalog
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-400">
                                Quantities, unit purchase prices, and line item financial breakdown.
                            </p>
                        </div>

                        <span className="w-fit rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-600">
                            {details.length} {details.length === 1 ? "Line Item" : "Line Items"}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] border-collapse text-left">
                            <thead className="bg-slate-50/75">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">
                                    Book Title
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">
                                    ISBN
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500">
                                    Quantity
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500">
                                    Unit Price
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500">
                                    Line Amount
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                            {details.map((detail) => (
                                <tr
                                    key={detail.id}
                                    className="transition-colors hover:bg-slate-50/60"
                                >
                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/books/${detail.book.id}`)}
                                            className="group flex items-center gap-2 text-left font-bold text-slate-900 transition-colors hover:text-indigo-600"
                                        >
                                            <span>{detail.book.title}</span>
                                            <svg
                                                className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    </td>

                                    <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-slate-500">
                                                {detail.book.isbn || "N/A"}
                                            </span>
                                    </td>

                                    <td className="px-6 py-4 text-right font-semibold text-slate-800">
                                        {detail.quantity}
                                    </td>

                                    <td className="px-6 py-4 text-right text-slate-600">
                                        {formatCurrency(detail.unitPrice)} ₫
                                    </td>

                                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                                        {formatCurrency(detail.amount)} ₫
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 p-6 sm:p-7">
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Grand Total Amount
                                </p>
                                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                                    {formatCurrency(receipt.totalAmount)}{" "}
                                    <span className="text-sm font-bold text-indigo-600">VND</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}