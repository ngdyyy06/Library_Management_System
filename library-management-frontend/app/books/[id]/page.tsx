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

    // ── Loading Skeleton ──
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                    <p className="text-sm font-semibold text-slate-500">
                        Loading book details...
                    </p>
                </div>
            </div>
        );
    }

    // ── Not Found State ──
    if (!book) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-lg">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500">
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
                        Book Not Found
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        The requested book ID #{id} does not exist or has been
                        removed.
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/books")}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
                    >
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

    return (
        <div className="min-h-screen bg-slate-50 p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-6xl space-y-8">

                {/* ── Top Navigation & Breadcrumbs ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                            <button
                                type="button"
                                onClick={() => router.push("/books")}
                                className="transition-colors hover:text-indigo-600"
                            >
                                Books
                            </button>

                            <span>/</span>

                            <span className="max-w-xs truncate font-semibold text-slate-700">
                                {book.title}
                            </span>
                        </div>

                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Book Information
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="group inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 sm:self-auto sm:text-sm"
                    >
                        <svg
                            className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>

                        <span>Back</span>
                    </button>
                </div>

                {/* ── Main Layout: 2 Columns ── */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                    {/* ── Left Column ── */}
                    <div className="space-y-6 lg:col-span-4">

                        {/* Book Cover Card */}
                        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-500 p-8 text-white shadow-xl shadow-indigo-200/50">

                            {/* Decorative background glow */}
                            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-xl" />
                            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/10 blur-xl" />

                            <div className="relative z-10 flex flex-col items-center text-center">

                                {/* Book Icon Badge */}
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner backdrop-blur-md">
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
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        />
                                    </svg>
                                </div>

                                <h2 className="text-xl font-extrabold leading-snug">
                                    {book.title}
                                </h2>

                                {/* Publisher */}
                                <p>
                                    {book.publisher
                                        ? `Published by ${book.publisher.name}`
                                        : "Catalog Title"}
                                </p>

                                {/* ISBN */}
                                <div className="mt-6 rounded-lg border border-white/15 bg-black/20 px-3 py-1.5 font-mono text-xs text-indigo-100 backdrop-blur-sm">
                                    ISBN: {book.isbn}
                                </div>
                            </div>
                        </div>

                        {/* Stock Inventory Card */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Inventory & Stock
                            </h3>

                            <div className="mt-4 grid grid-cols-2 gap-4">

                                {/* Total */}
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-center">
                                    <p className="text-[11px] font-semibold uppercase text-slate-400">
                                        Total Copies
                                    </p>

                                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                                        {totalQty}
                                    </p>
                                </div>

                                {/* Available */}
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-center">
                                    <p className="text-[11px] font-semibold uppercase text-emerald-600">
                                        Available
                                    </p>

                                    <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                                        {availableQty}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4">
                                <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-500">
                                    <span>Stock Availability</span>
                                    <span>{stockPercent}%</span>
                                </div>

                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                                        style={{
                                            width: `${stockPercent}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column ── */}
                    <div className="space-y-6 lg:col-span-8">

                        {/* Overview Dossier Card */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">

                            {/* Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                                        Title Overview
                                    </span>

                                    <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                                        {book.title}
                                    </h2>
                                </div>

                                {/* Status */}
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                                        isActive
                                            ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                                            : "border-slate-200 bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            isActive
                                                ? "animate-pulse bg-emerald-500"
                                                : "bg-slate-400"
                                        }`}
                                    />

                                    {book.status}
                                </span>
                            </div>

                            {/* Authors Section */}
                            <div className="mt-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Authors
                                </p>

                                <div className="mt-2.5 flex flex-wrap gap-2">
                                    {book.authors && book.authors.length > 0 ? (
                                        book.authors.map(
                                            (
                                                author: any,
                                                idx: number
                                            ) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700"
                                                >
                                                    <svg
                                                        className="h-3.5 w-3.5 text-indigo-500"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>

                                                    {author.name}
                                                </span>
                                            )
                                        )
                                    ) : (
                                        <span className="text-sm italic text-slate-400">
                                            No authors listed
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Metadata Tiles */}
                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

                                {/* Publisher */}
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Publisher
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {book.publisher?.name || "—"}
                                    </p>
                                </div>

                                {/* Publish Year */}
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Publish Year
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {book.publishYear || "—"}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Price
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-900">
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

                                {/* ISBN */}
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Standard ISBN
                                    </p>

                                    <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                                        {book.isbn || "—"}
                                    </p>
                                </div>

                                {/* Catalog ID */}
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Catalog ID
                                    </p>

                                    <p className="mt-1 font-mono text-sm font-bold text-indigo-600">
                                        #{book.id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description Card */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <svg
                                    className="h-4 w-4 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h7"
                                    />
                                </svg>

                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Synopsis & Description
                                </h3>
                            </div>

                            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
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