"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    getBooks,
    getAuthors,
    createBook,
    updateBook,
    activateBook,
    deactivateBook,
    getPublishers,
} from "../lib/api";

export default function BooksPage() {
    const [books, setBooks] = useState<any[]>([]);
    const [authors, setAuthors] = useState<any[]>([]);
    const [publishers, setPublishers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBook, setEditingBook] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "ALL" | "ACTIVE" | "INACTIVE"
    >("ALL");

    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        isbn: "",
        publisher: "",
        publishYear: "",
        price: "",
        totalQuantity: "",
        availableQuantity: "",
        description: "",
        authorIds: [] as number[],
        authorNames: "",
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            await Promise.all([
                loadBooks(),
                loadAuthors(),
                loadPublishers(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadBooks = async () => {
        try {
            const data = await getBooks();
            setBooks(data || []);
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

    const loadPublishers = async () => {
        try {
            const data = await getPublishers();

            setPublishers(
                (data || []).filter(
                    (publisher: any) =>
                        publisher.status === "ACTIVE"
                )
            );
        } catch (error) {
            console.error("Failed to load publishers:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            isbn: "",
            publisher: "",
            publishYear: "",
            price: "",
            totalQuantity: "",
            availableQuantity: "",
            description: "",
            authorIds: [],
            authorNames: "",
        });
    };

    // =========================================================
    // ADD BOOK
    // =========================================================
    const handleAddBook = async () => {
        if (!formData.title.trim()) {
            alert("Please enter a book title!");
            return;
        }

        try {
            const authorNames = formData.authorNames
                .split(",")
                .map((name) => name.trim())
                .filter((name) => name.length > 0);

            const newBook = await createBook({
                title: formData.title.trim(),
                isbn: formData.isbn.trim(),

                publisherId: formData.publisher
                    ? Number(formData.publisher)
                    : undefined,

                publishYear: formData.publishYear
                    ? Number(formData.publishYear)
                    : undefined,

                price: formData.price
                    ? Number(formData.price)
                    : undefined,

                totalQuantity:
                    Number(formData.totalQuantity) || 0,

                description: formData.description.trim(),

                // Existing authors
                authorIds: formData.authorIds,

                // New authors
                authorNames,
            });

            setBooks((prev) => [...prev, newBook]);

            resetForm();
            setShowAddForm(false);

            await Promise.all([
                loadBooks(),
                loadAuthors(),
            ]);
        } catch (error) {
            console.error("Failed to create book:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to create book"
            );
        }
    };

    // =========================================================
    // EDIT BOOK
    // =========================================================
    const handleEditClick = (book: any) => {
        setEditingBook(book);

        const selectedAuthorIds =
            book.authors?.map((author: any) =>
                Number(author.id)
            ) || [];

        setFormData({
            title: book.title || "",

            isbn: book.isbn || "",

            publisher: book.publisher?.id
                ? String(book.publisher.id)
                : "",

            publishYear: book.publishYear
                ? String(book.publishYear)
                : "",

            price:
                book.price !== undefined &&
                book.price !== null
                    ? String(book.price)
                    : "",

            totalQuantity:
                book.totalQuantity !== undefined &&
                book.totalQuantity !== null
                    ? String(book.totalQuantity)
                    : "",

            availableQuantity:
                book.availableQuantity !== undefined &&
                book.availableQuantity !== null
                    ? String(book.availableQuantity)
                    : "",

            description: book.description || "",

            // Existing authors of this book
            authorIds: selectedAuthorIds,

            // New author input starts empty
            authorNames: "",
        });
    };

    const handleUpdateBook = async () => {
        if (!editingBook || !formData.title.trim()) {
            alert("Please enter a book title!");
            return;
        }

        try {
            // Convert typed author names into array
            const authorNames = formData.authorNames
                .split(",")
                .map((name) => name.trim())
                .filter((name) => name.length > 0);

            const updatedBook = await updateBook(
                editingBook.id,
                {
                    title: formData.title.trim(),

                    isbn: formData.isbn.trim(),

                    publisherId: formData.publisher
                        ? Number(formData.publisher)
                        : undefined,

                    publishYear: formData.publishYear
                        ? Number(formData.publishYear)
                        : undefined,

                    price: formData.price
                        ? Number(formData.price)
                        : undefined,

                    totalQuantity:
                        Number(formData.totalQuantity) || 0,

                    availableQuantity:
                        Number(formData.availableQuantity) || 0,

                    description:
                        formData.description.trim(),

                    // Existing authors
                    authorIds: formData.authorIds,

                    // New authors
                    authorNames,
                }
            );

            setBooks((prev) =>
                prev.map((book) =>
                    book.id === editingBook.id
                        ? updatedBook
                        : book
                )
            );

            setEditingBook(null);
            resetForm();

            // Reload books and authors
            // because new authors may have been created
            await Promise.all([
                loadBooks(),
                loadAuthors(),
            ]);
        } catch (error) {
            console.error(
                "Failed to update book:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update book"
            );
        }
    };

    // =========================================================
    // DEACTIVATE BOOK
    // =========================================================
    const handleDeactivate = async (book: any) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${book.title}"?`
        );

        if (!confirmed) return;

        try {
            await deactivateBook(book.id);
            await loadBooks();
        } catch (error) {
            console.error(
                "Failed to deactivate book:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to deactivate book"
            );
        }
    };

    // =========================================================
    // ACTIVATE BOOK
    // =========================================================
    const handleActivate = async (book: any) => {
        try {
            await activateBook(book.id);
            await loadBooks();
        } catch (error) {
            console.error(
                "Failed to activate book:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to activate book"
            );
        }
    };

    // =========================================================
    // FILTER BOOKS
    // =========================================================
    const filteredBooks = useMemo(() => {
        return books.filter((b) => {
            const query = searchTerm.toLowerCase();

            const matchesSearch =
                (b.title || "")
                    .toLowerCase()
                    .includes(query) ||

                (b.isbn || "")
                    .toLowerCase()
                    .includes(query) ||

                (b.publisher?.name || "")
                    .toLowerCase()
                    .includes(query);

            const isActive =
                b.status === "ACTIVE" ||
                b.active === true;

            let matchesStatus = true;

            if (statusFilter === "ACTIVE") {
                matchesStatus = isActive;
            }

            if (statusFilter === "INACTIVE") {
                matchesStatus = !isActive;
            }

            return matchesSearch && matchesStatus;
        });
    }, [books, searchTerm, statusFilter]);

    // =========================================================
    // METRICS
    // =========================================================
    const totalTitles = books.length;

    const activeBooksCount = books.filter(
        (b) =>
            b.status === "ACTIVE" ||
            b.active === true
    ).length;

    const totalAvailable = books
        .filter(
            (b) =>
                b.status === "ACTIVE" ||
                b.active === true
        )
        .reduce(
            (acc, curr) =>
                acc + (curr.availableQuantity || 0),
            0
        );

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] p-6 lg:p-8 font-sans">
            <div className="w-full space-y-6">

                {/* ========================================================= */}
                {/* HEADER                                                     */}
                {/* ========================================================= */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Books
                            </h1>

                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                                Catalog Management
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage titles, physical inventory, publications, authors, and circulation availability.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            resetForm();
                            setEditingBook(null);
                            setShowAddForm(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                                strokeWidth="2.5"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>

                        Add Book
                    </button>
                </div>

                {/* ========================================================= */}
                {/* METRIC CARDS                                               */}
                {/* ========================================================= */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* Total Titles */}
                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                TOTAL TITLES
                            </span>

                            <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                        </div>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {totalTitles}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Unique catalog entries
                        </p>
                    </div>

                    {/* Available Copies */}
                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                                AVAILABLE COPIES
                            </span>

                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        </div>

                        <p className="mt-2 text-3xl font-bold text-emerald-600">
                            {totalAvailable}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Ready on shelves (Active titles)
                        </p>
                    </div>

                    {/* Active Titles */}
                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                                ACTIVE TITLES
                            </span>

                            <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                        </div>

                        <p className="mt-2 text-3xl font-bold text-sky-600">
                            {activeBooksCount}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            In circulation status
                        </p>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* BOOK TABLE                                                 */}
                {/* ========================================================= */}
                <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">

                    {/* Search / Filter */}
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Books Catalog
                            </h2>

                            <p className="text-xs text-slate-400">
                                Showing {filteredBooks.length} of{" "}
                                {totalTitles} titles
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">

                            {/* Search */}
                            <div className="relative min-w-[260px]">
                                <svg
                                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>

                                <input
                                    type="text"
                                    placeholder="Search by title, ISBN, publisher..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value as
                                            | "ALL"
                                            | "ACTIVE"
                                            | "INACTIVE"
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            >
                                <option value="ALL">
                                    All Status
                                </option>

                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>

                            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Loading catalog...
                            </p>
                        </div>
                    ) : filteredBooks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
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
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                            </div>

                            <h3 className="mt-3 text-sm font-bold text-slate-900">
                                No books found
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                {searchTerm ||
                                statusFilter !== "ALL"
                                    ? "Try adjusting your search criteria or status filter."
                                    : "Get started by adding a new book title to the catalog."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th
                                        scope="col"
                                        className="py-3.5 pl-6 pr-3"
                                    >
                                        ID
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3.5"
                                    >
                                        TITLE & SUMMARY
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3.5"
                                    >
                                        ISBN
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3.5"
                                    >
                                        PUBLISHER
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3.5"
                                    >
                                        YEAR
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3.5 text-center"
                                    >
                                        TOTAL
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3.5 text-center"
                                    >
                                        AVAILABLE
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3.5 text-center"
                                    >
                                        STATUS
                                    </th>

                                    <th
                                        scope="col"
                                        className="py-3.5 pl-4 pr-6 text-right"
                                    >
                                        ACTIONS
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {filteredBooks.map((book) => {
                                    const isActive =
                                        book.status ===
                                        "ACTIVE" ||
                                        book.active === true;

                                    const hasStock =
                                        (book.availableQuantity ||
                                            0) > 0;

                                    return (
                                        <tr
                                            key={book.id}
                                            className="transition hover:bg-slate-50/60"
                                        >
                                            <td className="py-4 pl-6 pr-3 font-mono text-xs font-semibold text-slate-400">
                                                #{book.id}
                                            </td>

                                            <td className="max-w-xs px-4 py-4 md:max-w-sm">
                                                <div
                                                    onClick={() =>
                                                        router.push(
                                                            `/books/${book.id}`
                                                        )
                                                    }
                                                    className="group flex cursor-pointer items-start gap-3"
                                                >
                                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                            />
                                                        </svg>
                                                    </div>

                                                    <div>
                                                        <div className="font-bold text-sm text-slate-900 transition group-hover:text-indigo-600">
                                                            {book.title}
                                                        </div>

                                                        {book.description ? (
                                                            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                                                                {
                                                                    book.description
                                                                }
                                                            </p>
                                                        ) : (
                                                            <span className="text-[11px] text-slate-400">
                                                                Click to view details
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 font-mono text-xs text-slate-600">
                                                <span className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px]">
                                                    {book.isbn ||
                                                        "—"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-xs text-slate-600">
                                                {book.publisher?.name || (
                                                    <span className="italic text-slate-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-xs font-medium text-slate-600">
                                                {book.publishYear ||
                                                    "—"}
                                            </td>

                                            <td className="px-4 py-4 text-center font-bold text-slate-800">
                                                {book.totalQuantity ||
                                                    0}
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                <span
                                                    className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-bold ${
                                                        !isActive
                                                            ? "bg-slate-100 text-slate-400"
                                                            : hasStock
                                                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                : "border border-rose-200 bg-rose-50 text-rose-600"
                                                    }`}
                                                >
                                                    {isActive
                                                        ? book.availableQuantity ??
                                                        0
                                                        : 0}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
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

                                                    {isActive
                                                        ? "AVAILABLE"
                                                        : "INACTIVE"}
                                                </span>
                                            </td>

                                            <td className="py-4 pl-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/books/${book.id}`
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600"
                                                    >
                                                        Detail
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleEditClick(
                                                                book
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            isActive
                                                                ? handleDeactivate(
                                                                    book
                                                                )
                                                                : handleActivate(
                                                                    book
                                                                )
                                                        }
                                                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                                                            isActive
                                                                ? "border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-50"
                                                                : "border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50"
                                                        }`}
                                                    >
                                                        {isActive
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================= */}
            {/* ADD BOOK MODAL                                            */}
            {/* ========================================================= */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 transition-all">

                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Add New Book
                                </h3>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    Fill in metadata to register a new book title in catalog
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetForm();
                                }}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                            {/* Title */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Book Title{" "}
                                    <span className="text-rose-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. Clean Code: A Handbook of Agile Software Craftsmanship"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* ISBN */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    ISBN Code{" "}
                                    <span className="text-rose-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. 978-0132350884"
                                    value={formData.isbn}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            isbn: e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Publisher */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Publisher
                                </label>

                                <select
                                    value={formData.publisher}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            publisher:
                                            e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                >
                                    <option value="">
                                        Select Publisher
                                    </option>

                                    {publishers.map((pub) => (
                                        <option
                                            key={pub.id}
                                            value={pub.id}
                                        >
                                            {pub.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Existing Authors */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Existing Authors
                                </label>

                                <select
                                    multiple
                                    value={formData.authorIds.map(
                                        String
                                    )}
                                    onChange={(e) => {
                                        const selectedIds =
                                            Array.from(
                                                e.target
                                                    .selectedOptions
                                            ).map((opt) =>
                                                Number(
                                                    opt.value
                                                )
                                            );

                                        setFormData({
                                            ...formData,
                                            authorIds:
                                            selectedIds,
                                        });
                                    }}
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                    size={Math.min(
                                        Math.max(
                                            authors.filter(
                                                (author) =>
                                                    author.status ===
                                                    "ACTIVE"
                                            ).length,
                                            3
                                        ),
                                        5
                                    )}
                                >
                                    {authors
                                        .filter(
                                            (author) =>
                                                author.status ===
                                                "ACTIVE"
                                        )
                                        .map((author) => (
                                            <option
                                                key={author.id}
                                                value={author.id}
                                            >
                                                {author.name}
                                            </option>
                                        ))}
                                </select>

                                <p className="mt-1 text-[11px] text-slate-400">
                                    Hold Ctrl to select multiple existing authors.
                                </p>
                            </div>

                            {/* New Authors */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700">
                                    New Author Names
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. Robert C. Martin, Martin Fowler"
                                    value={formData.authorNames}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            authorNames:
                                            e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />

                                <p className="mt-1 text-[11px] text-slate-400">
                                    Enter multiple author names separated by commas. Existing names will be reused automatically; new names will be added to Author Management.
                                </p>
                            </div>

                            {/* Publish Year */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Publish Year
                                </label>

                                <input
                                    type="number"
                                    placeholder="e.g. 2024"
                                    value={formData.publishYear}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            publishYear:
                                            e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Price ($/VND)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="e.g. 150000"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            price: e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Total Quantity */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Total Quantity{" "}
                                    <span className="text-rose-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 10"
                                    value={
                                        formData.totalQuantity
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            totalQuantity:
                                            e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Description / Synopsis
                                </label>

                                <textarea
                                    rows={3}
                                    placeholder="Brief book overview, synopsis, or table of contents..."
                                    value={
                                        formData.description
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description:
                                            e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetForm();
                                }}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleAddBook}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-indigo-700"
                            >
                                Create Book
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* EDIT BOOK MODAL                                           */}
            {/* ========================================================= */}
            {editingBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 transition-all">

                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Edit Book Information
                                </h3>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    Modifying catalog entry #
                                    {editingBook.id}:{" "}
                                    {editingBook.title}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setEditingBook(null);
                                    resetForm();
                                }}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                            {/* Title */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Book Title{" "}
                                    <span className="text-rose-500">
                                        *
                                    </span>
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
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* ISBN */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    ISBN Code
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
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Publisher */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Publisher
                                </label>

                                <select
                                    value={formData.publisher}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            publisher:
                                            e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                >
                                    <option value="">
                                        Select Publisher
                                    </option>

                                    {publishers.map((pub) => (
                                        <option
                                            key={pub.id}
                                            value={pub.id}
                                        >
                                            {pub.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Publish Year */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Publish Year
                                </label>

                                <input
                                    type="number"
                                    value={formData.publishYear}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            publishYear:
                                            e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Price
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            price: e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Total Quantity */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Total Quantity
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        formData.totalQuantity
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            totalQuantity:
                                            e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Available Quantity */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Available Quantity
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        formData.availableQuantity
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            availableQuantity:
                                            e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* ================================================= */}
                            {/* EXISTING AUTHORS                                  */}
                            {/* ================================================= */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Existing Authors
                                </label>

                                <select
                                    multiple
                                    value={formData.authorIds.map(
                                        String
                                    )}
                                    onChange={(e) => {
                                        const selectedIds =
                                            Array.from(
                                                e.target
                                                    .selectedOptions
                                            ).map((opt) =>
                                                Number(
                                                    opt.value
                                                )
                                            );

                                        setFormData({
                                            ...formData,
                                            authorIds:
                                            selectedIds,
                                        });
                                    }}
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                    size={Math.min(
                                        Math.max(
                                            authors.length,
                                            3
                                        ),
                                        5
                                    )}
                                >
                                    {authors.map((author) => (
                                        <option
                                            key={author.id}
                                            value={author.id}
                                        >
                                            {author.name}
                                            {author.status ===
                                            "INACTIVE"
                                                ? " (Inactive)"
                                                : ""}
                                        </option>
                                    ))}
                                </select>

                                <p className="mt-1 text-[11px] text-slate-400">
                                    Hold Ctrl to select multiple existing authors.
                                </p>
                            </div>

                            {/* ================================================= */}
                            {/* NEW AUTHORS                                       */}
                            {/* ================================================= */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700">
                                    New Author Names
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. Robert C. Martin, Martin Fowler"
                                    value={formData.authorNames}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            authorNames:
                                            e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />

                                <p className="mt-1 text-[11px] text-slate-400">
                                    Enter multiple author names separated by commas. Existing names will be reused automatically; new names will be added to Author Management.
                                </p>
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    rows={3}
                                    value={
                                        formData.description
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description:
                                            e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingBook(null);
                                    resetForm();
                                }}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleUpdateBook}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-indigo-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}