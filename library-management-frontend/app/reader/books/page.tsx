"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "@/app/components/RoleGuard";
import { getBooks } from "@/app/lib/api";

interface Author {
    id: number;
    name: string;
}

interface Publisher {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface Book {
    id: number;
    title: string;
    isbn: string;
    publisher: Publisher | null;
    publishYear: number | null;
    price: number;
    description: string | null;
    totalQuantity: number;
    availableQuantity: number;
    status: string;
    authors: Author[];
    categories: Category[];
}

export default function ReaderBooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBooks = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getBooks();

            setBooks(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load books");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBooks();
    }, []);

    const filteredBooks = books.filter((book) => {
        const keyword = search.toLowerCase();

        return (
            book.title.toLowerCase().includes(keyword) ||
            book.isbn.toLowerCase().includes(keyword) ||
            book.authors?.some((author) =>
                author.name.toLowerCase().includes(keyword)
            )
        );
    });

    return (
        <RoleGuard allowedRoles={["READER"]}>
            <div className="min-h-screen bg-[#f7f8fa] p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Books
                            </h1>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                Library Catalog
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Browse books available in the library.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="relative w-full max-w-xl">
                            <svg
                                className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.7}
                                    d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search title, ISBN, or author..."
                                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                            <svg
                                className="mt-0.5 h-5 w-5 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.7}
                                    d="M12 9v3m0 4h.01M10.3 3.5l-8 14A2 2 0 004 20.5h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z"
                                />
                            </svg>

                            <span>{error}</span>
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

                            <p className="mt-4 text-sm text-slate-500">
                                Loading books...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Result Summary */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    Showing{" "}
                                    <span className="font-semibold text-slate-900">
                                        {filteredBooks.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-slate-900">
                                        {books.length}
                                    </span>{" "}
                                    books
                                </p>
                            </div>

                            {filteredBooks.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
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
                                                d="M4 5.5A2.5 2.5 0 016.5 3H20v17H6.5A2.5 2.5 0 014 17.5v-12zM8 7h8M8 11h8M8 15h5"
                                            />
                                        </svg>
                                    </div>

                                    <h2 className="mt-4 text-base font-semibold text-slate-900">
                                        No books found
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Try adjusting your search keywords.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredBooks.map((book) => (
                                        <div
                                            key={book.id}
                                            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                                        >
                                            {/* Book Header */}
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                                    <svg
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.7}
                                                            d="M5 5.5A2.5 2.5 0 017.5 3H12v17H7.5A2.5 2.5 0 015 17.5v-12zM12 3h4.5A2.5 2.5 0 0119 5.5v12a2.5 2.5 0 01-2.5 2.5H12"
                                                        />
                                                    </svg>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h2 className="line-clamp-2 text-base font-bold leading-6 text-slate-900">
                                                        {book.title}
                                                    </h2>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        ISBN: {book.isbn}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Book Information */}
                                            <div className="mt-5 space-y-4">

                                                {/* Authors */}
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        Authors
                                                    </p>

                                                    <p className="mt-1.5 text-sm leading-5 text-slate-700">
                                                        {book.authors?.length
                                                            ? book.authors
                                                                .map(
                                                                    (author) =>
                                                                        author.name
                                                                )
                                                                .join(", ")
                                                            : "N/A"}
                                                    </p>
                                                </div>

                                                {/* Publisher */}
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        Publisher
                                                    </p>

                                                    <p className="mt-1.5 text-sm text-slate-700">
                                                        {book.publisher?.name ||
                                                            "N/A"}
                                                    </p>
                                                </div>

                                                {/* Categories */}
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        Categories
                                                    </p>

                                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                        {book.categories?.length ? (
                                                            book.categories.map(
                                                                (category) => (
                                                                    <span
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </span>
                                                                )
                                                            )
                                                        ) : (
                                                            <span className="text-sm text-slate-500">
                                                                N/A
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Availability */}
                                            <div className="mt-5 border-t border-slate-100 pt-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Availability
                                                        </p>

                                                        <div className="mt-1 flex items-baseline gap-1.5">
                                                            <span className="text-base font-bold text-slate-900">
                                                                {
                                                                    book.availableQuantity
                                                                }
                                                            </span>

                                                            <span className="text-sm text-slate-400">
                                                                /{" "}
                                                                {
                                                                    book.totalQuantity
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                                                            book.status ===
                                                            "ACTIVE"
                                                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                                                                : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-300/60"
                                                        }`}
                                                    >
                                                        {book.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Detail */}
                                            <div className="mt-5">
                                                <Link
                                                    href={`/reader/books/${book.id}`}
                                                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 active:scale-[0.98]"
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
                                                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                                                        />
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="2.5"
                                                            strokeWidth={1.7}
                                                        />
                                                    </svg>

                                                    Detail
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}