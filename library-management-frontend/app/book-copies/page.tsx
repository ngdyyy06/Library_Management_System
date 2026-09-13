"use client";

import { useEffect, useState } from "react";
import {
    getBookCopies,
    getBooks,
    createBookCopy,
} from "../lib/api";

export default function BookCopiesPage() {
    const [bookCopies, setBookCopies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [books, setBooks] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedBookFilter, setSelectedBookFilter] = useState("ALL");

    const [formData, setFormData] = useState({
        barcode: "",
        bookId: "",
    });

    const loadBooks = async () => {
        try {
            const data = await getBooks();
            setBooks(data);
        } catch (error) {
            console.error("Failed to load books:", error);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateBookCopy = async () => {
        if (!formData.bookId) {
            alert("Please select a book");
            return;
        }

        if (!formData.barcode.trim()) {
            alert("Please enter barcode");
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
        } catch (error) {
            console.error("Failed to create book copy:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to create book copy"
            );
        }
    };

    const loadBookCopies = async () => {
        try {
            const data = await getBookCopies();
            setBookCopies(data);
        } catch (error) {
            console.error("Failed to load book copies:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookCopies();
        loadBooks();
    }, []);

    // Danh sách các sách đang ACTIVE để đưa vào dropdown filter
    const activeBooks = books.filter((book) => book.status === "ACTIVE");

    // Filter logic kết hợp cả Search, Status, và Book Title (Active)
    const filteredCopies = bookCopies.filter((copy) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            (copy.barcode || "").toLowerCase().includes(query) ||
            (copy.book?.title || "").toLowerCase().includes(query);

        const matchesStatus =
            statusFilter === "ALL" ||
            getEffectiveStatus(copy) === statusFilter.toUpperCase();

        const matchesBook =
            selectedBookFilter === "ALL" ||
            String(copy.book?.id) === String(selectedBookFilter);

        return matchesSearch && matchesStatus && matchesBook;
    });

    // Quick counts
    const totalCopies = bookCopies.length;
    const borrowedCopies = bookCopies.filter((c) => (c.status || "").toUpperCase() === "BORROWED").length;
    const availableCopies = bookCopies.filter(
        (c) =>
            (c.status || "").toUpperCase() === "AVAILABLE" &&
            (c.book?.status || "").toUpperCase() === "ACTIVE"
    ).length;

    const getEffectiveStatus = (copy: any) => {
        if (
            (copy.book?.status || "").toUpperCase() === "INACTIVE" &&
            (copy.status || "").toUpperCase() === "AVAILABLE"
        ) {
            return "UNAVAILABLE";
        }

        return (copy.status || "").toUpperCase();
    };

    // Helper render status badge
    const renderStatusBadge = (status: string) => {
        const s = (status || "").toUpperCase();
        if (s === "AVAILABLE") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {status}
                </span>
            );
        }
        if (s === "BORROWED") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {status}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                {status || "—"}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                Book Copies
                            </h1>
                            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 border border-indigo-100">
                                Physical Inventory
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Track individual physical copies, barcodes, and real-time circulation state.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300/60 active:translate-y-0"
                    >
                        <svg className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Book Copy</span>
                    </button>
                </div>

                {/* ── Quick Stats Strip ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Total Physical Copies
                            </p>
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-slate-900">{totalCopies}</p>
                        <p className="mt-0.5 text-xs text-slate-400">Barcoded physical books</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                Available Copies
                            </p>
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-emerald-700">{availableCopies}</p>
                        <p className="mt-0.5 text-xs text-slate-400">Ready on shelves</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                                Currently Borrowed
                            </p>
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-amber-700">{borrowedCopies}</p>
                        <p className="mt-0.5 text-xs text-slate-400">In readers possession</p>
                    </div>
                </div>

                {/* ── Add Book Copy Form Card ── */}
                {showAddForm && (
                    <div className="overflow-hidden rounded-2xl border border-indigo-200/80 bg-white p-6 sm:p-7 shadow-lg shadow-indigo-100/50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Add New Book Copy
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Link a new physical barcode to an active book title
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Select Book Title <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="bookId"
                                    value={formData.bookId}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                >
                                    <option value="">Select an active book title</option>
                                    {activeBooks.map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} (#{book.id})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Physical Barcode <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="barcode"
                                        value={formData.barcode}
                                        onChange={handleInputChange}
                                        placeholder="e.g. BC-1002934"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs sm:text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleCreateBookCopy}
                                className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-200/60 transition-all hover:shadow-lg active:scale-95"
                            >
                                Create Copy
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Book Copies Table Card ── */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="flex flex-col gap-3.5 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Physical Copies Inventory
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-400">
                                Showing {filteredCopies.length} of {bookCopies.length} items
                            </p>
                        </div>

                        {/* Search, Filter Book Title (Active), and Status Filters */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            {/* Search box */}
                            <div className="relative w-full sm:w-56">
                                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.15 6.15a7.5 7.5 0 0 0 10.5 10.5z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search barcode/title..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Dropdown Lọc Theo Tên Sách Đang ACTIVE */}
                            <select
                                value={selectedBookFilter}
                                onChange={(e) => setSelectedBookFilter(e.target.value)}
                                className="w-full sm:w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 truncate"
                            >
                                <option value="ALL">All Active Books</option>
                                {activeBooks.map((book) => (
                                    <option key={book.id} value={book.id}>
                                        {book.title}
                                    </option>
                                ))}
                            </select>

                            {/* Dropdown Lọc Theo Trạng Thái */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            >
                                <option value="ALL">All Status</option>
                                <option value="AVAILABLE">Available</option>
                                <option value="BORROWED">Borrowed</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center p-16">
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                                <p className="text-xs font-semibold text-slate-400">Loading book copies...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-6 py-3.5">ID</th>
                                    <th className="px-6 py-3.5">Barcode</th>
                                    <th className="px-6 py-3.5">Book Title</th>
                                    <th className="px-6 py-3.5">Status</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {filteredCopies.map((bookCopy) => (
                                    <tr
                                        key={bookCopy.id}
                                        className="transition-colors duration-150 hover:bg-slate-50/70"
                                    >
                                        <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-400">
                                            #{bookCopy.id}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100/90 px-3 py-1 font-mono text-xs font-bold text-slate-800 border border-slate-200/80">
                                                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                </svg>
                                                <span>{bookCopy.barcode}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold text-slate-900">
                                                        {bookCopy.book?.title || "—"}
                                                    </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {renderStatusBadge(getEffectiveStatus(bookCopy))}                                        </td>
                                    </tr>
                                ))}

                                {filteredCopies.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                </svg>
                                            </div>
                                            <p className="mt-3 text-sm font-semibold text-slate-700">No book copies found</p>
                                            <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or register a new physical copy.</p>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}