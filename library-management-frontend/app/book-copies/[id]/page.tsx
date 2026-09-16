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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    AVAILABLE
                </span>
            );
        }
        if (s === "BORROWED") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-600 ring-1 ring-inset ring-amber-500/20">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    BORROWED
                </span>
            );
        }
        if (s === "LOST") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-500/20">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    LOST
                </span>
            );
        }
        if (s === "DAMAGED") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1 text-xs font-semibold text-orange-600 ring-1 ring-inset ring-orange-500/20">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    DAMAGED
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-400/20">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                {s || "UNAVAILABLE"}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#f8fafc] p-8 font-sans flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading copy details...</p>
                </div>
            </div>
        );
    }

    if (!bookCopy) {
        return (
            <div className="min-h-screen w-full bg-[#f8fafc] p-8 font-sans flex flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">Book Copy Not Found</h3>
                <p className="mt-1 text-xs text-slate-400">The requested physical copy ID #{id} does not exist or was removed.</p>
                <button
                    onClick={() => router.push("/book-copies")}
                    className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
                >
                    Back to Book Copies
                </button>
            </div>
        );
    }

    const effectiveStatus = getEffectiveStatus(bookCopy);
    const canRestore = effectiveStatus === "LOST" || effectiveStatus === "DAMAGED" || effectiveStatus === "REMOVED";
    const authors = bookCopy.book?.authors || [];

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] p-6 lg:p-8 font-sans">
            <div className="mx-auto max-w-4xl space-y-6">

                {/* Top Navigation / Breadcrumb */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push("/book-copies")}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Inventory
                    </button>

                    {canRestore && (
                        <button
                            onClick={handleRestore}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-emerald-700"
                        >
                            Restore to Circulation
                        </button>
                    )}
                </div>

                {/* Main Dossier Card */}
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                    {/* Header Banner */}
                    <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-8 text-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner backdrop-blur-md">
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-200">
                                        COPY RECORD #{bookCopy.id}
                                    </span>
                                    <h1 className="mt-0.5 font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                        {bookCopy.barcode}
                                    </h1>
                                </div>
                            </div>

                            <div className="self-start sm:self-auto">
                                {renderStatusBadge(effectiveStatus)}
                            </div>
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 sm:p-8 space-y-6">

                        {/* Linked Book Details Box */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Linked Catalog Title
                                </span>
                                {bookCopy.book?.id && (
                                    <button
                                        onClick={() => router.push(`/books/${bookCopy.book.id}`)}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                        View Book Dossier →
                                    </button>
                                )}
                            </div>

                            <h2 className="mt-2 text-xl font-bold text-slate-900">
                                {bookCopy.book?.title || "Unknown Book Title"}
                            </h2>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                                <span className="font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                    ISBN: {bookCopy.book?.isbn || "—"}
                                </span>
                                <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                    Publisher: {bookCopy.book?.publisher?.name || "—"}
                                </span>
                                {bookCopy.book?.publishYear && (
                                    <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                        Year: {bookCopy.book.publishYear}
                                    </span>
                                )}
                            </div>

                            {/* Authors */}
                            <div className="mt-4 pt-3 border-t border-slate-200/60">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                                    Authors:
                                </span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {authors.length > 0 ? (
                                        authors.map((author: any) => (
                                            <span
                                                key={author.id}
                                                className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 border border-indigo-100"
                                            >
                                                {author.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs italic text-slate-400">No author details attached</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Physical Inventory Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                                <span className="text-[11px] font-semibold uppercase text-slate-400">Physical Barcode</span>
                                <p className="mt-1 font-mono text-sm font-bold text-slate-800">
                                    {bookCopy.barcode}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                                <span className="text-[11px] font-semibold uppercase text-slate-400">Circulation State</span>
                                <p className="mt-1 text-sm font-bold text-slate-800">
                                    {effectiveStatus}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                                <span className="text-[11px] font-semibold uppercase text-slate-400">Book Status</span>
                                <p className="mt-1 text-sm font-bold text-slate-800">
                                    {bookCopy.book?.status || "ACTIVE"}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}