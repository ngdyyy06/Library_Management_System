"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBookById } from "@/app/lib/api";

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBook = async () => {
            try {
                const data = await getBookById(id);
                setBook(data);
            } catch (error) {
                console.error("Failed to load book:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadBook();
        }
    }, [id]);

    // ── Loading State ──
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Loading book details...
                    </p>
                </div>
            </div>
        );
    }

    // ── Not Found State ──
    if (!book) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-6">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    <h2 className="mt-4 text-base font-bold text-slate-900">
                        Book Not Found
                    </h2>

                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        The requested book ID #{id} does not exist or has been
                        removed.
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/books")}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
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
                                d="M15 18l-6-6 6-6"
                            />
                        </svg>

                        Back to Catalog
                    </button>
                </div>
            </div>
        );
    }

    const isActive = book.status === "ACTIVE";
    const availableQty = book.availableQuantity ?? 0;
    const totalQty = book.totalQuantity ?? 0;

    const stockPercent =
        totalQty > 0
            ? Math.round((availableQty / totalQty) * 100)
            : 0;

    const shelf = book.shelf;
    const primaryCategory = book.primaryCategory;

    return (
        <div className="min-h-screen w-full bg-[#f7f8fa] p-6 font-sans sm:p-8">
            <div className="mx-auto max-w-6xl space-y-6">

                {/* ========================================================= */}
                {/* HEADER                                                     */}
                {/* ========================================================= */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                            <button
                                type="button"
                                onClick={() => router.push("/books")}
                                className="font-medium transition hover:text-slate-900"
                            >
                                Books
                            </button>

                            <span>/</span>

                            <span className="max-w-xs truncate font-medium text-slate-600">
                                {book.title}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Book Information
                            </h1>

                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                                    isActive
                                        ? "bg-emerald-50 text-emerald-600 ring-emerald-500/20"
                                        : "bg-slate-100 text-slate-500 ring-slate-400/20"
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        isActive
                                            ? "bg-emerald-500"
                                            : "bg-slate-400"
                                    }`}
                                />

                                {book.status}
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            View catalog information, publication details, and
                            inventory availability.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 sm:self-auto"
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
                                d="M10 19l-7-7 7-7m-7 7h18"
                            />
                        </svg>

                        Back
                    </button>
                </div>

                {/* ========================================================= */}
                {/* MAIN CONTENT                                               */}
                {/* ========================================================= */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                    {/* ===================================================== */}
                    {/* LEFT COLUMN                                            */}
                    {/* ===================================================== */}
                    <div className="space-y-6 lg:col-span-4">

                        {/* Book Identity Card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                    <svg
                                        className="h-7 w-7"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.6}
                                            d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v17H6.5A2.5 2.5 0 014 16.5v-12A2.5 2.5 0 016.5 2z"
                                        />
                                    </svg>
                                </div>

                                <span className="font-mono text-xs font-semibold text-slate-400">
                                    #{book.id}
                                </span>
                            </div>

                            <h2 className="mt-5 text-xl font-bold leading-snug text-slate-900">
                                {book.title}
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                {book.publisher
                                    ? `Published by ${book.publisher.name}`
                                    : "Catalog Title"}
                            </p>

                            <div className="mt-5 border-t border-slate-100 pt-4">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    ISBN
                                </p>

                                <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                                    {book.isbn || "—"}
                                </p>
                            </div>
                        </div>

                        {/* Inventory Card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2">
                                <svg
                                    className="h-4 w-4 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.7}
                                        d="M3 7h18M5 7v13h14V7M8 7V4h8v3"
                                    />
                                </svg>

                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Inventory & Stock
                                </h3>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Total Copies
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {totalQty}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                                        Available
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-emerald-700">
                                        {availableQty}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">
                                        Stock Availability
                                    </span>

                                    <span className="text-xs font-semibold text-slate-700">
                                        {stockPercent}%
                                    </span>
                                </div>

                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                                        style={{
                                            width: `${stockPercent}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ================================================= */}
                        {/* SHELF CARD                                         */}
                        {/* ================================================= */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.6}
                                            d="M4 19h16M4 15h16M4 11h16M6 7h12M8 3h8"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Physical Location
                                    </h3>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        Library shelf
                                    </p>
                                </div>
                            </div>

                            {shelf ? (
                                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-mono text-sm font-bold text-slate-900">
                                                {shelf.shelfCode}
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                                {shelf.name}
                                            </p>
                                        </div>

                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${
                                                shelf.status === "ACTIVE"
                                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
                                                    : "bg-slate-100 text-slate-500 ring-slate-500/15"
                                            }`}
                                        >
                                            {shelf.status || "—"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
                                    <p className="text-sm font-medium text-slate-500">
                                        Shelf not assigned
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-400">
                                        This book does not have a physical
                                        shelf assigned yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ===================================================== */}
                    {/* RIGHT COLUMN                                           */}
                    {/* ===================================================== */}
                    <div className="space-y-6 lg:col-span-8">

                        {/* Catalog Overview */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Catalog Overview
                                    </p>

                                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                                        {book.title}
                                    </h2>
                                </div>

                                <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 sm:flex">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.6}
                                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 016 0M9 5h6"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Authors */}
                            <div className="mt-5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Authors
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {book.authors &&
                                    book.authors.length > 0 ? (
                                        book.authors.map(
                                            (
                                                author: any,
                                                idx: number
                                            ) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                                                >
                                                    <svg
                                                        className="h-3.5 w-3.5 text-slate-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.6}
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>

                                                    {author.name}
                                                </span>
                                            )
                                        )
                                    ) : (
                                        <span className="text-xs italic text-slate-400">
                                            No authors listed
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="mt-6">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Categories
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {book.categories &&
                                    book.categories.length > 0 ? (
                                        book.categories.map(
                                            (
                                                category: any,
                                                idx: number
                                            ) => (
                                                <span
                                                    key={
                                                        category.id ??
                                                        idx
                                                    }
                                                    className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                                                        primaryCategory?.id ===
                                                        category.id
                                                            ? "border-slate-300 bg-slate-900 text-white"
                                                            : "border-slate-200 bg-slate-50 text-slate-700"
                                                    }`}
                                                >
                                                    {category.name}

                                                    {primaryCategory?.id ===
                                                        category.id && (
                                                            <span className="ml-1.5 text-[10px] font-medium text-slate-300">
                                                            Primary
                                                        </span>
                                                        )}
                                                </span>
                                            )
                                        )
                                    ) : (
                                        <span className="text-xs italic text-slate-400">
                                            No categories assigned
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Publisher
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {book.publisher?.name || "—"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Publish Year
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {book.publishYear || "—"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Price
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {book.price !== undefined &&
                                        book.price !== null
                                            ? `${Number(
                                                book.price
                                            ).toLocaleString(
                                                "vi-VN"
                                            )} VND`
                                            : "—"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Standard ISBN
                                    </p>

                                    <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                                        {book.isbn || "—"}
                                    </p>
                                </div>

                                {/* Primary Category */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Primary Category
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {primaryCategory?.name || "—"}
                                    </p>
                                </div>

                                {/* Shelf */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Shelf
                                    </p>

                                    {shelf ? (
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-sm font-semibold text-slate-900">
                                                {shelf.shelfCode}
                                            </span>

                                            <span className="text-xs text-slate-400">
                                                {shelf.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="mt-1 text-sm font-semibold text-slate-400">
                                            Not assigned
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:col-span-2">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Catalog ID
                                    </p>

                                    <p className="mt-1 font-mono text-sm font-semibold text-slate-700">
                                        #{book.id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.6}
                                            d="M4 6h16M4 12h16M4 18h10"
                                        />
                                    </svg>
                                </div>

                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Synopsis & Description
                                </h3>
                            </div>

                            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                                {book.description ||
                                    "No description provided for this book title."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}