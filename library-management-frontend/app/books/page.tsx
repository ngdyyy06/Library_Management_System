"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getBooks,
    getAuthors,
    createBook,
    updateBook,
    activateBook,
    deactivateBook,
} from "../lib/api";

export default function BooksPage() {
    const [books, setBooks] = useState<any[]>([]);
    const [authors, setAuthors] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBook, setEditingBook] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        isbn: "",
        publisher: "",
        publishYear: "",
        totalQuantity: "",
        description: "",
        availableQuantity: "",
        authorIds: [] as number[],
    });

    useEffect(() => {
        loadBooks();
        loadAuthors();
    }, []);

    const loadBooks = async () => {
        try {
            const data = await getBooks();
            setBooks(data);
        } catch (error) {
            console.error("Failed to load books:", error);
        }
    };

    const loadAuthors = async () => {
        try {
            const data = await getAuthors();
            setAuthors(data || []);
        } catch (error) {
            console.error("Failed to load authors:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            isbn: "",
            publisher: "",
            publishYear: "",
            totalQuantity: "",
            description: "",
            availableQuantity: "",
            authorIds: [],
        });
    };

    const handleAddBook = async () => {
        try {
            const newBook = await createBook({
                title: formData.title,
                isbn: formData.isbn,
                publisher: formData.publisher,
                publishYear: formData.publishYear
                    ? Number(formData.publishYear)
                    : undefined,
                totalQuantity: Number(formData.totalQuantity),
                description: formData.description,
            });

            setBooks((prev) => [...prev, newBook]);

            resetForm();
            setShowAddForm(false);
        } catch (error) {
            console.error("Failed to create book:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to create book"
            );
        }
    };

    const handleEditClick = (book: any) => {
        setEditingBook(book);

        const selectedAuthorIds =
            book.authors?.map((author: any) => Number(author.id)) || [];

        setFormData({
            title: book.title || "",
            isbn: book.isbn || "",
            publisher: book.publisher || "",
            publishYear: book.publishYear
                ? String(book.publishYear)
                : "",
            totalQuantity: book.totalQuantity
                ? String(book.totalQuantity)
                : "",
            availableQuantity:
                book.availableQuantity !== undefined &&
                book.availableQuantity !== null
                    ? String(book.availableQuantity)
                    : "",
            description: book.description || "",
            authorIds: selectedAuthorIds,
        });
    };

    const handleUpdateBook = async () => {
        if (!editingBook) {
            return;
        }

        try {
            const updatedBook = await updateBook(editingBook.id, {
                title: formData.title,
                isbn: formData.isbn,
                publisher: formData.publisher,
                publishYear: formData.publishYear
                    ? Number(formData.publishYear)
                    : undefined,
                totalQuantity: Number(formData.totalQuantity),
                availableQuantity: Number(formData.availableQuantity),
                description: formData.description,
                authorIds: formData.authorIds,
            });

            setBooks((prev) =>
                prev.map((book) =>
                    book.id === editingBook.id
                        ? updatedBook
                        : book
                )
            );

            setEditingBook(null);
            resetForm();
        } catch (error) {
            console.error("Failed to update book:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update book"
            );
        }
    };

    const handleDeactivate = async (book: any) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${book.title}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await deactivateBook(book.id);
            await loadBooks();
        } catch (error) {
            console.error("Failed to deactivate book:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to deactivate book"
            );
        }
    };

    const handleActivate = async (book: any) => {
        try {
            await activateBook(book.id);
            await loadBooks();
        } catch (error) {
            console.error("Failed to activate book:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to activate book"
            );
        }
    };

    // Client-side search filter
    const filteredBooks = books.filter((b) => {
        const query = searchTerm.toLowerCase();

        return (
            (b.title || "").toLowerCase().includes(query) ||
            (b.isbn || "").toLowerCase().includes(query) ||
            (b.publisher || "").toLowerCase().includes(query)
        );
    });

    // Chỉ tính sách ACTIVE vào số lượng sẵn sàng cho mượn
    const totalAvailable = books
        .filter((b) => b.status === "ACTIVE")
        .reduce(
            (acc, curr) => acc + (curr.availableQuantity || 0),
            0
        );

    const activeBooksCount = books.filter(
        (b) => b.status === "ACTIVE"
    ).length;

    return (
        <div className="min-h-screen bg-slate-50 p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                                Books Management
                            </h1>

                            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                                Catalog
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage titles, physical inventory, publications, and availability.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setShowAddForm(true);
                            setEditingBook(null);
                        }}
                        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300/60 active:translate-y-0"
                    >
                        <svg
                            className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>

                        <span>Add Book</span>
                    </button>
                </div>

                {/* ── Quick Stats Strip ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Total Titles
                            </p>

                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                        </div>

                        <p className="mt-2 text-2xl font-extrabold text-slate-900">
                            {books.length}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Unique book entries
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                Available Copies
                            </p>

                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        </div>

                        <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                            {totalAvailable}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Ready for borrowing (Active)
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Active Titles
                            </p>

                            <span className="h-2 w-2 rounded-full bg-sky-500" />
                        </div>

                        <p className="mt-2 text-2xl font-extrabold text-slate-900">
                            {activeBooksCount}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                            In circulation status
                        </p>
                    </div>
                </div>

                {/* ── Add Book Form Card ── */}
                {showAddForm && (
                    <div className="animate-in overflow-hidden rounded-2xl border border-indigo-200/80 bg-white p-6 shadow-lg shadow-indigo-100/50 duration-200 fade-in zoom-in-95 sm:p-7">

                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Add New Book
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    Fill in the metadata to register a new book title
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetForm();
                                }}
                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* Title */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Title <span className="text-rose-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Clean Code"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* ISBN */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    ISBN <span className="text-rose-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={formData.isbn}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            isbn: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. 978-0132350884"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Publisher */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Publisher
                                </label>

                                <input
                                    type="text"
                                    value={formData.publisher}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            publisher: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Prentice Hall"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Publish Year */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Publish Year
                                </label>

                                <input
                                    type="number"
                                    value={formData.publishYear}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            publishYear: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. 2026"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Enter brief summary or book synopsis..."
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetForm();
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 sm:text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleAddBook}
                                className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-200/60 transition-all hover:shadow-lg active:scale-95 sm:text-sm"
                            >
                                Save Book
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Edit Book Form Card ── */}
                {editingBook && (
                    <div className="animate-in overflow-hidden rounded-2xl border border-sky-200/80 bg-white p-6 shadow-lg shadow-sky-100/50 duration-200 fade-in zoom-in-95 sm:p-7">

                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Edit Book Information
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    Editing: {editingBook.title}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setEditingBook(null);
                                    resetForm();
                                }}
                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* Title */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Title
                                </label>

                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* ISBN */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    ISBN
                                </label>

                                <input
                                    type="text"
                                    value={formData.isbn}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            isbn: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Publisher */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Publisher
                                </label>

                                <input
                                    type="text"
                                    value={formData.publisher}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            publisher: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Publish Year */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Publish Year
                                </label>

                                <input
                                    type="number"
                                    value={formData.publishYear}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            publishYear: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Total Quantity */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Total Quantity
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={formData.totalQuantity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            totalQuantity: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Available Quantity */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Available Quantity
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={formData.availableQuantity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            availableQuantity: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Authors */}
                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Authors
                                </label>

                                <select
                                    multiple
                                    value={formData.authorIds.map(String)}
                                    onChange={(e) => {
                                        const selectedIds = Array.from(
                                            e.target.selectedOptions
                                        ).map((option) =>
                                            Number(option.value)
                                        );

                                        setFormData({
                                            ...formData,
                                            authorIds: selectedIds,
                                        });
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                    size={Math.min(
                                        Math.max(authors.length, 3),
                                        6
                                    )}
                                >
                                    {authors.length === 0 ? (
                                        <option disabled>
                                            No authors available
                                        </option>
                                    ) : (
                                        authors.map((author) => (
                                            <option
                                                key={author.id}
                                                value={author.id}
                                            >
                                                {author.name}
                                                {author.status === "INACTIVE"
                                                    ? " (Inactive)"
                                                    : ""}
                                            </option>
                                        ))
                                    )}
                                </select>

                                <p className="mt-1.5 text-[11px] text-slate-400">
                                    Hold Ctrl and click to select multiple authors.
                                </p>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingBook(null);
                                    resetForm();
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 sm:text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleUpdateBook}
                                className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-2 text-xs font-semibold text-white shadow-md shadow-sky-200/60 transition-all hover:shadow-lg active:scale-95 sm:text-sm"
                            >
                                Update Book
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Books Table Card ── */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

                    <div className="flex flex-col gap-3.5 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Catalog Books Directory
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                                Showing {filteredBooks.length} of {books.length} titles
                            </p>
                        </div>

                        {/* Search box */}
                        <div className="relative sm:w-72">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.15 6.15a7.5 7.5 0 0 0 10.5 10.5z"
                                    />
                                </svg>
                            </div>

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                                placeholder="Search by title, ISBN, publisher..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1150px] text-left text-sm">

                            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-6 py-3.5">ID</th>
                                <th className="px-6 py-3.5">Title & Summary</th>
                                <th className="px-6 py-3.5">ISBN</th>
                                <th className="px-6 py-3.5">Publisher</th>
                                <th className="px-6 py-3.5">Year</th>
                                <th className="px-6 py-3.5 text-center">Total</th>
                                <th className="px-6 py-3.5 text-center">Available</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                            {filteredBooks.map((book) => {
                                const isActive = book.status === "ACTIVE";
                                const hasStock =
                                    (book.availableQuantity || 0) > 0;

                                return (
                                    <tr
                                        key={book.id}
                                        className="transition-colors duration-150 hover:bg-slate-50/70"
                                    >
                                        <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-400">
                                            #{book.id}
                                        </td>

                                        <td className="max-w-sm px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                        />
                                                    </svg>
                                                </div>

                                                <div>
                                                    <p className="leading-tight font-bold text-slate-900">
                                                        {book.title}
                                                    </p>

                                                    {book.description && (
                                                        <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                                                            {book.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                                <span className="rounded border border-slate-200/80 bg-slate-100 px-2 py-0.5">
                                                    {book.isbn}
                                                </span>
                                        </td>

                                        <td className="px-6 py-4 text-xs text-slate-600">
                                            {book.publisher || "—"}
                                        </td>

                                        <td className="px-6 py-4 text-xs font-medium text-slate-600">
                                            {book.publishYear || "—"}
                                        </td>

                                        <td className="px-6 py-4 text-center font-semibold text-slate-800">
                                            {book.totalQuantity}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${
                                                        !isActive
                                                            ? "border border-slate-200 bg-slate-100 text-slate-400"
                                                            : hasStock
                                                                ? "border border-emerald-200/60 bg-emerald-50 text-emerald-700"
                                                                : "border border-rose-200/60 bg-rose-50 text-rose-600"
                                                    }`}
                                                >
                                                    {isActive
                                                        ? book.availableQuantity
                                                        : 0}
                                                </span>
                                        </td>

                                        <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
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
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">

                                                {/* Detail */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(
                                                            `/books/${book.id}`
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-lg border border-sky-200/90 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 hover:text-sky-800"
                                                >
                                                    <span>Detail</span>

                                                    <svg
                                                        className="h-3 w-3"
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
                                                </button>

                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditClick(book)
                                                    }
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                                >
                                                    Edit
                                                </button>

                                                {/* Deactivate / Activate */}
                                                {isActive ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeactivate(
                                                                book
                                                            )
                                                        }
                                                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                                                    >
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleActivate(
                                                                book
                                                            )
                                                        }
                                                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredBooks.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                            <svg
                                                className="h-6 w-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                />
                                            </svg>
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-slate-700">
                                            No books found
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Try adjusting your search query or add a new title.
                                        </p>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}