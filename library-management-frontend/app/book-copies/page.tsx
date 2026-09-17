"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    getBookCopies,
    getBooks,
    createBookCopy,
    restoreBookCopy,
    updateBookCopy,
} from "../lib/api";

export default function BookCopiesPage() {
    const router = useRouter();

    const [bookCopies, setBookCopies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    const [books, setBooks] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedBookFilter, setSelectedBookFilter] = useState("ALL");

    const [selectedBookCopy, setSelectedBookCopy] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        barcode: "",
        bookId: "",
    });

    // =========================================================
    // LOAD DATA
    // =========================================================

    const loadBooks = async () => {
        try {
            const data = await getBooks();
            setBooks(data || []);
        } catch (error) {
            console.error("Failed to load books:", error);
        }
    };

    const loadBookCopies = async () => {
        try {
            const data = await getBookCopies();
            setBookCopies(data || []);
        } catch (error) {
            console.error("Failed to load book copies:", error);
        }
    };

    const loadInitialData = async () => {
        try {
            setLoading(true);
            await Promise.all([loadBookCopies(), loadBooks()]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    // =========================================================
    // EFFECTIVE STATUS
    // =========================================================

    const getEffectiveStatus = (copy: any) => {
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

    // =========================================================
    // ACTIVE BOOKS
    // =========================================================

    const activeBooks = useMemo(
        () =>
            books.filter(
                (book) => book.status === "ACTIVE" || book.active === true
            ),
        [books]
    );

    // =========================================================
    // INPUT HANDLER
    // =========================================================

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================================================
    // CREATE BOOK COPY
    // =========================================================

    const handleCreateBookCopy = async () => {
        if (!formData.bookId) {
            alert("Please select a book title!");
            return;
        }

        if (!formData.barcode.trim()) {
            alert("Please enter a physical barcode!");
            return;
        }

        try {
            await createBookCopy({
                barcode: formData.barcode.trim(),
                bookId: Number(formData.bookId),
            });

            setFormData({
                barcode: "",
                bookId: "",
            });

            setShowAddForm(false);
            await loadBookCopies();

            alert("Book copy created successfully");
        } catch (error) {
            console.error("Failed to create book copy:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to create book copy"
            );
        }
    };

    // =========================================================
    // OPEN / CLOSE EDIT
    // =========================================================

    const handleEditBookCopy = (bookCopy: any) => {
        setSelectedBookCopy(bookCopy);

        setFormData({
            barcode: bookCopy.barcode || "",
            bookId: bookCopy.book?.id ? String(bookCopy.book.id) : "",
        });

        setShowEditForm(true);
    };

    const handleCloseEdit = () => {
        setShowEditForm(false);
        setSelectedBookCopy(null);

        setFormData({
            barcode: "",
            bookId: "",
        });
    };

    // =========================================================
    // SAVE EDIT
    // =========================================================

    const handleUpdateBookCopy = async () => {
        if (!selectedBookCopy) return;

        if (!formData.bookId) {
            alert("Please select a book title!");
            return;
        }

        if (!formData.barcode.trim()) {
            alert("Please enter a physical barcode!");
            return;
        }

        try {
            await updateBookCopy(selectedBookCopy.id, {
                barcode: formData.barcode.trim(),
                bookId: Number(formData.bookId),
            });

            await loadBookCopies();
            handleCloseEdit();

            alert("Book copy updated successfully");
        } catch (error) {
            console.error("Failed to update book copy:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update book copy"
            );
        }
    };

    // =========================================================
    // RESTORE BOOK COPY
    // =========================================================

    const handleRestoreBookCopy = async (id: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to restore this book copy to circulation?"
        );

        if (!confirmed) return;

        try {
            await restoreBookCopy(id);
            await loadBookCopies();

            alert("Book copy restored successfully");
        } catch (error: any) {
            alert(error.message || "Failed to restore book copy");
        }
    };

    // =========================================================
    // FILTER LOGIC
    // =========================================================

    const filteredCopies = useMemo(() => {
        return bookCopies.filter((copy) => {
            const query = searchTerm.toLowerCase().trim();

            const matchesSearch =
                (copy.barcode || "").toLowerCase().includes(query) ||
                (copy.book?.title || "").toLowerCase().includes(query) ||
                (copy.book?.authors || []).some((author: any) =>
                    (author.name || "").toLowerCase().includes(query)
                );

            const matchesStatus =
                statusFilter === "ALL" ||
                getEffectiveStatus(copy) === statusFilter.toUpperCase();

            const matchesBook =
                selectedBookFilter === "ALL" ||
                String(copy.book?.id) === String(selectedBookFilter);

            return matchesSearch && matchesStatus && matchesBook;
        });
    }, [bookCopies, searchTerm, statusFilter, selectedBookFilter]);

    // =========================================================
    // QUICK METRICS
    // =========================================================

    const totalCopies = bookCopies.length;

    const borrowedCopies = bookCopies.filter(
        (copy) => (copy.status || "").toUpperCase() === "BORROWED"
    ).length;

    const availableCopies = bookCopies.filter(
        (copy) =>
            (copy.status || "").toUpperCase() === "AVAILABLE" &&
            (copy.book?.status || "").toUpperCase() === "ACTIVE"
    ).length;

    // =========================================================
    // STATUS BADGE
    // =========================================================

    const renderStatusBadge = (status: string) => {
        const s = (status || "").toUpperCase();

        if (s === "AVAILABLE") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    AVAILABLE
                </span>
            );
        }

        if (s === "BORROWED") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 ring-1 ring-inset ring-amber-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    BORROWED
                </span>
            );
        }

        if (s === "LOST") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    LOST
                </span>
            );
        }

        if (s === "DAMAGED") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 ring-1 ring-inset ring-orange-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    DAMAGED
                </span>
            );
        }

        if (s === "REMOVED") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-400/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    REMOVED
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-400/20">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                {s || "UNAVAILABLE"}
            </span>
        );
    };

    return (
        <div className="min-h-screen w-full bg-[#f7f8fa] p-6 font-sans lg:p-8">
            <div className="mx-auto w-full max-w-[1500px] space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                            <span>Inventory</span>
                            <span>/</span>
                            <span className="text-slate-700">
                                Book Copies
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Book Copies
                            </h1>

                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                Physical Inventory
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Track individual physical copies, barcodes, and circulation status.
                        </p>
                    </div>

                    {/* Primary Action */}
                    <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[0.98]"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                        </svg>
                        Add Book Copy
                    </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Total Physical Copies
                            </span>

                            <span className="h-2 w-2 rounded-full bg-slate-900" />
                        </div>

                        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                            {totalCopies}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Barcoded physical books
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                                Available Copies
                            </span>

                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>

                        <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-600">
                            {availableCopies}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Ready for circulation
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                                Currently Borrowed
                            </span>

                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                        </div>

                        <p className="mt-3 text-3xl font-bold tracking-tight text-amber-600">
                            {borrowedCopies}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Currently with readers
                        </p>
                    </div>
                </div>

                {/* Inventory */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Toolbar */}
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Physical Copies Inventory
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                                Showing {filteredCopies.length} of{" "}
                                {bookCopies.length} items
                            </p>
                        </div>

                        <div className="flex flex-col gap-2.5 sm:flex-row">

                            {/* Search */}
                            <div className="relative min-w-0 sm:w-[250px]">
                                <svg
                                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-4-4" />
                                </svg>

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Search barcode, title, author..."
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                                />
                            </div>

                            {/* Book Filter */}
                            <select
                                value={selectedBookFilter}
                                onChange={(e) =>
                                    setSelectedBookFilter(e.target.value)
                                }
                                className="h-10 max-w-[220px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                            >
                                <option value="ALL">
                                    All Active Books
                                </option>

                                {activeBooks.map((book) => (
                                    <option key={book.id} value={book.id}>
                                        {book.title}
                                    </option>
                                ))}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                            >
                                <option value="ALL">All Status</option>
                                <option value="AVAILABLE">Available</option>
                                <option value="BORROWED">Borrowed</option>
                                <option value="LOST">Lost</option>
                                <option value="DAMAGED">Damaged</option>
                                <option value="UNAVAILABLE">
                                    Unavailable
                                </option>
                                <option value="REMOVED">Removed</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

                            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                                Loading book copies...
                            </p>
                        </div>
                    ) : filteredCopies.length === 0 ? (
                        /* Empty State */
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
                                    <path d="M5 4h14v16H5z" />
                                    <path d="M8 8h8" />
                                    <path d="M8 12h8" />
                                    <path d="M8 16h5" />
                                </svg>
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                No Book Copies Found
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                Try adjusting your search criteria or filters.
                            </p>
                        </div>
                    ) : (
                        /* Table */
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] text-left text-xs">
                                <thead className="border-b border-slate-100 bg-slate-50/60">
                                <tr>
                                    <th className="py-3.5 pl-6 pr-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        ID
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Barcode
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Book
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Author
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Publisher
                                    </th>

                                    <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Status
                                    </th>

                                    <th className="py-3.5 pl-4 pr-6 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Action
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {filteredCopies.map((bookCopy) => {
                                    const effectiveStatus =
                                        getEffectiveStatus(bookCopy);

                                    const canRestore =
                                        effectiveStatus === "LOST" ||
                                        effectiveStatus === "DAMAGED" ||
                                        effectiveStatus === "REMOVED";

                                    const authors =
                                        bookCopy.book?.authors || [];

                                    return (
                                        <tr
                                            key={bookCopy.id}
                                            className="transition-colors hover:bg-slate-50/60"
                                        >
                                            {/* ID */}
                                            <td className="py-4 pl-6 pr-3 align-middle">
                                                    <span className="font-mono text-xs font-medium text-slate-400">
                                                        #{bookCopy.id}
                                                    </span>
                                            </td>

                                            {/* Barcode */}
                                            <td className="px-4 py-4 align-middle">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(
                                                            `/book-copies/${bookCopy.id}`
                                                        )
                                                    }
                                                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
                                                >
                                                    {bookCopy.barcode}
                                                </button>
                                            </td>

                                            {/* Book */}
                                            <td className="px-4 py-4 align-middle">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(
                                                            `/book-copies/${bookCopy.id}`
                                                        )
                                                    }
                                                    className="group text-left"
                                                >
                                                    <p className="text-sm font-semibold text-slate-900 transition group-hover:text-slate-600">
                                                        {bookCopy.book
                                                            ?.title || "—"}
                                                    </p>

                                                    <p className="mt-1 font-mono text-[11px] text-slate-400">
                                                        ISBN:{" "}
                                                        {bookCopy.book
                                                            ?.isbn || "—"}
                                                    </p>
                                                </button>
                                            </td>

                                            {/* Authors */}
                                            <td className="px-4 py-4 align-middle">
                                                <div className="max-w-[180px] space-y-0.5">
                                                    {authors.length > 0 ? (
                                                        authors.map(
                                                            (
                                                                author: any
                                                            ) => (
                                                                <p
                                                                    key={
                                                                        author.id
                                                                    }
                                                                    className="truncate text-xs font-medium text-slate-600"
                                                                >
                                                                    {
                                                                        author.name
                                                                    }
                                                                </p>
                                                            )
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-slate-400">
                                                                —
                                                            </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Publisher */}
                                            <td className="px-4 py-4 align-middle">
                                                    <span className="text-xs font-medium text-slate-600">
                                                        {bookCopy.book
                                                                ?.publisher?.name ||
                                                            "—"}
                                                    </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4 text-center align-middle">
                                                {renderStatusBadge(
                                                    effectiveStatus
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 pl-4 pr-6 text-right align-middle">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.push(
                                                                `/book-copies/${bookCopy.id}`
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        Detail
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditBookCopy(
                                                                bookCopy
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        Edit
                                                    </button>

                                                    {canRestore && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRestoreBookCopy(
                                                                    bookCopy.id
                                                                )
                                                            }
                                                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                                                        >
                                                            Restore
                                                        </button>
                                                    )}
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

            {/* =====================================================
                ADD BOOK COPY MODAL
            ====================================================== */}

            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">

                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 p-6">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Add New Book Copy
                                </h3>

                                <p className="mt-1 text-xs text-slate-400">
                                    Link a physical barcode to an active book.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                >
                                    <path d="M6 6l12 12" />
                                    <path d="M18 6 6 18" />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-5 p-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Book Title{" "}
                                    <span className="text-rose-500">*</span>
                                </label>

                                <select
                                    name="bookId"
                                    value={formData.bookId}
                                    onChange={handleInputChange}
                                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                                >
                                    <option value="">
                                        Select an active book
                                    </option>

                                    {activeBooks.map((book) => (
                                        <option
                                            key={book.id}
                                            value={book.id}
                                        >
                                            {book.title} (#{book.id})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Physical Barcode{" "}
                                    <span className="text-rose-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleInputChange}
                                    placeholder="e.g. BC-1002934"
                                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 border-t border-slate-100 p-6">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleCreateBookCopy}
                                className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[0.98]"
                            >
                                Create Copy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
                EDIT BOOK COPY MODAL
            ====================================================== */}

            {showEditForm && selectedBookCopy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">

                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 p-6">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Edit Book Copy
                                </h3>

                                <p className="mt-1 text-xs text-slate-400">
                                    Update physical copy information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseEdit}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                >
                                    <path d="M6 6l12 12" />
                                    <path d="M18 6 6 18" />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-5 p-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Book Copy ID
                                </label>

                                <input
                                    type="text"
                                    value={`#${selectedBookCopy.id}`}
                                    disabled
                                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Barcode{" "}
                                    <span className="text-rose-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleInputChange}
                                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Linked Book Title{" "}
                                    <span className="text-rose-500">*</span>
                                </label>

                                <select
                                    name="bookId"
                                    value={formData.bookId}
                                    onChange={handleInputChange}
                                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                                >
                                    <option value="">
                                        Select an active book
                                    </option>

                                    {activeBooks.map((book) => (
                                        <option
                                            key={book.id}
                                            value={book.id}
                                        >
                                            {book.title} (#{book.id})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Current Status
                                </label>

                                <div className="mt-2">
                                    {renderStatusBadge(
                                        getEffectiveStatus(
                                            selectedBookCopy
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 border-t border-slate-100 p-6">
                            <button
                                type="button"
                                onClick={handleCloseEdit}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleUpdateBookCopy}
                                className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[0.98]"
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