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
            <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f8fa] p-6 font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />

                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Loading category record...
                    </p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f8fa] p-6 font-sans">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 9v3" />
                            <path d="M12 16h.01" />
                            <path d="M10.3 4.6 3.4 16.5A2 2 0 0 0 5.1 19.5h13.8a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z" />
                        </svg>
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                        Category Not Found
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/categories")}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 12H5" />
                            <path d="m12 19-7-7 7-7" />
                        </svg>

                        Back to Categories
                    </button>
                </div>
            </div>
        );
    }

    const isActive = category?.status === "ACTIVE";
    const defaultShelf = category?.defaultShelf;

    return (
        <div className="min-h-screen w-full bg-[#f7f8fa] p-6 font-sans lg:p-8">
            <div className="mx-auto max-w-6xl space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        {/* Breadcrumb */}
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                            <button
                                type="button"
                                onClick={() => router.push("/categories")}
                                className="transition-colors hover:text-slate-900"
                            >
                                Categories
                            </button>

                            <span>/</span>

                            <span className="font-medium text-slate-700">
                                {category?.name || `ID #${categoryId}`}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Category Overview
                            </h1>

                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
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
                        className="group inline-flex h-10 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 active:scale-[0.98] sm:self-auto sm:text-sm"
                    >
                        <svg
                            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 12H5" />
                            <path d="m12 19-7-7 7-7" />
                        </svg>

                        Back
                    </button>
                </div>

                {/* Category Information */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                    {/* Category Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                            {/* Icon */}
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                                <svg
                                    className="h-8 w-8"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M7 7h10" />
                                    <path d="M7 12h10" />
                                    <path d="M7 17h6" />
                                </svg>
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Book Category
                                </p>

                                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    {category?.name}
                                </h2>

                                <p className="mt-2 font-mono text-xs text-slate-400">
                                    Category ID #{category?.id}
                                </p>
                            </div>

                            {/* Status */}
                            <span
                                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                    isActive
                                        ? "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-500/20"
                                        : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-400/20"
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        isActive
                                            ? "bg-emerald-500"
                                            : "bg-slate-400"
                                    }`}
                                />

                                {isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                        </div>
                    </div>

                    {/* Catalog Volume */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Catalog Volume
                        </p>

                        <p className="mt-3 text-4xl font-bold text-slate-900">
                            {books.length}
                        </p>

                        <p className="mt-2 text-xs font-medium text-slate-400">
                            {books.length === 1
                                ? "1 book currently assigned"
                                : `${books.length} books currently assigned`}
                        </p>
                    </div>
                </div>

                {/* Default Shelf */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M4 19h16" />
                                    <path d="M4 15h16" />
                                    <path d="M4 11h16" />
                                    <path d="M4 7h16" />
                                    <path d="M6 4v16" />
                                    <path d="M18 4v16" />
                                </svg>
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Default Shelf
                                </p>

                                {defaultShelf ? (
                                    <>
                                        <h2 className="mt-1 text-lg font-bold text-slate-900">
                                            {defaultShelf.name}
                                        </h2>

                                        <p className="mt-1 font-mono text-xs text-slate-400">
                                            {defaultShelf.shelfCode}
                                        </p>
                                    </>
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-slate-400">
                                        Not Assigned
                                    </p>
                                )}
                            </div>
                        </div>

                        {defaultShelf && (
                            <div
                                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                    defaultShelf.status === "ACTIVE"
                                        ? "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-500/20"
                                        : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-400/20"
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        defaultShelf.status === "ACTIVE"
                                            ? "bg-emerald-500"
                                            : "bg-slate-400"
                                    }`}
                                />

                                {defaultShelf.status || "UNKNOWN"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Assigned Books */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Header */}
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Assigned Books
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                                Click any title to inspect its complete book dossier and physical copies.
                            </p>
                        </div>

                        <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                            {books.length}{" "}
                            {books.length === 1 ? "Book" : "Books"}
                        </span>
                    </div>

                    {/* Empty State */}
                    {books.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                                <svg
                                    className="h-7 w-7"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
                                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 8H20" />
                                </svg>
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
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
                                    onClick={() =>
                                        router.push(`/books/${book.id}`)
                                    }
                                    className="group flex w-full flex-col gap-4 p-5 text-left transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                                >
                                    {/* Book Information */}
                                    <div className="flex min-w-0 items-center gap-4">

                                        {/* Book Icon */}
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors group-hover:border-slate-300 group-hover:bg-white">
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
                                                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 8H20" />
                                            </svg>
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-slate-600 sm:text-base">
                                                {book.title}
                                            </h3>

                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                                <span>
                                                    ISBN:{" "}
                                                    <span className="font-mono text-slate-600">
                                                        {book.isbn || "N/A"}
                                                    </span>
                                                </span>

                                                <span className="hidden sm:inline">
                                                    •
                                                </span>

                                                <span>
                                                    Book ID #{book.id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Arrow */}
                                    <div className="flex items-center justify-between gap-4 pl-15 sm:pl-0">

                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                                book.status === "ACTIVE"
                                                    ? "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-500/20"
                                                    : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-400/20"
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
                                            className="h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-slate-700"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="m9 18 6-6-6-6" />
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