"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getBookCopies,
    restoreBookCopy,
} from "@/app/lib/api";

export default function BookCopyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const [bookCopy, setBookCopy] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const loadBookCopy = async () => {
        try {
            setLoading(true);
            const data = await getBookCopies();
            const found = (data || []).find((c: any) => c.id === id);
            setBookCopy(found || null);
        } catch (error) {
            console.error("Failed to load book copy:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadBookCopy();
        }
    }, [id]);

    const handleRestore = async () => {
        if (!bookCopy) return;

        const confirmed = window.confirm(
            `Are you sure you want to restore copy "${bookCopy.barcode}" to circulation?`
        );

        if (!confirmed) return;

        try {
            await restoreBookCopy(bookCopy.id);
            await loadBookCopy();
            alert("Book copy restored successfully");
        } catch (error: any) {
            alert(error.message || "Failed to restore book copy");
        }
    };

    const getEffectiveStatus = (copy: any) => {
        if (!copy) return "UNKNOWN";

        const rawStatus = (copy.status || "").toUpperCase();

        if (
            rawStatus === "LOST" ||
            rawStatus === "DAMAGED" ||
            rawStatus === "BORROWED" ||
            rawStatus === "REMOVED"
        ) {
            return rawStatus;
        }

        if (
            (copy.book?.status || "").toUpperCase() === "INACTIVE" &&
            rawStatus === "AVAILABLE"
        ) {
            return "UNAVAILABLE";
        }

        return rawStatus || "AVAILABLE";
    };

    const renderStatusBadge = (status: string) => {
        const s = (status || "").toUpperCase();

        if (s === "AVAILABLE") {
            return (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    AVAILABLE
                </span>
            );
        }

        if (s === "BORROWED") {
            return (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    BORROWED
                </span>
            );
        }

        if (s === "LOST") {
            return (
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    LOST
                </span>
            );
        }

        if (s === "DAMAGED") {
            return (
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 ring-1 ring-inset ring-orange-600/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    DAMAGED
                </span>
            );
        }

        if (s === "REMOVED") {
            return (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    REMOVED
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/15">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                {s || "UNAVAILABLE"}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f8fa] p-8 font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-black" />
                    <p className="text-xs font-medium text-slate-400">
                        Loading copy details...
                    </p>
                </div>
            </div>
        );
    }

    if (!bookCopy) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f7f8fa] p-8 text-center font-sans">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-500 shadow-sm">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                            d="M12 9v3m0 4h.01M4.5 19h15a1 1 0 0 0 .87-1.5l-7.5-13a1 1 0 0 0-1.74 0l-7.5 13A1 1 0 0 0 4.5 19Z"
                        />
                    </svg>
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                    Book Copy Not Found
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                    The requested physical copy ID #{id} does not exist or was removed.
                </p>

                <button
                    onClick={() => router.push("/book-copies")}
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
                            strokeWidth="1.8"
                            d="M19 12H5m7 7-7-7 7-7"
                        />
                    </svg>
                    Back to Book Copies
                </button>
            </div>
        );
    }

    const effectiveStatus = getEffectiveStatus(bookCopy);

    const canRestore =
        effectiveStatus === "LOST" ||
        effectiveStatus === "DAMAGED" ||
        effectiveStatus === "REMOVED";

    const authors = bookCopy.book?.authors || [];

    return (
        <div className="min-h-screen w-full bg-[#f7f8fa] p-5 font-sans sm:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl space-y-6">

                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                            <button
                                onClick={() => router.push("/book-copies")}
                                className="transition hover:text-slate-700"
                            >
                                Book Copies
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
                                    strokeWidth="1.8"
                                    d="m9 18 6-6-6-6"
                                />
                            </svg>

                            <span className="text-slate-500">
                                Copy #{bookCopy.id}
                            </span>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            Book Copy Details
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Physical copy information and circulation status.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => router.push("/book-copies")}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
                                    strokeWidth="1.8"
                                    d="M19 12H5m7 7-7-7 7-7"
                                />
                            </svg>
                            Back
                        </button>

                        {canRestore && (
                            <button
                                onClick={handleRestore}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                                        strokeWidth="1.8"
                                        d="M3 12a9 9 0 0 1 15.36-6.36L21 8m0 0V3m0 5h-5M21 12a9 9 0 0 1-15.36 6.36L3 16m0 0v5m0-5h5"
                                    />
                                </svg>
                                Restore
                            </button>
                        )}
                    </div>
                </div>

                {/* Copy Overview */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.6"
                                            d="M6 4.5A2.5 2.5 0 0 1 8.5 2H20v17H8.5A2.5 2.5 0 0 0 6 21.5m0-17A2.5 2.5 0 0 0 3.5 7v12A2.5 2.5 0 0 0 6 21.5m0-17v17"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                        Copy Record #{bookCopy.id}
                                    </p>

                                    <h2 className="mt-1 font-mono text-xl font-semibold text-slate-900">
                                        {bookCopy.barcode}
                                    </h2>
                                </div>
                            </div>

                            {renderStatusBadge(effectiveStatus)}
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">

                        {/* Linked Book */}
                        <section>
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Linked Book
                                    </p>

                                    <h3 className="mt-1 text-lg font-semibold text-slate-900">
                                        {bookCopy.book?.title || "Unknown Book Title"}
                                    </h3>
                                </div>

                                {bookCopy.book?.id && (
                                    <button
                                        onClick={() =>
                                            router.push(`/books/${bookCopy.book.id}`)
                                        }
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                                    >
                                        View Book
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.8"
                                                d="M5 12h14m-6-6 6 6-6 6"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <p className="text-xs font-medium text-slate-400">
                                        ISBN
                                    </p>
                                    <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                                        {bookCopy.book?.isbn || "—"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <p className="text-xs font-medium text-slate-400">
                                        Publisher
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {bookCopy.book?.publisher?.name || "—"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <p className="text-xs font-medium text-slate-400">
                                        Publish Year
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {bookCopy.book?.publishYear || "—"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Authors */}
                        <section className="mt-6 border-t border-slate-200 pt-6">
                            <div className="mb-3 flex items-center gap-2">
                                <svg
                                    className="h-4 w-4 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.7"
                                        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-3a4 4 0 0 1 0 8m0-8a4 4 0 0 1 3 1.35"
                                    />
                                </svg>

                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Authors
                                </p>
                            </div>

                            {authors.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {authors.map((author: any) => (
                                        <span
                                            key={author.id}
                                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                                        >
                                            {author.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm italic text-slate-400">
                                    No author details attached.
                                </p>
                            )}
                        </section>

                        {/* Physical Copy Information */}
                        <section className="mt-6 border-t border-slate-200 pt-6">
                            <div className="mb-4 flex items-center gap-2">
                                <svg
                                    className="h-4 w-4 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.7"
                                        d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H6.5A2.5 2.5 0 0 0 4 22.5m0-16A2.5 2.5 0 0 0 1.5 9v11A2.5 2.5 0 0 0 4 22.5m0-16v16"
                                    />
                                </svg>

                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Physical Copy Information
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs font-medium text-slate-400">
                                        Barcode
                                    </p>

                                    <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                                        {bookCopy.barcode}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs font-medium text-slate-400">
                                        Circulation State
                                    </p>

                                    <div className="mt-2">
                                        {renderStatusBadge(effectiveStatus)}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs font-medium text-slate-400">
                                        Book Status
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                        {bookCopy.book?.status || "ACTIVE"}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}