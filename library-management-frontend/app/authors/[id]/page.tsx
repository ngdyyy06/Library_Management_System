"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getAuthorById,
    getBooksByAuthorId,
} from "../../lib/api";

export default function AuthorDetailPage() {
    const params = useParams();
    const router = useRouter();

    const [author, setAuthor] = useState<any | null>(null);
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAuthorDetail();
    }, []);

    const loadAuthorDetail = async () => {
        try {
            setLoading(true);

            const authorId = Number(params.id);

            const [authorData, booksData] = await Promise.all([
                getAuthorById(authorId),
                getBooksByAuthorId(authorId),
            ]);

            setAuthor(authorData);
            setBooks(booksData || []);
        } catch (error) {
            console.error("Failed to load author detail:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Loading author...
                    </p>
                </div>
            </div>
        );
    }

    if (!author) {
        return (
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
                    <h2 className="text-lg font-bold text-slate-900">
                        Author not found
                    </h2>

                    <button
                        onClick={() => router.push("/authors")}
                        className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                        Back to Authors
                    </button>
                </div>
            </div>
        );
    }

    const isActive =
        author.status === "ACTIVE" || author.active === true;

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] p-6 font-sans lg:p-8">
            <div className="w-full space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <button
                            onClick={() => router.push("/authors")}
                            className="mb-3 text-xs font-semibold text-slate-500 transition hover:text-indigo-600"
                        >
                            ← Back to Authors
                        </button>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Author Details
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            View author information and associated books.
                        </p>
                    </div>
                </div>

                {/* Author Information */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

                        {/* Avatar */}
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <svg
                                className="h-10 w-10"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>

                        {/* Information */}
                        <div className="flex-1">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Author
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                        {author.name}
                                    </h2>

                                    <p className="mt-1 font-mono text-xs text-slate-400">
                                        Author ID: #{author.id}
                                    </p>
                                </div>

                                <span
                                    className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                        isActive
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            isActive
                                                ? "bg-emerald-500"
                                                : "bg-slate-400"
                                        }`}
                                    />

                                    {author.status}
                                </span>
                            </div>

                            <div className="mt-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Biography
                                </p>

                                <p className="mt-2 text-sm leading-7 text-slate-600">
                                    {author.biography || "No biography provided."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Books */}
                <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">

                    <div className="border-b border-slate-100 p-5">
                        <h2 className="text-base font-bold text-slate-900">
                            Books by this Author
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            {books.length} book{books.length !== 1 ? "s" : ""} associated with this author.
                        </p>
                    </div>

                    {books.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                            </div>

                            <h3 className="mt-3 text-sm font-bold text-slate-900">
                                No books found
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                This author is not currently associated with any books.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="py-3.5 pl-6 pr-3">
                                        ID
                                    </th>

                                    <th className="px-4 py-3.5">
                                        TITLE
                                    </th>

                                    <th className="px-4 py-3.5">
                                        ISBN
                                    </th>

                                    <th className="px-4 py-3.5">
                                        PUBLISHER
                                    </th>

                                    <th className="px-4 py-3.5 text-center">
                                        STATUS
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {books.map((book) => (
                                    <tr
                                        key={book.id}
                                        className="transition hover:bg-slate-50/60"
                                    >
                                        <td className="py-4 pl-6 pr-3 font-mono font-semibold text-slate-400">
                                            #{book.id}
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="font-bold text-slate-900">
                                                {book.title}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 font-mono text-slate-500">
                                            {book.isbn}
                                        </td>

                                        <td className="px-4 py-4 text-slate-500">
                                            {book.publisher?.name || "-"}
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                        book.status === "ACTIVE"
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {book.status}
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}