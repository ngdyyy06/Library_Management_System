"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getCategoryById,
    getBooksByCategory,
} from "../../lib/api";

export default function CategoryDetailPage() {
    const params = useParams();
    const router = useRouter();

    const categoryId = Number(params.id);

    const [category, setCategory] = useState<any>(null);
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError("");

                const [categoryData, booksData] = await Promise.all([
                    getCategoryById(categoryId),
                    getBooksByCategory(categoryId),
                ]);

                setCategory(categoryData);
                setBooks(booksData || []);
            } catch (err: any) {
                console.error("Failed to load category detail:", err);
                setError(err.message || "Failed to load category detail");
            } finally {
                setLoading(false);
            }
        }

        if (categoryId) {
            loadData();
        }
    }, [categoryId]);

    // Loading State
    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc] p-6 font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                    <p className="text-sm font-semibold text-slate-500">
                        Loading category record...
                    </p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
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
                        Category Not Found
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/categories")}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                        Back to Categories
                    </button>
                </div>
            </div>
        );
    }

    const isActive = category?.status === "ACTIVE";

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] p-6 font-sans lg:p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header & Navigation */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {/* Breadcrumbs */}
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                            <button
                                type="button"
                                onClick={() => router.push("/categories")}
                                className="transition-colors hover:text-indigo-600"
                            >
                                Categories
                            </button>
                            <span>/</span>
                            <span className="font-semibold text-slate-700">
                                {category?.name || `ID #${categoryId}`}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Category Overview
                            </h1>
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                Classification Record
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Detailed information and book catalog assigned under this genre.
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

                {/* Main Category Banner & Stats Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Hero Gradient Dossier Card */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-500 p-7 text-white shadow-xl shadow-indigo-200/40 lg:col-span-2">
                        {/* Background Deco Ring */}
                        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-5">
                                {/* Icon Container */}
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
                                            d="M7 7h10M7 12h10M7 17h6"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
                                        Book Category
                                    </p>
                                    <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                                        {category?.name}
                                    </h2>
                                    <p className="mt-1 font-mono text-xs text-indigo-100/90">
                                        Category ID #{category?.id}
                                    </p>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <span
                                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${
                                    isActive
                                        ? "border-emerald-200/40 bg-emerald-500/20 text-white"
                                        : "border-white/20 bg-white/10 text-indigo-100"
                                }`}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        isActive ? "bg-emerald-300" : "bg-slate-300"
                                    }`}
                                />
                                {isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                        </div>
                    </div>

                    {/* Metric Counter Card */}
                    <div className="relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs">
                        <span className="absolute right-6 top-6 h-2 w-2 rounded-full bg-indigo-500" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Catalog Volume
                            </p>
                            <p className="mt-3 text-4xl font-extrabold text-slate-900">
                                {books.length}
                            </p>
                        </div>
                        <p className="mt-4 text-xs font-medium text-slate-400">
                            {books.length === 1
                                ? "1 book currently assigned"
                                : `${books.length} books currently assigned`}
                        </p>
                    </div>
                </div>

                {/* Books Catalog in this Category */}
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                    {/* Header */}
                    <div className="flex flex-col gap-2 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Assigned Books
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-400">
                                Click any title to inspect its complete book dossier and physical copies.
                            </p>
                        </div>

                        <span className="w-fit rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-600">
                            {books.length} {books.length === 1 ? "Book" : "Books"}
                        </span>
                    </div>

                    {/* Empty State */}
                    {books.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                <svg
                                    className="h-7 w-7"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-sm font-bold text-slate-900">
                                No Books Assigned
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-slate-400">
                                There are currently no titles indexed under this category.
                            </p>
                        </div>
                    ) : (
                        /* Books List */
                        <div className="divide-y divide-slate-100">
                            {books.map((book) => (
                                <button
                                    key={book.id}
                                    type="button"
                                    onClick={() => router.push(`/books/${book.id}`)}
                                    className="group flex w-full flex-col gap-4 p-5 text-left transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                                >
                                    {/* Book Info */}
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                                            <svg
                                                className="h-6 w-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.8}
                                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                />
                                            </svg>
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600 sm:text-base">
                                                {book.title}
                                            </h3>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                                <span>
                                                    ISBN:{" "}
                                                    <span className="font-mono text-slate-600">
                                                        {book.isbn || "N/A"}
                                                    </span>
                                                </span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>Book ID #{book.id}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Status and Action Indicator */}
                                    <div className="flex items-center justify-between gap-4 pl-16 sm:pl-0">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                                book.status === "ACTIVE"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    book.status === "ACTIVE"
                                                        ? "bg-emerald-500"
                                                        : "bg-slate-400"
                                                }`}
                                            />
                                            {book.status}
                                        </span>

                                        <svg
                                            className="h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-indigo-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}