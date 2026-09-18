"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import {
    getBookById,
    createBorrowRequest,
} from "@/app/lib/api";

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

export default function ReaderBookDetailPage() {
    const params = useParams();

    const id = Number(params.id);

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Borrow Request form
    const [showBorrowForm, setShowBorrowForm] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const loadBook = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getBookById(id);

            setBook(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load book details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadBook();
        }
    }, [id]);

    // Open Borrow Request form
    const handleBorrow = () => {
        if (!book) {
            return;
        }

        if (
            book.availableQuantity <= 0 ||
            book.status !== "ACTIVE"
        ) {
            return;
        }

        setQuantity(1);
        setSubmitError("");
        setSubmitSuccess(false);
        setShowBorrowForm(true);
    };

    // Close Borrow Request form
    const handleCancelBorrow = () => {
        if (submitting) {
            return;
        }

        setShowBorrowForm(false);
        setSubmitError("");
        setSubmitSuccess(false);
    };

    // Quantity -
    const decreaseQuantity = () => {
        setQuantity((current) => Math.max(1, current - 1));
    };

    // Quantity +
    const increaseQuantity = () => {
        if (!book) {
            return;
        }

        setQuantity((current) =>
            Math.min(book.availableQuantity, current + 1)
        );
    };

    // Quantity input
    const handleQuantityChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!book) {
            return;
        }

        const value = Number(event.target.value);

        if (Number.isNaN(value)) {
            setQuantity(1);
            return;
        }

        if (value < 1) {
            setQuantity(1);
            return;
        }

        if (value > book.availableQuantity) {
            setQuantity(book.availableQuantity);
            return;
        }

        setQuantity(value);
    };

    // Submit Borrow Request
    const handleSubmitRequest = async () => {
        if (!book) {
            return;
        }

        if (quantity < 1) {
            setSubmitError(
                "Quantity must be greater than or equal to 1."
            );
            return;
        }

        if (quantity > book.availableQuantity) {
            setSubmitError(
                "Requested quantity exceeds available quantity."
            );
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError("");
            setSubmitSuccess(false);

            await createBorrowRequest(
                book.id,
                quantity
            );

            setSubmitSuccess(true);
        } catch (err) {
            console.error(err);

            if (err instanceof Error) {
                setSubmitError(err.message);
            } else {
                setSubmitError(
                    "Failed to submit borrowing request."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <RoleGuard allowedRoles={["READER"]}>
            <div className="min-h-screen bg-[#f7f8fa] p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* Header */}
                    <div>
                        <Link
                            href="/reader/books"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
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
                                    d="m15 18-6-6 6-6"
                                />
                            </svg>

                            Back to Books
                        </Link>

                        <div className="mt-4">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Book Detail
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                View detailed information about this book.
                            </p>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                <svg
                                    className="h-5 w-5 animate-pulse"
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

                            <p className="mt-3 text-sm text-slate-500">
                                Loading book details...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
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
                                            d="M12 9v4m0 4h.01M10.29 3.86l-7.1 12.28A2 2 0 004.92 19h14.16a2 2 0 001.73-2.86l-7.1-12.28a2 2 0 00-3.46 0z"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        Unable to load book
                                    </p>

                                    <p className="mt-1 text-sm text-rose-600">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Book Detail */}
                    {!loading && !error && book && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            {/* Book Header */}
                            <div className="border-b border-slate-200 p-6 sm:p-8">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                                    <div className="min-w-0">
                                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
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

                                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                            {book.title}
                                        </h2>

                                        <p className="mt-2 text-sm text-slate-500">
                                            ISBN: {book.isbn}
                                        </p>
                                    </div>

                                    <span
                                        className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                            book.status === "ACTIVE"
                                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                                                : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-500/10"
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
                                </div>
                            </div>

                            <div className="p-6 sm:p-8">

                                {/* Basic Information */}
                                <section className="border-b border-slate-200 pb-8">
                                    <div className="mb-5">
                                        <h3 className="text-base font-bold text-slate-900">
                                            Basic Information
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-400">
                                            General information about this book.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                ISBN
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                                {book.isbn}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Publisher
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                                {book.publisher?.name || "N/A"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Publish Year
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                                {book.publishYear || "N/A"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Price
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                                {book.price?.toLocaleString(
                                                    "vi-VN"
                                                )}{" "}
                                                ₫
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Authors */}
                                <section className="border-b border-slate-200 py-8">
                                    <div className="mb-5">
                                        <h3 className="text-base font-bold text-slate-900">
                                            Authors
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Authors associated with this book.
                                        </p>
                                    </div>

                                    {book.authors?.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {book.authors.map((author) => (
                                                <span
                                                    key={author.id}
                                                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                                                >
                                                    {author.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            No authors available.
                                        </p>
                                    )}
                                </section>

                                {/* Categories */}
                                <section className="border-b border-slate-200 py-8">
                                    <div className="mb-5">
                                        <h3 className="text-base font-bold text-slate-900">
                                            Categories
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Categories assigned to this book.
                                        </p>
                                    </div>

                                    {book.categories?.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {book.categories.map((category) => (
                                                <span
                                                    key={category.id}
                                                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                                                >
                                                    {category.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            No categories available.
                                        </p>
                                    )}
                                </section>

                                {/* Description */}
                                <section className="border-b border-slate-200 py-8">
                                    <div className="mb-5">
                                        <h3 className="text-base font-bold text-slate-900">
                                            Description
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Book description and summary.
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                                        <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                                            {book.description ||
                                                "No description available."}
                                        </p>
                                    </div>
                                </section>

                                {/* Availability */}
                                <section className="pt-8">
                                    <div className="mb-5">
                                        <h3 className="text-base font-bold text-slate-900">
                                            Availability
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Current physical copy availability.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                        {/* Total Quantity */}
                                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Total Quantity
                                            </p>

                                            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                                {book.totalQuantity}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Total copies
                                            </p>
                                        </div>

                                        {/* Available Quantity */}
                                        <div
                                            className={`rounded-xl border p-5 ${
                                                book.availableQuantity > 0
                                                    ? "border-emerald-200 bg-emerald-50/50"
                                                    : "border-rose-200 bg-rose-50/50"
                                            }`}
                                        >
                                            <p
                                                className={`text-xs font-semibold uppercase tracking-wider ${
                                                    book.availableQuantity > 0
                                                        ? "text-emerald-700"
                                                        : "text-rose-700"
                                                }`}
                                            >
                                                Available Quantity
                                            </p>

                                            <p
                                                className={`mt-2 text-2xl font-bold tracking-tight ${
                                                    book.availableQuantity > 0
                                                        ? "text-emerald-900"
                                                        : "text-rose-900"
                                                }`}
                                            >
                                                {book.availableQuantity}
                                            </p>

                                            <p
                                                className={`mt-1 text-xs ${
                                                    book.availableQuantity > 0
                                                        ? "text-emerald-600/80"
                                                        : "text-rose-600/80"
                                                }`}
                                            >
                                                Currently available
                                            </p>
                                        </div>
                                    </div>

                                    {/* Borrow Action */}
                                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            {book.availableQuantity > 0 &&
                                            book.status === "ACTIVE" ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                                                    <p className="text-sm font-medium text-slate-700">
                                                        This book is available for borrowing.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-rose-500" />

                                                    <p className="text-sm font-medium text-rose-600">
                                                        This book is currently unavailable.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleBorrow}
                                            disabled={
                                                book.availableQuantity <= 0 ||
                                                book.status !== "ACTIVE"
                                            }
                                            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold shadow-sm transition ${
                                                book.availableQuantity > 0 &&
                                                book.status === "ACTIVE"
                                                    ? "bg-black text-white hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[0.98]"
                                                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                                            }`}
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
                                                    d="M5 5.5A2.5 2.5 0 017.5 3H12v17H7.5A2.5 2.5 0 015 17.5v-12zM12 3h4.5A2.5 2.5 0 0119 5.5v12a2.5 2.5 0 01-2.5 2.5H12"
                                                />
                                            </svg>

                                            {book.availableQuantity > 0 &&
                                            book.status === "ACTIVE"
                                                ? "Borrow"
                                                : "Not Available"}
                                        </button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Borrow Request Modal */}
            {showBorrowForm && book && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
                    <div
                        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="borrow-request-title"
                    >

                        {/* Modal Header */}
                        <div className="border-b border-slate-200 px-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
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

                                    <h2
                                        id="borrow-request-title"
                                        className="text-lg font-bold tracking-tight text-slate-900"
                                    >
                                        Borrow Request
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Submit a borrowing request for this book.
                                    </p>
                                </div>

                                {!submitting && (
                                    <button
                                        type="button"
                                        onClick={handleCancelBorrow}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                        aria-label="Close"
                                    >
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
                                                d="M6 6l12 12M18 6L6 18"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-6">

                            {/* Book Summary */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Book
                                        </p>

                                        <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                                            {book.title}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            ISBN: {book.isbn}
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Available
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-emerald-700">
                                            {book.availableQuantity}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Success */}
                            {submitSuccess ? (
                                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
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
                                                    d="m5 12 4 4L19 6"
                                                />
                                            </svg>
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-emerald-800">
                                                Request submitted successfully
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-emerald-700">
                                                Your borrowing request has been sent to the librarian for approval.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Quantity */}
                                    <div className="mt-5">
                                        <label
                                            htmlFor="borrow-quantity"
                                            className="block text-sm font-semibold text-slate-900"
                                        >
                                            Quantity
                                        </label>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Maximum {book.availableQuantity}{" "}
                                            {book.availableQuantity === 1
                                                ? "copy"
                                                : "copies"}.
                                        </p>

                                        <div className="mt-3 flex w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white">

                                            {/* Minus */}
                                            <button
                                                type="button"
                                                onClick={decreaseQuantity}
                                                disabled={
                                                    quantity <= 1 ||
                                                    submitting
                                                }
                                                className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
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
                                                        d="M5 12h14"
                                                    />
                                                </svg>
                                            </button>

                                            {/* Input */}
                                            <input
                                                id="borrow-quantity"
                                                type="number"
                                                min={1}
                                                max={book.availableQuantity}
                                                value={quantity}
                                                onChange={
                                                    handleQuantityChange
                                                }
                                                disabled={submitting}
                                                className="h-12 min-w-0 flex-1 border-0 bg-white text-center text-sm font-semibold text-slate-900 outline-none focus:ring-0"
                                            />

                                            {/* Plus */}
                                            <button
                                                type="button"
                                                onClick={increaseQuantity}
                                                disabled={
                                                    quantity >=
                                                    book.availableQuantity ||
                                                    submitting
                                                }
                                                className="flex h-12 w-12 shrink-0 items-center justify-center border-l border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
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
                                                        d="M12 5v14M5 12h14"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Notice */}
                                    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
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
                                                        d="M12 8v4m0 4h.01M10.29 3.86l-7.1 12.28A2 2 0 004.92 19h14.16a2 2 0 001.73-2.86l-7.1-12.28a2 2 0 00-3.46 0z"
                                                    />
                                                </svg>
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    Approval required
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                    Your request will be sent to the librarian for approval. The book will only be borrowed after the request is approved.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error */}
                                    {submitError && (
                                        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <svg
                                                    className="mt-0.5 h-5 w-5 shrink-0 text-rose-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.7}
                                                        d="M12 9v4m0 4h.01M10.29 3.86l-7.1 12.28A2 2 0 004.92 19h14.16a2 2 0 001.73-2.86l-7.1-12.28a2 2 0 00-3.46 0z"
                                                    />
                                                </svg>

                                                <p className="text-sm text-rose-600">
                                                    {submitError}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end">

                            {/* Cancel / Close */}
                            <button
                                type="button"
                                onClick={handleCancelBorrow}
                                disabled={submitting}
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitSuccess ? "Close" : "Cancel"}
                            </button>

                            {/* View Requests */}
                            {submitSuccess && (
                                <Link
                                    href="/reader/borrowings/request"
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
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
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.7}
                                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                                        />
                                    </svg>

                                    View Requests
                                </Link>
                            )}

                            {/* Submit */}
                            {!submitSuccess && (
                                <button
                                    type="button"
                                    onClick={handleSubmitRequest}
                                    disabled={submitting}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20 disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    {submitting ? (
                                        <>
                                            <svg
                                                className="h-4 w-4 animate-spin"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />

                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                />
                                            </svg>

                                            Submitting...
                                        </>
                                    ) : (
                                        <>
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
                                                    d="M5 12h14M13 6l6 6-6 6"
                                                />
                                            </svg>

                                            Submit Request
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </RoleGuard>
    );
}