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

    // Helper render status badge
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
        <div className="min-h-screen w-full bg-[#f8fafc] p-6 lg:p-8 font-sans">
            <div className="w-full space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Book Copies
                            </h1>
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                                Physical Inventory
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Track individual physical copies, barcodes, and real-time circulation state.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                         Add Book Copy
                    </button>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                TOTAL PHYSICAL COPIES
                            </span>
                            <span className="h-2 w-2 rounded-full bg-indigo-600" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{totalCopies}</p>
                        <p className="mt-1 text-xs text-slate-400">Barcoded physical books</p>
                    </div>

                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                                AVAILABLE COPIES
                            </span>
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-emerald-600">{availableCopies}</p>
                        <p className="mt-1 text-xs text-slate-400">Ready on shelves</p>
                    </div>

                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                                CURRENTLY BORROWED
                            </span>
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-amber-600">{borrowedCopies}</p>
                        <p className="mt-1 text-xs text-slate-400">In readers possession</p>
                    </div>
                </div>

                {/* Main Table Container */}
                <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">

                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Physical Copies Inventory
                            </h2>
                            <p className="text-xs text-slate-400">
                                Showing {filteredCopies.length} of {bookCopies.length} items
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Search */}
                            <div className="relative min-w-[220px]">
                                <svg
                                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search barcode/title/author..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Book Filter */}
                            <select
                                value={selectedBookFilter}
                                onChange={(e) => setSelectedBookFilter(e.target.value)}
                                className="max-w-[200px] truncate rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            >
                                <option value="ALL">All Active Books</option>
                                {activeBooks.map((book) => (
                                    <option key={book.id} value={book.id}>
                                        {book.title}
                                    </option>
                                ))}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            >
                                <option value="ALL">All Status</option>
                                <option value="AVAILABLE">Available</option>
                                <option value="BORROWED">Borrowed</option>
                                <option value="LOST">Lost</option>
                                <option value="DAMAGED">Damaged</option>
                                <option value="UNAVAILABLE">Unavailable</option>
                                <option value="REMOVED">Removed</option>
                            </select>
                        </div>
                    </div>

                    {/* Table View */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
                            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Loading book copies...
                            </p>
                        </div>
                    ) : filteredCopies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-slate-900">No book copies found</h3>
                            <p className="mt-1 text-xs text-slate-400">
                                Try adjusting your search criteria or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3">ID</th>
                                    <th scope="col" className="px-4 py-3.5">BARCODE</th>
                                    <th scope="col" className="px-4 py-3.5">BOOK</th>
                                    <th scope="col" className="px-4 py-3.5">AUTHOR</th>
                                    <th scope="col" className="px-4 py-3.5">PUBLISHER</th>
                                    <th scope="col" className="px-4 py-3.5 text-center">STATUS</th>
                                    <th scope="col" className="py-3.5 pl-4 pr-6 text-right">ACTION</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {filteredCopies.map((bookCopy) => {
                                    const effectiveStatus = getEffectiveStatus(bookCopy);
                                    const canRestore =
                                        effectiveStatus === "LOST" ||
                                        effectiveStatus === "DAMAGED" ||
                                        effectiveStatus === "REMOVED";

                                    const authors = bookCopy.book?.authors || [];

                                    return (
                                        <tr key={bookCopy.id} className="transition hover:bg-slate-50/60">
                                            {/* ID */}
                                            <td className="py-4 pl-6 pr-3 font-mono text-xs font-semibold text-slate-400">
                                                #{bookCopy.id}
                                            </td>

                                            {/* Barcode */}
                                            <td className="px-4 py-4">
                                                    <span
                                                        onClick={() => router.push(`/book-copies/${bookCopy.id}`)}
                                                        className="inline-flex cursor-pointer rounded-lg border border-slate-200/80 bg-slate-100/90 px-3 py-1 font-mono text-xs font-bold text-slate-800 transition hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
                                                    >
                                                        {bookCopy.barcode}
                                                    </span>
                                            </td>

                                            {/* Book Title */}
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => router.push(`/book-copies/${bookCopy.id}`)}
                                                    className="group text-left"
                                                >
                                                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                                        {bookCopy.book?.title || "—"}
                                                    </p>
                                                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                                                        ISBN: {bookCopy.book?.isbn || "—"}
                                                    </p>
                                                </button>
                                            </td>

                                            {/* Author */}
                                            <td className="px-4 py-4">
                                                <div className="max-w-[180px]">
                                                    {authors.length > 0 ? (
                                                        authors.map((author: any) => (
                                                            <p
                                                                key={author.id}
                                                                className="truncate text-xs font-medium text-slate-700"
                                                            >
                                                                {author.name}
                                                            </p>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Publisher */}
                                            <td className="px-4 py-4">
                                                    <span className="text-xs font-medium text-slate-700">
                                                        {bookCopy.book?.publisher?.name || "—"}
                                                    </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4 text-center">
                                                {renderStatusBadge(effectiveStatus)}
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="py-4 pl-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Nút sang trang Detail riêng */}
                                                    <button
                                                        onClick={() => router.push(`/book-copies/${bookCopy.id}`)}
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600"
                                                    >
                                                        Detail
                                                    </button>

                                                    <button
                                                        onClick={() => handleEditBookCopy(bookCopy)}
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600"
                                                    >
                                                        Edit
                                                    </button>

                                                    {canRestore && (
                                                        <button
                                                            onClick={() => handleRestoreBookCopy(bookCopy.id)}
                                                            className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs transition hover:bg-emerald-50"
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

            {/* Modal Add Form */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 transition-all">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Add New Book Copy</h3>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Link a physical barcode to an active book.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Book Title <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="bookId"
                                    value={formData.bookId}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                >
                                    <option value="">Select an active book</option>
                                    {activeBooks.map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} (#{book.id})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Physical Barcode <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleInputChange}
                                    placeholder="e.g. BC-1002934"
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 font-mono text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateBookCopy}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-indigo-700"
                            >
                                Create Copy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit Form */}
            {showEditForm && selectedBookCopy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 transition-all">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Edit Book Copy</h3>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Update physical copy information.
                                </p>
                            </div>
                            <button
                                onClick={handleCloseEdit}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Book Copy ID
                                </label>
                                <input
                                    type="text"
                                    value={`#${selectedBookCopy.id}`}
                                    disabled
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Barcode <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 font-mono text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Linked Book Title <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="bookId"
                                    value={formData.bookId}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                >
                                    <option value="">Select an active book</option>
                                    {activeBooks.map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} (#{book.id})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Current Status
                                </label>
                                <div className="mt-1">
                                    {renderStatusBadge(getEffectiveStatus(selectedBookCopy))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={handleCloseEdit}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdateBookCopy}
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