"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    getBookShelfById,
    getCategories,
    getBooksByCategory,
} from "@/app/lib/api";

interface BookShelf {
    id: number;
    shelfCode: string;
    name: string;
    status: string;
}

interface Category {
    id: number;
    name: string;
    status: string;
    defaultShelf?: BookShelf | null;
}

interface Book {
    id: number;
    title: string;
    isbn?: string;
    status?: string;
}

export default function BookShelfDetailPage() {

    const params = useParams();
    const shelfId = Number(params.id);

    const [shelf, setShelf] =
        useState<BookShelf | null>(null);

    const [categories, setCategories] =
        useState<Category[]>([]);

    const [books, setBooks] =
        useState<Book[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {

        const loadData = async () => {

            try {

                setLoading(true);
                setError("");

                const [
                    shelfData,
                    categoryData,
                ] = await Promise.all([
                    getBookShelfById(shelfId),
                    getCategories(),
                ]);

                setShelf(shelfData);
                setCategories(categoryData);

                /*
                 * Lấy các category có shelf hiện tại
                 */
                const shelfCategories =
                    categoryData.filter(
                        (category: Category) =>
                            category.defaultShelf?.id === shelfId
                    );

                /*
                 * Lấy sách của từng category
                 */
                const bookResults =
                    await Promise.all(
                        shelfCategories.map(
                            (category: Category) =>
                                getBooksByCategory(category.id)
                                    .catch(() => [])
                        )
                    );

                /*
                 * Gộp tất cả sách lại
                 */
                const allBooks: Book[] =
                    bookResults.flat();

                /*
                 * Loại bỏ sách trùng.
                 * Một đầu sách có thể thuộc nhiều category.
                 */
                const uniqueBooks =
                    Array.from(
                        new Map(
                            allBooks.map(
                                (book: Book) => [
                                    book.id,
                                    book,
                                ]
                            )
                        ).values()
                    );

                setBooks(uniqueBooks);

            } catch (error: any) {

                setError(
                    error?.message ||
                    "Failed to load shelf details"
                );

            } finally {

                setLoading(false);
            }
        };

        if (!Number.isNaN(shelfId)) {
            loadData();
        }

    }, [shelfId]);


    const defaultCategories = categories.filter(
        (category) =>
            category.defaultShelf?.id === shelfId
    );


    if (loading) {

        return (
            <div className="min-h-screen bg-[#f7f8fa] p-6 font-sans sm:p-8">

                <div className="mx-auto flex min-h-[500px] max-w-5xl items-center justify-center">

                    <div className="flex flex-col items-center gap-3">

                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Loading shelf details...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    if (error || !shelf) {

        return (
            <div className="min-h-screen bg-[#f7f8fa] p-6 font-sans sm:p-8">

                <div className="mx-auto max-w-5xl">

                    <Link
                        href="/book-shelves"
                        className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                    >
                        ← Back to Book Shelves
                    </Link>

                    <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                        {error || "Shelf not found."}
                    </div>

                </div>

            </div>
        );
    }


    return (
        <div className="min-h-screen bg-[#f7f8fa] p-6 font-sans sm:p-8">

            <div className="mx-auto max-w-5xl space-y-6">

                {/* HEADER */}

                <div>

                    <Link
                        href="/book-shelves"
                        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900"
                    >
                        ← Back to Book Shelves
                    </Link>

                    <div className="mt-5">

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Library Management
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Shelf Details
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            View physical shelf information and its assigned books.
                        </p>

                    </div>

                </div>


                {/* SHELF INFORMATION */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-6 py-5">

                        <h2 className="text-sm font-bold text-slate-900">
                            Shelf Information
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Basic information about this physical shelf.
                        </p>

                    </div>


                    <div className="grid gap-4 p-6 sm:grid-cols-2">

                        {/* ID */}

                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">

                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Shelf ID
                            </p>

                            <p className="mt-2 font-mono text-sm font-semibold text-slate-900">
                                #{shelf.id}
                            </p>

                        </div>


                        {/* CODE */}

                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">

                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Shelf Code
                            </p>

                            <p className="mt-2 font-mono text-sm font-semibold text-slate-900">
                                {shelf.shelfCode}
                            </p>

                        </div>


                        {/* NAME */}

                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">

                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Shelf Name
                            </p>

                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                {shelf.name}
                            </p>

                        </div>


                        {/* STATUS */}

                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">

                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Status
                            </p>

                            <span
                                className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                    shelf.status === "ACTIVE"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-slate-100 text-slate-500"
                                }`}
                            >

                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        shelf.status === "ACTIVE"
                                            ? "bg-emerald-500"
                                            : "bg-slate-400"
                                    }`}
                                />

                                {shelf.status}

                            </span>

                        </div>

                    </div>

                </div>


                {/* BOOKS ON SHELF */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                        <div>

                            <h2 className="text-sm font-bold text-slate-900">
                                Books on This Shelf
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Book titles assigned through the shelf's default categories.
                            </p>

                        </div>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                            {books.length}
                        </span>

                    </div>


                    {books.length === 0 ? (

                        <div className="px-6 py-12 text-center">

                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeWidth={1.6}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H6.5A2.5 2.5 0 0 0 4 22V6.5Z"
                                    />

                                    <path
                                        strokeWidth={1.6}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20M4 6.5V22"
                                    />
                                </svg>

                            </div>

                            <p className="mt-4 text-sm font-semibold text-slate-700">
                                No books on this shelf
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                No book titles are currently assigned to this shelf.
                            </p>

                        </div>

                    ) : (

                        <div className="divide-y divide-slate-100">

                            {books.map((book) => (

                                <div
                                    key={book.id}
                                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50/60"
                                >

                                    <div className="flex min-w-0 items-center gap-4">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">

                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeWidth={1.6}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 4.5A2.5 2.5 0 0 1 8.5 2H20v17H8.5A2.5 2.5 0 0 0 6 21.5V4.5Z"
                                                />

                                                <path
                                                    strokeWidth={1.6}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 4.5V21.5M10 6h6M10 10h6"
                                                />
                                            </svg>

                                        </div>


                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {book.title}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Book ID: #{book.id}
                                                {book.isbn
                                                    ? ` • ISBN: ${book.isbn}`
                                                    : ""}
                                            </p>

                                        </div>

                                    </div>


                                    {book.status && (

                                        <span
                                            className={`ml-4 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                book.status === "ACTIVE"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {book.status}
                                        </span>

                                    )}

                                </div>

                            ))}

                        </div>

                    )}

                </div>


                {/* DEFAULT CATEGORIES */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                        <div>

                            <h2 className="text-sm font-bold text-slate-900">
                                Default Categories
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Categories that use this shelf as their default physical location.
                            </p>

                        </div>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                            {defaultCategories.length}
                        </span>

                    </div>


                    {defaultCategories.length === 0 ? (

                        <div className="px-6 py-12 text-center">

                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeWidth={1.6}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 7h16M4 12h16M4 17h16"
                                    />
                                </svg>

                            </div>

                            <p className="mt-4 text-sm font-semibold text-slate-700">
                                No default categories
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                No category is currently assigned to this shelf as its default location.
                            </p>

                        </div>

                    ) : (

                        <div className="divide-y divide-slate-100">

                            {defaultCategories.map(
                                (category) => (

                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between px-6 py-4"
                                    >

                                        <div>

                                            <p className="text-sm font-semibold text-slate-800">
                                                {category.name}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Category ID: #{category.id}
                                            </p>

                                        </div>


                                        <span
                                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                category.status === "ACTIVE"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {category.status}
                                        </span>

                                    </div>
                                )
                            )}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}