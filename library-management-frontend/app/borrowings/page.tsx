"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import {
    getBorrowings,
    getBorrowingDetails,
    getReaders,
    getBooks,
    createBorrowing,
    renewBorrowing,
    getDashboard,
} from "@/app/lib/api";

type Reader = {
    id: number;
    readerCode: string;
    fullName: string;
    phone?: string;
    status: string;
};

type Book = {
    id: number;
    title: string;
    isbn: string;
    price: number;
    totalQuantity: number;
    availableQuantity: number;
    status: string;
};

type BorrowingDetail = {
    id: number;
    quantity: number;
    goodQuantity: number;
    damagedQuantity: number;
    lostQuantity: number;
    returnedAt?: string | null;
    fine: number;
    damageFine: number;
    book: Book;
};

type Borrowing = {
    id: number;
    reader: Reader;
    borrowedAt: string;
    dueDate: string;
    status: string;
    renewalCount: number;
    depositAmount: number;
    details?: BorrowingDetail[];
};

type SelectedBook = {
    bookId: number;
    quantity: number;
};

type Dashboard = {
    todayRevenue: number;
    monthlyRevenue: number;
};

export default function BorrowingsPage() {
    const router = useRouter();

    const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
    const [readers, setReaders] = useState<Reader[]>([]);
    const [books, setBooks] = useState<Book[]>([]);

    const [dashboard, setDashboard] =
        useState<Dashboard | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("BORROWING");

    // Create Modal State
    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [selectedReaderId, setSelectedReaderId] =
        useState("");

    const [borrowDate, setBorrowDate] =
        useState("");

    const [dueDate, setDueDate] =
        useState("");

    const [selectedBooks, setSelectedBooks] =
        useState<SelectedBook[]>([]);

    const [bookSearchQuery, setBookSearchQuery] =
        useState("");

    // Renew Modal State
    const [showRenewModal, setShowRenewModal] =
        useState(false);

    const [selectedBorrowing, setSelectedBorrowing] =
        useState<Borrowing | null>(null);

    const [renewDays, setRenewDays] =
        useState(7);

    const [paymentConfirmed, setPaymentConfirmed] =
        useState(false);

    const [renewing, setRenewing] =
        useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    async function loadInitialData() {
        try {
            setLoading(true);
            setError("");

            const [
                borrowingData,
                readerData,
                bookData,
                dashboardData,
            ] = await Promise.all([
                getBorrowings().catch(() => []),
                getReaders().catch(() => []),
                getBooks().catch(() => []),
                getDashboard().catch(() => null),
            ]);

            const rawBorrowings =
                Array.isArray(borrowingData)
                    ? borrowingData
                    : [];

            /*
             * getBorrowings() chỉ trả Borrowing.
             * Lấy thêm BorrowingDetail cho từng phiếu
             * để hiển thị tên sách trong bảng.
             */
            const borrowingsWithDetails: Borrowing[] =
                await Promise.all(
                    rawBorrowings.map(
                        async (
                            borrowing: Borrowing
                        ) => {
                            try {
                                const detailData =
                                    await getBorrowingDetails(
                                        borrowing.id
                                    );

                                return {
                                    ...borrowing,
                                    details:
                                        Array.isArray(
                                            detailData
                                        )
                                            ? detailData
                                            : [],
                                };
                            } catch (error) {
                                console.error(
                                    `Failed to load details for borrowing #${borrowing.id}:`,
                                    error
                                );

                                return {
                                    ...borrowing,
                                    details: [],
                                };
                            }
                        }
                    )
                );

            setBorrowings(
                borrowingsWithDetails
            );

            setReaders(
                Array.isArray(readerData)
                    ? readerData
                    : []
            );

            setBooks(
                Array.isArray(bookData)
                    ? bookData
                    : []
            );

            if (dashboardData) {
                setDashboard({
                    todayRevenue:
                        Number(
                            dashboardData.todayRevenue ??
                            0
                        ),

                    monthlyRevenue:
                        Number(
                            dashboardData.monthlyRevenue ??
                            0
                        ),
                });
            } else {
                setDashboard(null);
            }
        } catch (err: any) {
            console.error(
                "Failed to load circulation records:",
                err
            );

            setError(
                err?.message ||
                "Failed to load circulation records."
            );
        } finally {
            setLoading(false);
        }
    }

    // Initialize Default Dates for Create Form
    function openCreateModal() {
        const today = new Date();
        const defaultDue = new Date();

        defaultDue.setDate(
            today.getDate() + 14
        );

        setBorrowDate(
            today.toISOString().split("T")[0]
        );

        setDueDate(
            defaultDue.toISOString().split("T")[0]
        );

        setSelectedReaderId("");
        setSelectedBooks([]);
        setBookSearchQuery("");

        setError("");
        setSuccess("");

        setShowCreateModal(true);
    }

    function closeCreateModal() {
        if (saving) return;

        setShowCreateModal(false);
        setError("");
    }

    // Preset Date Adjuster
    function setQuickDays(days: number) {
        const base = borrowDate
            ? new Date(borrowDate)
            : new Date();

        const target = new Date(base);

        target.setDate(
            base.getDate() + days
        );

        setDueDate(
            target.toISOString().split("T")[0]
        );
    }

    // Available Books
    const availableBooks = useMemo(() => {
        return books.filter(
            (book) =>
                book.status === "ACTIVE" &&
                book.availableQuantity > 0
        );
    }, [books]);

    // Filter books in create modal
    const filteredAvailableBooks =
        useMemo(() => {
            const query =
                bookSearchQuery
                    .trim()
                    .toLowerCase();

            if (!query) {
                return availableBooks;
            }

            return availableBooks.filter(
                (book) =>
                    book.title
                        ?.toLowerCase()
                        .includes(query) ||
                    book.isbn
                        ?.toLowerCase()
                        .includes(query)
            );
        }, [
            availableBooks,
            bookSearchQuery,
        ]);

    // Get selected quantity for a book
    function getSelectedQuantity(
        bookId: number
    ) {
        return (
            selectedBooks.find(
                (item) =>
                    item.bookId === bookId
            )?.quantity || 0
        );
    }

    // Calculate total deposit
    const totalDeposit = useMemo(() => {
        return selectedBooks.reduce(
            (total, selected) => {
                const book = books.find(
                    (item) =>
                        item.id ===
                        selected.bookId
                );

                if (!book) {
                    return total;
                }

                return (
                    total +
                    Number(
                        book.price || 0
                    ) *
                    selected.quantity
                );
            },
            0
        );
    }, [selectedBooks, books]);

    // Add book to borrowing list
    function addBook(bookId: number) {
        const existing =
            selectedBooks.find(
                (item) =>
                    item.bookId === bookId
            );

        if (existing) {
            return;
        }

        setSelectedBooks((prev) => [
            ...prev,
            {
                bookId,
                quantity: 1,
            },
        ]);
    }

    // Remove book from borrowing list
    function removeBook(bookId: number) {
        setSelectedBooks((prev) =>
            prev.filter(
                (item) =>
                    item.bookId !== bookId
            )
        );
    }

    // Update book quantity
    function updateBookQuantity(
        bookId: number,
        quantity: number
    ) {
        const book = books.find(
            (item) =>
                item.id === bookId
        );

        if (!book) return;

        const safeQuantity = Math.max(
            1,
            Math.min(
                quantity,
                book.availableQuantity
            )
        );

        setSelectedBooks((prev) =>
            prev.map((item) =>
                item.bookId === bookId
                    ? {
                        ...item,
                        quantity:
                        safeQuantity,
                    }
                    : item
            )
        );
    }

    // Handle Create Submit
    async function handleCreateBorrowing(
        e: React.FormEvent
    ) {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!selectedReaderId) {
            setError(
                "Please select a registered library reader."
            );
            return;
        }

        if (!dueDate) {
            setError(
                "Please specify the scheduled return due date."
            );
            return;
        }

        if (selectedBooks.length === 0) {
            setError(
                "Please select at least one book to issue."
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                readerId:
                    Number(selectedReaderId),

                books: selectedBooks,
            };

            await createBorrowing(payload);

            setSuccess(
                "Borrowing ticket created successfully!"
            );

            await loadInitialData();

            setTimeout(() => {
                setShowCreateModal(false);
                setSuccess("");
            }, 600);
        } catch (err: any) {
            console.error(
                "Failed to create borrowing ticket:",
                err
            );

            setError(
                err?.message ||
                "Failed to create borrowing ticket."
            );
        } finally {
            setSaving(false);
        }
    }

    // Open Renew Modal
    function openRenewModal(
        borrowing: Borrowing
    ) {
        setSelectedBorrowing(borrowing);
        setRenewDays(7);
        setPaymentConfirmed(false);
        setError("");
        setSuccess("");
        setShowRenewModal(true);
    }

    // Close Renew Modal
    function closeRenewModal() {
        if (renewing) return;

        setShowRenewModal(false);
        setSelectedBorrowing(null);
        setPaymentConfirmed(false);
        setError("");
    }

    // Handle Renew
    async function handleRenewBorrowing(
        e: React.FormEvent
    ) {
        e.preventDefault();

        if (!selectedBorrowing) return;

        setError("");
        setSuccess("");

        if (
            renewDays < 3 ||
            renewDays > 30
        ) {
            setError(
                "Renewal period must be between 3 and 30 days."
            );
            return;
        }

        if (
            selectedBorrowing.status !==
            "BORROWING" &&
            selectedBorrowing.status !==
            "PARTIALLY_RETURNED"
        ) {
            setError(
                "Only active borrowing records can be renewed."
            );
            return;
        }

        if (
            selectedBorrowing.renewalCount >=
            2
        ) {
            setError(
                "This borrowing ticket has reached the maximum renewal limit."
            );
            return;
        }

        if (!paymentConfirmed) {
            setError(
                "Please confirm that the renewal fee has been paid."
            );
            return;
        }

        try {
            setRenewing(true);

            await renewBorrowing(
                selectedBorrowing.id,
                {
                    days: renewDays,
                    paymentConfirmed: true,
                }
            );

            setSuccess(
                "Borrowing renewed successfully."
            );

            await loadInitialData();

            setTimeout(() => {
                setShowRenewModal(false);
                setSelectedBorrowing(null);
                setSuccess("");
            }, 700);
        } catch (err: any) {
            console.error(
                "Failed to renew borrowing:",
                err
            );

            setError(
                err?.message ||
                "Failed to renew borrowing."
            );
        } finally {
            setRenewing(false);
        }
    }

    // Filter Logic for Main Table
    const filteredBorrowings =
        useMemo(() => {
            return borrowings.filter(
                (borrowing) => {
                    const keyword =
                        searchTerm
                            .trim()
                            .toLowerCase();

                    const reader =
                        borrowing.reader;

                    const bookTitles =
                        borrowing.details
                            ?.map(
                                (detail) =>
                                    detail.book
                                        ?.title ||
                                    ""
                            )
                            .join(" ")
                            .toLowerCase() ||
                        "";

                    const isSearchMatched =
                        !keyword ||
                        String(
                            borrowing.id
                        ).includes(
                            keyword
                        ) ||
                        reader?.fullName
                            ?.toLowerCase()
                            .includes(
                                keyword
                            ) ||
                        reader?.readerCode
                            ?.toLowerCase()
                            .includes(
                                keyword
                            ) ||
                        bookTitles.includes(
                            keyword
                        );

                    const isStatusMatched =
                        statusFilter ===
                        "ALL" ||
                        (statusFilter ===
                        "BORROWING"
                            ? borrowing.status ===
                            "BORROWING" ||
                            borrowing.status ===
                            "PARTIALLY_RETURNED"
                            : borrowing.status ===
                            statusFilter);

                    return (
                        isSearchMatched &&
                        isStatusMatched
                    );
                }
            );
        }, [
            borrowings,
            searchTerm,
            statusFilter,
        ]);

    // Metrics
    const totalBorrowings =
        borrowings.length;

    const activeBorrowings =
        borrowings.filter(
            (borrowing) =>
                borrowing.status ===
                "BORROWING" ||
                borrowing.status ===
                "PARTIALLY_RETURNED"
        ).length;

    const returnedBorrowings =
        borrowings.filter(
            (borrowing) =>
                borrowing.status ===
                "RETURNED"
        ).length;

    return (
        <RoleGuard
            allowedRoles={[
                "LIBRARIAN",
                "ADMIN",
            ]}
        >
            <div className="min-h-screen w-full bg-[#fafafa] p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Page Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                    Borrowings & Circulation
                                </h1>

                                <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs">
                                    Loan Ledger
                                </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                Issue loan slips, inspect active book borrowings, and track return deadlines.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                openCreateModal
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] sm:text-sm"
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
                                    strokeWidth={
                                        1.5
                                    }
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>

                            Create Borrowing
                        </button>
                    </div>

                    {/* Error Banner */}
                    {error &&
                        !showCreateModal &&
                        !showRenewModal && (
                            <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-3 text-xs text-rose-700 sm:text-sm">
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="h-4 w-4 shrink-0 text-rose-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={
                                                1.5
                                            }
                                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                        />
                                    </svg>

                                    <span>
                                        {error}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setError("")
                                    }
                                    className="text-xs font-medium text-rose-600 hover:text-rose-800"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                    {/* Statistics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">
                                Total Loan Records
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                {
                                    totalBorrowings
                                }
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                                All-time circulation transactions
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">
                                Currently Checked Out
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">
                                {
                                    activeBorrowings
                                }
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                                Active borrowing records
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">
                                Completed Returns
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">
                                {
                                    returnedBorrowings
                                }
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                                Restocked back into catalog
                            </p>
                        </div>

                    </div>

                    {/* Revenue */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                        {/* Today Revenue */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <div className="flex items-start justify-between">

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                            Today&apos;s Revenue
                                        </p>
                                    </div>

                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                        {(
                                            dashboard?.todayRevenue ??
                                            0
                                        ).toLocaleString(
                                            "vi-VN"
                                        )}{" "}
                                        <span className="text-sm font-medium text-emerald-600">
                                            VND
                                        </span>
                                    </p>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Fines and renewal fees collected today
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-sm font-semibold text-emerald-600">
                                    ₫
                                </div>
                            </div>
                        </div>

                        {/* Monthly Revenue */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <div className="flex items-start justify-between">

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                            Monthly Revenue
                                        </p>
                                    </div>

                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                        {(
                                            dashboard?.monthlyRevenue ??
                                            0
                                        ).toLocaleString(
                                            "vi-VN"
                                        )}{" "}
                                        <span className="text-sm font-medium text-blue-600">
                                            VND
                                        </span>
                                    </p>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Fines and renewal fees collected this month
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600">
                                    ₫
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Main Container */}
                    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">

                        {/* Filter Bar */}
                        <div className="border-b border-slate-100 p-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                                <div className="relative sm:col-span-2">
                                    <svg
                                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={
                                                1.5
                                            }
                                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                        />
                                    </svg>

                                    <input
                                        type="text"
                                        value={
                                            searchTerm
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setSearchTerm(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Search by ticket ID, reader name, code, or book title..."
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                    />
                                </div>

                                <select
                                    value={
                                        statusFilter
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setStatusFilter(
                                            e.target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                >
                                    <option value="BORROWING">
                                        Active Loans (Borrowing)
                                    </option>

                                    <option value="ALL">
                                        All Statuses
                                    </option>

                                    <option value="OVERDUE">
                                        Overdue Only
                                    </option>

                                    <option value="RETURNED">
                                        Returned & Completed
                                    </option>
                                </select>

                            </div>
                        </div>

                        {/* Table */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />

                                <p className="mt-3 text-xs text-slate-500">
                                    Loading borrowing tickets...
                                </p>
                            </div>
                        ) : filteredBorrowings.length ===
                        0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={
                                                1.5
                                            }
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>

                                <p className="mt-3 text-sm font-medium text-slate-800">
                                    No borrowing records found
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    Try adjusting your filters or issue a new loan.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px] border-collapse text-left">

                                    <thead className="border-b border-slate-100 bg-slate-50/50">
                                    <tr>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Ticket ID
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Patron
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Books
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Borrow Date
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Due Date
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Deposit
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">

                                    {filteredBorrowings.map(
                                        (
                                            borrowing
                                        ) => {
                                            const isReturned =
                                                borrowing.status ===
                                                "RETURNED";

                                            const isOverdue =
                                                borrowing.status ===
                                                "OVERDUE";

                                            const isBorrowing =
                                                borrowing.status ===
                                                "BORROWING" ||
                                                borrowing.status ===
                                                "PARTIALLY_RETURNED";

                                            return (
                                                <tr
                                                    key={
                                                        borrowing.id
                                                    }
                                                    className="transition-colors hover:bg-slate-50/70"
                                                >
                                                    {/* Ticket ID */}
                                                    <td className="px-5 py-3.5">
                                                            <span className="font-mono text-xs font-semibold text-slate-700">
                                                                #
                                                                {
                                                                    borrowing.id
                                                                }
                                                            </span>
                                                    </td>

                                                    {/* Reader */}
                                                    <td className="px-5 py-3.5">
                                                        <div>
                                                            <p className="font-medium text-slate-900">
                                                                {borrowing
                                                                        .reader
                                                                        ?.fullName ||
                                                                    "General Patron"}
                                                            </p>

                                                            <p className="font-mono text-[11px] text-slate-400">
                                                                {borrowing
                                                                        .reader
                                                                        ?.readerCode ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* Books */}
                                                    <td className="px-5 py-3.5">
                                                        <div className="max-w-[280px] space-y-1.5">

                                                            {borrowing.details
                                                                ?.slice(
                                                                    0,
                                                                    3
                                                                )
                                                                .map(
                                                                    (
                                                                        detail
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                detail.id
                                                                            }
                                                                            className="flex items-center justify-between gap-3"
                                                                        >
                                                                                <span className="truncate font-medium text-slate-800">
                                                                                    {detail
                                                                                            .book
                                                                                            ?.title ||
                                                                                        "Untitled Book"}
                                                                                </span>

                                                                            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                                                                    ×
                                                                                {
                                                                                    detail.quantity
                                                                                }
                                                                                </span>
                                                                        </div>
                                                                    )
                                                                )}

                                                            {(borrowing
                                                                        .details
                                                                        ?.length ||
                                                                    0) >
                                                                3 && (
                                                                    <p className="text-[10px] text-slate-400">
                                                                        +
                                                                        {(
                                                                                borrowing
                                                                                    .details
                                                                                    ?.length ||
                                                                                0
                                                                            ) -
                                                                            3}{" "}
                                                                        more book(s)
                                                                    </p>
                                                                )}

                                                            {!borrowing
                                                                .details
                                                                ?.length && (
                                                                <span className="text-slate-400">
                                                                        No book details
                                                                    </span>
                                                            )}

                                                        </div>
                                                    </td>

                                                    {/* Borrow Date */}
                                                    <td className="px-5 py-3.5 text-slate-600">
                                                        {borrowing.borrowedAt
                                                            ? new Date(
                                                                borrowing.borrowedAt
                                                            ).toLocaleString(
                                                                "vi-VN"
                                                            )
                                                            : "—"}
                                                    </td>

                                                    {/* Due Date */}
                                                    <td className="px-5 py-3.5 font-medium text-slate-700">
                                                        {borrowing.dueDate ||
                                                            "—"}
                                                    </td>

                                                    {/* Deposit */}
                                                    <td className="px-5 py-3.5 font-medium text-slate-700">
                                                        {Number(
                                                            borrowing.depositAmount ||
                                                            0
                                                        ).toLocaleString(
                                                            "vi-VN"
                                                        )}{" "}
                                                        VND
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-3.5">
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                    isReturned
                                                                        ? "bg-emerald-50 text-emerald-700"
                                                                        : isBorrowing
                                                                            ? "bg-amber-50 text-amber-700"
                                                                            : isOverdue
                                                                                ? "bg-rose-50 text-rose-700"
                                                                                : "bg-slate-100 text-slate-600"
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                                        isReturned
                                                                            ? "bg-emerald-500"
                                                                            : isBorrowing
                                                                                ? "bg-amber-500"
                                                                                : isOverdue
                                                                                    ? "bg-rose-500"
                                                                                    : "bg-slate-400"
                                                                    }`}
                                                                />

                                                                {
                                                                    borrowing.status
                                                                }
                                                            </span>
                                                    </td>

                                                    {/* Action */}
                                                    <td className="px-5 py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-2">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/borrowings/${borrowing.id}`
                                                                    )
                                                                }
                                                                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
                                                            >
                                                                Detail
                                                            </button>

                                                            {isBorrowing &&
                                                                borrowing.renewalCount <
                                                                2 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openRenewModal(
                                                                                borrowing
                                                                            )
                                                                        }
                                                                        className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-2xs transition hover:bg-slate-800"
                                                                    >
                                                                        Renew
                                                                    </button>
                                                                )}

                                                            {isBorrowing &&
                                                                borrowing.renewalCount >=
                                                                2 && (
                                                                    <span className="text-[11px] font-medium text-slate-400">
                                                                            Renewal limit reached
                                                                        </span>
                                                                )}

                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}

                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* CREATE BORROWING MODAL */}
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]">

                            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200/80 bg-white shadow-xl">

                                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">

                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Issue Borrowing Slip
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Select reader, loan schedule, and books with quantities.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            closeCreateModal
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
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
                                                strokeWidth={
                                                    1.5
                                                }
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>

                                </div>

                                <form
                                    onSubmit={
                                        handleCreateBorrowing
                                    }
                                    className="space-y-5 p-6"
                                >

                                    {/* Reader Selection */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                            Patron / Reader{" "}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>

                                        <select
                                            value={
                                                selectedReaderId
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setSelectedReaderId(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                        >
                                            <option value="">
                                                Select a registered reader...
                                            </option>

                                            {readers
                                                .filter(
                                                    (
                                                        reader
                                                    ) =>
                                                        reader.status ===
                                                        "ACTIVE"
                                                )
                                                .map(
                                                    (
                                                        reader
                                                    ) => (
                                                        <option
                                                            key={
                                                                reader.id
                                                            }
                                                            value={
                                                                reader.id
                                                            }
                                                        >
                                                            {
                                                                reader.fullName
                                                            }{" "}
                                                            (
                                                            {
                                                                reader.readerCode
                                                            }
                                                            )
                                                            {reader.phone
                                                                ? ` — ${reader.phone}`
                                                                : ""}
                                                        </option>
                                                    )
                                                )}
                                        </select>
                                    </div>

                                    {/* Loan Schedule */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                                Borrow Date
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    borrowDate
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setBorrowDate(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <div className="mb-1.5 flex items-center justify-between">

                                                <label className="text-xs font-medium text-slate-700">
                                                    Due Date{" "}
                                                    <span className="text-rose-500">
                                                        *
                                                    </span>
                                                </label>

                                                <div className="flex items-center gap-1">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setQuickDays(
                                                                7
                                                            )
                                                        }
                                                        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                                                    >
                                                        +7d
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setQuickDays(
                                                                14
                                                            )
                                                        }
                                                        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                                                    >
                                                        +14d
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setQuickDays(
                                                                30
                                                            )
                                                        }
                                                        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                                                    >
                                                        +30d
                                                    </button>

                                                </div>
                                            </div>

                                            <input
                                                type="date"
                                                value={
                                                    dueDate
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setDueDate(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                            />
                                        </div>

                                    </div>

                                    {/* Book Selector */}
                                    <div className="space-y-2.5">

                                        <div className="flex items-center justify-between">

                                            <label className="text-xs font-medium text-slate-700">
                                                Select Books (
                                                {
                                                    selectedBooks.length
                                                }{" "}
                                                selected){" "}
                                                <span className="text-rose-500">
                                                    *
                                                </span>
                                            </label>

                                            <span className="text-[11px] text-slate-400">
                                                Available inventory only
                                            </span>

                                        </div>

                                        <input
                                            type="text"
                                            value={
                                                bookSearchQuery
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setBookSearchQuery(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="Filter books by title or ISBN..."
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
                                        />

                                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200">

                                            {filteredAvailableBooks.length ===
                                            0 ? (
                                                <div className="p-5 text-center text-xs text-slate-400">
                                                    No available books match your search.
                                                </div>
                                            ) : (
                                                filteredAvailableBooks.map(
                                                    (
                                                        book
                                                    ) => {
                                                        const selectedQuantity =
                                                            getSelectedQuantity(
                                                                book.id
                                                            );

                                                        const isSelected =
                                                            selectedQuantity >
                                                            0;

                                                        return (
                                                            <div
                                                                key={
                                                                    book.id
                                                                }
                                                                className={`flex items-center justify-between gap-4 p-3 transition-colors ${
                                                                    isSelected
                                                                        ? "bg-slate-50"
                                                                        : "hover:bg-slate-50/60"
                                                                }`}
                                                            >

                                                                <div className="min-w-0 flex-1">

                                                                    <p className="truncate text-xs font-medium text-slate-900">
                                                                        {
                                                                            book.title
                                                                        }
                                                                    </p>

                                                                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400">

                                                                        <span className="font-mono">
                                                                            ISBN:{" "}
                                                                            {
                                                                                book.isbn
                                                                            }
                                                                        </span>

                                                                        <span>
                                                                            Price:{" "}
                                                                            {Number(
                                                                                book.price ||
                                                                                0
                                                                            ).toLocaleString(
                                                                                "vi-VN"
                                                                            )}{" "}
                                                                            VND
                                                                        </span>

                                                                        <span>
                                                                            Available:{" "}
                                                                            {
                                                                                book.availableQuantity
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                </div>

                                                                {!isSelected ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            addBook(
                                                                                book.id
                                                                            )
                                                                        }
                                                                        className="shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100"
                                                                    >
                                                                        Add
                                                                    </button>
                                                                ) : (
                                                                    <div className="flex shrink-0 items-center gap-2">

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                removeBook(
                                                                                    book.id
                                                                                )
                                                                            }
                                                                            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-rose-600"
                                                                        >
                                                                            Remove
                                                                        </button>

                                                                        <input
                                                                            type="number"
                                                                            min={
                                                                                1
                                                                            }
                                                                            max={
                                                                                book.availableQuantity
                                                                            }
                                                                            value={
                                                                                selectedQuantity
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                updateBookQuantity(
                                                                                    book.id,
                                                                                    Number(
                                                                                        e.target
                                                                                            .value
                                                                                    )
                                                                                )
                                                                            }
                                                                            className="w-16 rounded-md border border-slate-200 bg-white px-2 py-1 text-center text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                                                                        />

                                                                    </div>
                                                                )}

                                                            </div>
                                                        );
                                                    }
                                                )
                                            )}

                                        </div>

                                    </div>

                                    {/* Selected Books Summary */}
                                    {selectedBooks.length >
                                        0 && (
                                            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">

                                                <div className="mb-3 flex items-center justify-between">

                                                    <p className="text-xs font-semibold text-slate-800">
                                                        Selected Books
                                                    </p>

                                                    <span className="text-[11px] text-slate-400">
                                                    {selectedBooks.reduce(
                                                        (
                                                            total,
                                                            item
                                                        ) =>
                                                            total +
                                                            item.quantity,
                                                        0
                                                    )}{" "}
                                                        total copies
                                                </span>

                                                </div>

                                                <div className="space-y-2">

                                                    {selectedBooks.map(
                                                        (
                                                            selected
                                                        ) => {
                                                            const book =
                                                                books.find(
                                                                    (
                                                                        item
                                                                    ) =>
                                                                        item.id ===
                                                                        selected.bookId
                                                                );

                                                            return (
                                                                <div
                                                                    key={
                                                                        selected.bookId
                                                                    }
                                                                    className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2"
                                                                >

                                                                    <div className="min-w-0">

                                                                        <p className="truncate text-xs font-medium text-slate-800">
                                                                            {
                                                                                book?.title
                                                                            }
                                                                        </p>

                                                                        <p className="font-mono text-[10px] text-slate-400">
                                                                            {
                                                                                book?.isbn
                                                                            }
                                                                        </p>

                                                                    </div>

                                                                    <div className="shrink-0 text-right">

                                                                        <p className="text-xs font-medium text-slate-600">
                                                                            ×{" "}
                                                                            {
                                                                                selected.quantity
                                                                            }
                                                                        </p>

                                                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                                                            {(
                                                                                Number(
                                                                                    book?.price ||
                                                                                    0
                                                                                ) *
                                                                                selected.quantity
                                                                            ).toLocaleString(
                                                                                "vi-VN"
                                                                            )}{" "}
                                                                            VND
                                                                        </p>

                                                                    </div>

                                                                </div>
                                                            );
                                                        }
                                                    )}

                                                </div>

                                                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">

                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-800">
                                                            Total Deposit
                                                        </p>

                                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                                            Total value of all borrowed books
                                                        </p>
                                                    </div>

                                                    <p className="text-base font-semibold text-slate-900">
                                                        {totalDeposit.toLocaleString(
                                                            "vi-VN"
                                                        )}{" "}
                                                        VND
                                                    </p>

                                                </div>

                                            </div>
                                        )}

                                    {/* Alert messages */}
                                    {error && (
                                        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                                            {
                                                error
                                            }
                                        </div>
                                    )}

                                    {success && (
                                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                                            {
                                                success
                                            }
                                        </div>
                                    )}

                                    {/* Modal Actions */}
                                    <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">

                                        <button
                                            type="button"
                                            onClick={
                                                closeCreateModal
                                            }
                                            disabled={
                                                saving
                                            }
                                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                saving ||
                                                selectedBooks.length ===
                                                0
                                            }
                                            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20 disabled:cursor-not-allowed disabled:bg-black disabled:opacity-50"
                                        >
                                            {saving && (
                                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            )}

                                            {saving
                                                ? "Creating Ticket..."
                                                : "Issue Borrowing Slip"}
                                        </button>

                                    </div>

                                </form>
                            </div>
                        </div>
                    )}

                    {/* RENEW BORROWING MODAL */}
                    {showRenewModal &&
                        selectedBorrowing && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]">

                                <div className="w-full max-w-md rounded-xl border border-slate-200/80 bg-white shadow-xl">

                                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">

                                        <div>
                                            <h2 className="text-base font-semibold text-slate-900">
                                                Renew Borrowing
                                            </h2>

                                            <p className="mt-0.5 text-xs text-slate-400">
                                                Extend the due date for this borrowing ticket.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                closeRenewModal
                                            }
                                            disabled={
                                                renewing
                                            }
                                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
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
                                                    strokeWidth={
                                                        1.5
                                                    }
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>

                                    </div>

                                    <form
                                        onSubmit={
                                            handleRenewBorrowing
                                        }
                                        className="space-y-5 p-6"
                                    >

                                        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">

                                            <div className="grid grid-cols-2 gap-4">

                                                <div>
                                                    <p className="text-[11px] font-medium text-slate-400">
                                                        Ticket
                                                    </p>

                                                    <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                                                        #
                                                        {
                                                            selectedBorrowing.id
                                                        }
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[11px] font-medium text-slate-400">
                                                        Reader
                                                    </p>

                                                    <p className="mt-1 truncate text-sm font-medium text-slate-800">
                                                        {selectedBorrowing
                                                                .reader
                                                                ?.fullName ||
                                                            "N/A"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[11px] font-medium text-slate-400">
                                                        Current Due Date
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                                        {
                                                            selectedBorrowing.dueDate
                                                        }
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[11px] font-medium text-slate-400">
                                                        Renewals
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                                        {
                                                            selectedBorrowing.renewalCount
                                                        }{" "}
                                                        / 2
                                                    </p>
                                                </div>

                                            </div>

                                        </div>

                                        {/* Renewal Period */}
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                                Extension Period
                                            </label>

                                            <select
                                                value={
                                                    renewDays
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setRenewDays(
                                                        Number(
                                                            e.target
                                                                .value
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    renewing
                                                }
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 disabled:bg-slate-50"
                                            >
                                                <option value={3}>
                                                    3 days
                                                </option>

                                                <option value={7}>
                                                    7 days
                                                </option>

                                                <option value={14}>
                                                    14 days
                                                </option>

                                                <option value={21}>
                                                    21 days
                                                </option>

                                                <option value={30}>
                                                    30 days
                                                </option>
                                            </select>

                                            <p className="mt-1.5 text-[11px] text-slate-400">
                                                Each renewal can extend the due date by 3–30 days.
                                            </p>
                                        </div>

                                        {/* Renewal Fee */}
                                        <div className="rounded-lg border border-slate-200 bg-white p-4">

                                            <div className="flex items-center justify-between">

                                                <div>
                                                    <p className="text-xs font-medium text-slate-700">
                                                        Renewal Fee
                                                    </p>

                                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                                        1,000 VND per day
                                                    </p>
                                                </div>

                                                <p className="text-sm font-semibold text-slate-900">
                                                    {(
                                                        renewDays *
                                                        1000
                                                    ).toLocaleString(
                                                        "vi-VN"
                                                    )}{" "}
                                                    VND
                                                </p>

                                            </div>

                                        </div>

                                        {/* Payment Confirmation */}
                                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4 transition hover:bg-slate-50">

                                            <input
                                                type="checkbox"
                                                checked={
                                                    paymentConfirmed
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setPaymentConfirmed(
                                                        e.target
                                                            .checked
                                                    )
                                                }
                                                disabled={
                                                    renewing
                                                }
                                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                                            />

                                            <span>
                                                <span className="block text-xs font-medium text-slate-800">
                                                    Payment received
                                                </span>

                                                <span className="mt-0.5 block text-[11px] leading-5 text-slate-400">
                                                    I confirm that the renewal fee has been collected from the reader.
                                                </span>
                                            </span>

                                        </label>

                                        {/* Modal Error */}
                                        {error && (
                                            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                                                {
                                                    error
                                                }
                                            </div>
                                        )}

                                        {/* Modal Success */}
                                        {success && (
                                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                                                {
                                                    success
                                                }
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">

                                            <button
                                                type="button"
                                                onClick={
                                                    closeRenewModal
                                                }
                                                disabled={
                                                    renewing
                                                }
                                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={
                                                    renewing ||
                                                    !paymentConfirmed
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {renewing && (
                                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                )}

                                                {renewing
                                                    ? "Renewing..."
                                                    : "Confirm Renewal"}
                                            </button>

                                        </div>

                                    </form>
                                </div>
                            </div>
                        )}

                </div>
            </div>
        </RoleGuard>
    );
}