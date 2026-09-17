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

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f8fa] p-6">
                <div className="flex flex-col items-center">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading receipt record...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !receipt) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f8fa] p-6">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M12 9v3m0 4h.01M5.5 19h13a1.5 1.5 0 001.3-2.25l-6.5-11.25a1.5 1.5 0 00-2.6 0L4.2 16.75A1.5 1.5 0 005.5 19z"
                            />
                        </svg>
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-slate-900">
                        Receipt Not Found
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error ||
                            "The requested import receipt could not be retrieved."}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/import-receipts")}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
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
                                strokeWidth={1.8}
                                d="M10 6L4 12l6 6M4 12h16"
                            />
                        </svg>
                        Back to Import Receipts
                    </button>
                </div>
            </div>
        );
    }

    const isCompleted = receipt.status === "COMPLETED";

    return (
        <div className="min-h-screen w-full bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
                            <button
                                type="button"
                                onClick={() => router.push("/import-receipts")}
                                className="transition hover:text-slate-700"
                            >
                                Import Receipts
                            </button>

                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.7}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>

                            <span className="font-medium text-slate-600">
                                {receipt.receiptCode}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                Import Receipt
                            </h1>

                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                                    isCompleted
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-slate-200 bg-slate-50 text-slate-500"
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        isCompleted
                                            ? "bg-emerald-500"
                                            : "bg-slate-400"
                                    }`}
                                />
                                {isCompleted ? "COMPLETED" : "INACTIVE"}
                            </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                            View receipt information, publisher details, and imported books.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
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
                                strokeWidth={1.7}
                                d="M10 6L4 12l6 6M4 12h16"
                            />
                        </svg>
                        Back
                    </button>
                </div>

                {/* Receipt Overview */}
                <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.6}
                                            d="M7 3h8l4 4v14H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.6}
                                            d="M15 3v5h4M9 13h6M9 17h6"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Receipt Code
                                    </p>
                                    <p className="mt-0.5 font-mono text-base font-semibold text-slate-900">
                                        {receipt.receiptCode}
                                    </p>
                                </div>
                            </div>

                            <div className="sm:text-right">
                                <p className="text-xs text-slate-400">
                                    Grand Total
                                </p>
                                <p className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900">
                                    {formatCurrency(receipt.totalAmount)}
                                    <span className="ml-1.5 text-xs font-medium text-slate-400">
                                        VND
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        <div className="px-5 py-4 sm:px-6">
                            <p className="text-xs text-slate-400">
                                Import Date
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                                {receipt.importDate}
                            </p>
                        </div>

                        <div className="px-5 py-4 sm:px-6">
                            <p className="text-xs text-slate-400">
                                Recorded By
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                                {receipt.createdBy?.fullName ||
                                    receipt.createdBy?.username ||
                                    "System Administrator"}
                            </p>
                        </div>

                        <div className="px-5 py-4 sm:px-6">
                            <p className="text-xs text-slate-400">
                                Line Items
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                                {details.length}{" "}
                                {details.length === 1 ? "book" : "books"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Information */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* Receipt Information */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                            <h2 className="text-sm font-semibold text-slate-900">
                                Receipt Information
                            </h2>
                            <p className="mt-1 text-xs text-slate-400">
                                Basic information about this procurement record.
                            </p>
                        </div>

                        <div className="divide-y divide-slate-100 px-5 sm:px-6">
                            <div className="flex items-center justify-between gap-6 py-4">
                                <span className="text-sm text-slate-400">
                                    Receipt Code
                                </span>

                                <span className="font-mono text-sm font-medium text-slate-800">
                                    {receipt.receiptCode}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-6 py-4">
                                <span className="text-sm text-slate-400">
                                    Import Date
                                </span>

                                <span className="text-sm font-medium text-slate-800">
                                    {receipt.importDate}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-6 py-4">
                                <span className="text-sm text-slate-400">
                                    Status
                                </span>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                        isCompleted
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    {isCompleted
                                        ? "COMPLETED"
                                        : "INACTIVE"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-6 py-4">
                                <span className="text-sm text-slate-400">
                                    Recorded By
                                </span>

                                <span className="text-right text-sm font-medium text-slate-800">
                                    {receipt.createdBy?.fullName ||
                                        receipt.createdBy?.username ||
                                        "System Administrator"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Publisher Information */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                            <h2 className="text-sm font-semibold text-slate-900">
                                Publisher Information
                            </h2>
                            <p className="mt-1 text-xs text-slate-400">
                                Contact information of the publishing partner.
                            </p>
                        </div>

                        <div className="divide-y divide-slate-100 px-5 sm:px-6">
                            <div className="flex items-center justify-between gap-6 py-4">
                                <span className="text-sm text-slate-400">
                                    Company Name
                                </span>

                                <span className="text-right text-sm font-semibold text-slate-900">
                                    {receipt.publisher.name}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-6 py-4">
                                <span className="text-sm text-slate-400">
                                    Phone Number
                                </span>

                                <span className="text-right text-sm text-slate-700">
                                    {receipt.publisher.phone ||
                                        "Not recorded"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-6 py-4">
                                <span className="text-sm text-slate-400">
                                    Email Address
                                </span>

                                <span className="max-w-[65%] break-all text-right text-sm text-slate-700">
                                    {receipt.publisher.email ||
                                        "Not recorded"}
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-6 py-4">
                                <span className="text-sm text-slate-400">
                                    Address
                                </span>

                                <span className="max-w-[65%] text-right text-sm leading-5 text-slate-700">
                                    {receipt.publisher.address ||
                                        "Not recorded"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Imported Books */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">
                                Imported Books
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Books included in this import receipt.
                            </p>
                        </div>

                        <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {details.length}{" "}
                            {details.length === 1
                                ? "Line Item"
                                : "Line Items"}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px]">
                            <thead>
                            <tr className="border-b border-slate-100 bg-[#fafafa]">
                                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Book
                                </th>

                                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    ISBN
                                </th>

                                <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Quantity
                                </th>

                                <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Unit Price
                                </th>

                                <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Amount
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                            {details.map((detail) => (
                                <tr
                                    key={detail.id}
                                    className="transition-colors hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.push(
                                                    `/books/${detail.book.id}`
                                                )
                                            }
                                            className="group flex max-w-md items-center gap-2 text-left"
                                        >
                                                <span className="text-sm font-medium text-slate-800 transition-colors group-hover:text-slate-950">
                                                    {detail.book.title}
                                                </span>

                                            <svg
                                                className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.6}
                                                    d="M14 5h5v5M19 5l-8 8M19 13v4a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4"
                                                />
                                            </svg>
                                        </button>
                                    </td>

                                    <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-slate-500">
                                                {detail.book.isbn || "N/A"}
                                            </span>
                                    </td>

                                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">
                                        {detail.quantity}
                                    </td>

                                    <td className="px-6 py-4 text-right text-sm text-slate-600">
                                        {formatCurrency(detail.unitPrice)} ₫
                                    </td>

                                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                                        {formatCurrency(detail.amount)} ₫
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between border-t border-slate-100 bg-[#fafafa] px-5 py-5 sm:justify-end sm:px-6">
                        <span className="text-sm text-slate-500 sm:hidden">
                            Grand Total
                        </span>

                        <div className="text-right">
                            <p className="hidden text-xs text-slate-400 sm:block">
                                Grand Total Amount
                            </p>

                            <p className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900">
                                {formatCurrency(receipt.totalAmount)}
                                <span className="ml-1.5 text-xs font-medium text-slate-400">
                                    VND
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer spacing */}
                <div className="h-2" />
            </div>
        </div>
    );
}