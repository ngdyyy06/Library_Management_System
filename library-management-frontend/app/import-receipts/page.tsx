"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
    getImportReceipts,
    getPublishers,
    getBooks,
    getAuthors,
    getCategories,
    createImportReceipt,
    updateImportReceipt,
    activateImportReceipt,
    deactivateImportReceipt,
    getImportReceiptDetails,
} from "@/app/lib/api";

type Publisher = {
    id: number;
    name: string;
    status: string;
};

type Book = {
    id: number;
    title: string;
    isbn: string;
    status: string;
};

type Author = {
    id: number;
    name: string;
    status?: string;
};

type Category = {
    id: number;
    name: string;
    status?: string;
};

type ImportReceipt = {
    id: number;
    receiptCode: string;
    publisher: Publisher;
    importDate: string;
    totalAmount: number;
    status: string;
    createdBy?: {
        id: number;
        username: string;
        fullName: string;
    };
};

type NewBookForm = {
    title: string;
    isbn: string;
    publishYear: string;
    price: string;
    description: string;
    authorIds: string[];
    categoryIds: string[];
    primaryCategoryId: string;
};

type FormDetail = {
    type: "EXISTING" | "NEW";
    bookId: string;
    quantity: string;
    unitPrice: string;
    newBook: NewBookForm;
};

function createEmptyNewBook(): NewBookForm {
    return {
        title: "",
        isbn: "",
        publishYear: "",
        price: "",
        description: "",
        authorIds: [],
        categoryIds: [],
        primaryCategoryId: "",
    };
}

function createEmptyDetail(): FormDetail {
    return {
        type: "EXISTING",
        bookId: "",
        quantity: "",
        unitPrice: "",
        newBook: createEmptyNewBook(),
    };
}

export default function ImportReceiptsPage() {
    const router = useRouter();

    const [receipts, setReceipts] = useState<ImportReceipt[]>([]);
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [publisherId, setPublisherId] = useState("");
    const [importDate, setImportDate] = useState("");

    const [details, setDetails] = useState<FormDetail[]>([
        createEmptyDetail(),
    ]);

    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);

            const [
                receiptData,
                publisherData,
                bookData,
                authorData,
                categoryData,
            ] = await Promise.all([
                getImportReceipts(),
                getPublishers(),
                getBooks(),
                getAuthors(),
                getCategories(),
            ]);

            setReceipts(receiptData || []);
            setPublishers(publisherData || []);
            setBooks(bookData || []);
            setAuthors(authorData || []);
            setCategories(categoryData || []);
        } catch (error: any) {
            setError(error.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setPublisherId("");
        setImportDate("");
        setDetails([createEmptyDetail()]);
        setEditingId(null);
        setError("");
    }

    function openCreateForm() {
        resetForm();

        setImportDate(
            new Date().toISOString().split("T")[0]
        );

        setShowForm(true);
    }

    async function openEditForm(receipt: ImportReceipt) {
        try {
            setError("");

            const receiptDetails =
                await getImportReceiptDetails(receipt.id);

            setEditingId(receipt.id);
            setPublisherId(String(receipt.publisher.id));
            setImportDate(receipt.importDate);

            setDetails(
                receiptDetails.map((detail: any) => ({
                    type: "EXISTING",
                    bookId: String(detail.book.id),
                    quantity: String(detail.quantity),
                    unitPrice: String(detail.unitPrice),
                    newBook: createEmptyNewBook(),
                }))
            );

            setShowForm(true);
        } catch (error: any) {
            setError(error.message || "Failed to load receipt");
        }
    }

    function addDetailRow() {
        setDetails([
            ...details,
            createEmptyDetail(),
        ]);
    }

    function removeDetailRow(index: number) {
        if (details.length === 1) {
            return;
        }

        setDetails(
            details.filter(
                (_, currentIndex) => currentIndex !== index
            )
        );
    }

    function updateDetail(
        index: number,
        field: keyof FormDetail,
        value: string
    ) {
        setDetails(
            details.map((detail, currentIndex) =>
                currentIndex === index
                    ? {
                        ...detail,
                        [field]: value,
                    }
                    : detail
            )
        );
    }

    function updateNewBook(
        index: number,
        field: keyof NewBookForm,
        value: string
    ) {
        setDetails(
            details.map((detail, currentIndex) => {
                if (currentIndex !== index) {
                    return detail;
                }

                return {
                    ...detail,
                    newBook: {
                        ...detail.newBook,
                        [field]: value,
                    },
                };
            })
        );
    }

    function updateNewBookAuthors(
        index: number,
        authorId: string
    ) {
        setDetails(
            details.map((detail, currentIndex) => {
                if (currentIndex !== index) {
                    return detail;
                }

                const currentIds = detail.newBook.authorIds;

                const nextIds = currentIds.includes(authorId)
                    ? currentIds.filter((id) => id !== authorId)
                    : [...currentIds, authorId];

                return {
                    ...detail,
                    newBook: {
                        ...detail.newBook,
                        authorIds: nextIds,
                    },
                };
            })
        );
    }

    function updateNewBookCategories(
        index: number,
        categoryId: string
    ) {
        setDetails(
            details.map((detail, currentIndex) => {
                if (currentIndex !== index) {
                    return detail;
                }

                const currentIds = detail.newBook.categoryIds;

                const nextIds = currentIds.includes(categoryId)
                    ? currentIds.filter((id) => id !== categoryId)
                    : [...currentIds, categoryId];

                let primaryCategoryId =
                    detail.newBook.primaryCategoryId;

                if (!nextIds.includes(primaryCategoryId)) {
                    primaryCategoryId = "";
                }

                return {
                    ...detail,
                    newBook: {
                        ...detail.newBook,
                        categoryIds: nextIds,
                        primaryCategoryId,
                    },
                };
            })
        );
    }

    function calculateTotal() {
        return details.reduce((total, detail) => {
            const quantity = Number(detail.quantity) || 0;
            const unitPrice = Number(detail.unitPrice) || 0;

            return total + quantity * unitPrice;
        }, 0);
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError("");

        if (!publisherId) {
            setError("Please select a publisher");
            return;
        }

        if (!importDate) {
            setError("Please select an import date");
            return;
        }

        if (details.length === 0) {
            setError("Import receipt must contain at least one book");
            return;
        }

        for (const detail of details) {
            if (!detail.quantity || Number(detail.quantity) <= 0) {
                setError("Quantity must be greater than 0");
                return;
            }

            if (
                detail.unitPrice === "" ||
                Number(detail.unitPrice) < 0
            ) {
                setError("Unit price cannot be negative");
                return;
            }

            if (detail.type === "EXISTING") {
                if (!detail.bookId) {
                    setError("Please select a book for every existing book row");
                    return;
                }
            }

            if (detail.type === "NEW") {
                const newBook = detail.newBook;

                if (!newBook.title.trim()) {
                    setError("Book title is required");
                    return;
                }

                if (!newBook.isbn.trim()) {
                    setError("ISBN is required");
                    return;
                }

                if (
                    newBook.price === "" ||
                    Number(newBook.price) < 0
                ) {
                    setError("Book price cannot be negative");
                    return;
                }

                if (newBook.categoryIds.length === 0) {
                    setError("Please select at least one category");
                    return;
                }

                if (!newBook.primaryCategoryId) {
                    setError("Please select a primary category");
                    return;
                }

                if (
                    !newBook.categoryIds.includes(
                        newBook.primaryCategoryId
                    )
                ) {
                    setError(
                        "Primary category must be one of the selected categories"
                    );
                    return;
                }
            }
        }

        try {
            setSaving(true);

            if (editingId) {
                const requestData = {
                    publisherId: Number(publisherId),
                    importDate,
                    details: details.map((detail) => ({
                        bookId: Number(detail.bookId),
                        quantity: Number(detail.quantity),
                        unitPrice: Number(detail.unitPrice),
                    })),
                };

                await updateImportReceipt(
                    editingId,
                    requestData
                );
            } else {
                const requestData = {
                    publisherId: Number(publisherId),
                    importDate,
                    details: details.map((detail) => {
                        if (detail.type === "EXISTING") {
                            return {
                                bookId: Number(detail.bookId),
                                quantity: Number(detail.quantity),
                                unitPrice: Number(detail.unitPrice),
                            };
                        }

                        const newBook = detail.newBook;

                        return {
                            newBook: {
                                title: newBook.title.trim(),
                                isbn: newBook.isbn.trim(),
                                publishYear:
                                    newBook.publishYear === ""
                                        ? undefined
                                        : Number(newBook.publishYear),
                                description:
                                    newBook.description.trim() || undefined,
                                price: Number(newBook.price),
                                authorIds:
                                    newBook.authorIds.length > 0
                                        ? newBook.authorIds.map(Number)
                                        : undefined,
                                categoryIds:
                                    newBook.categoryIds.map(Number),
                                primaryCategoryId:
                                    Number(newBook.primaryCategoryId),
                            },
                            quantity: Number(detail.quantity),
                            unitPrice: Number(detail.unitPrice),
                        };
                    }),
                };

                await createImportReceipt(requestData);
            }

            await loadData();

            setShowForm(false);
            resetForm();
        } catch (error: any) {
            setError(
                error.message ||
                "Failed to save import receipt"
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleActivate(id: number) {
        if (
            !window.confirm(
                "Are you sure you want to activate this import receipt?"
            )
        ) {
            return;
        }

        try {
            setError("");
            await activateImportReceipt(id);
            await loadData();
        } catch (error: any) {
            setError(
                error.message ||
                "Failed to activate import receipt"
            );
        }
    }

    async function handleDeactivate(id: number) {
        if (
            !window.confirm(
                "Are you sure you want to deactivate this import receipt?"
            )
        ) {
            return;
        }

        try {
            setError("");
            await deactivateImportReceipt(id);
            await loadData();
        } catch (error: any) {
            setError(
                error.message ||
                "Failed to deactivate import receipt"
            );
        }
    }

    const filteredReceipts = useMemo(() => {
        return receipts.filter((receipt) => {
            const keyword = search.trim().toLowerCase();

            const matchesSearch =
                !keyword ||
                receipt.receiptCode
                    .toLowerCase()
                    .includes(keyword) ||
                receipt.publisher.name
                    .toLowerCase()
                    .includes(keyword);

            const matchesStatus =
                statusFilter === "ALL" ||
                receipt.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [receipts, search, statusFilter]);

    const totalReceipts = receipts.length;

    const activeReceipts = receipts.filter(
        (receipt) => receipt.status === "COMPLETED"
    ).length;

    const inactiveReceipts = receipts.filter(
        (receipt) => receipt.status === "INACTIVE"
    ).length;

    function formatCurrency(value: number) {
        return new Intl.NumberFormat("vi-VN").format(value);
    }

    return (
        <div className="min-h-screen w-full bg-[#f7f8fa] px-4 py-6 font-sans text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">

                {/* Page Header */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-slate-900">
                            Import Receipts
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                            Manage incoming book shipments, publishers, and procurement records.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[0.98]"
                    >
                        <svg
                            className="h-[17px] w-[17px]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                        </svg>

                        Create Receipt
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <div className="flex items-center gap-2.5">
                            <svg
                                className="h-4 w-4 shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 8v4" />
                                <path d="M12 16h.01" />
                            </svg>

                            <span>{error}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="shrink-0 text-xs font-medium text-red-700 transition hover:text-red-900"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                        <p className="text-xs font-medium uppercase tracking-[0.06em] text-slate-400">
                            Total Receipts
                        </p>

                        <div className="mt-2 flex items-end justify-between">
                            <p className="text-2xl font-semibold tracking-tight text-slate-900">
                                {totalReceipts}
                            </p>

                            <span className="text-xs text-slate-400">
                                All records
                            </span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                        <p className="text-xs font-medium uppercase tracking-[0.06em] text-slate-400">
                            Active Receipts
                        </p>

                        <div className="mt-2 flex items-end justify-between">
                            <p className="text-2xl font-semibold tracking-tight text-slate-900">
                                {activeReceipts}
                            </p>

                            <span className="text-xs text-emerald-600">
                                Completed
                            </span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                        <p className="text-xs font-medium uppercase tracking-[0.06em] text-slate-400">
                            Inactive Receipts
                        </p>

                        <div className="mt-2 flex items-end justify-between">
                            <p className="text-2xl font-semibold tracking-tight text-slate-900">
                                {inactiveReceipts}
                            </p>

                            <span className="text-xs text-slate-400">
                                Inactive
                            </span>
                        </div>
                    </div>

                </div>

                {/* Main Content */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">

                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="relative w-full lg:max-w-md">
                            <svg
                                className="pointer-events-none absolute left-3 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400"
                                viewBox="0 0 24 24"
                                fill="none"
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
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by receipt code or publisher..."
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="hidden text-xs font-medium text-slate-400 sm:block">
                                Filter by status
                            </span>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                                className="h-10 min-w-[160px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                            >
                                <option value="ALL">
                                    All Statuses
                                </option>

                                <option value="COMPLETED">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#183b63]" />

                            <p className="mt-3 text-sm text-slate-500">
                                Loading import receipts...
                            </p>
                        </div>
                    ) : filteredReceipts.length === 0 ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <path d="M14 2v6h6" />
                                    <path d="M8 13h8" />
                                    <path d="M8 17h5" />
                                </svg>
                            </div>

                            <p className="mt-4 text-sm font-medium text-slate-900">
                                No Import Receipts Found
                            </p>

                            <p className="mt-1 max-w-sm text-sm text-slate-400">
                                Try adjusting your search or create a new import receipt.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[950px] border-collapse text-left">
                                <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/70">
                                    <th className="px-5 py-3.5 text-xs font-medium text-slate-500">
                                        Receipt Code
                                    </th>

                                    <th className="px-5 py-3.5 text-xs font-medium text-slate-500">
                                        Publisher
                                    </th>

                                    <th className="px-5 py-3.5 text-xs font-medium text-slate-500">
                                        Import Date
                                    </th>

                                    <th className="px-5 py-3.5 text-xs font-medium text-slate-500">
                                        Total Amount
                                    </th>

                                    <th className="px-5 py-3.5 text-xs font-medium text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-3.5 text-right text-xs font-medium text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {filteredReceipts.map((receipt) => (
                                    <tr
                                        key={receipt.id}
                                        className="group transition-colors hover:bg-slate-50/60"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-sm font-medium text-[#183b63]">
                                                {receipt.receiptCode}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="text-sm font-medium text-slate-800">
                                                {receipt.publisher.name}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="text-sm text-slate-500">
                                                {receipt.importDate}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="text-sm font-medium text-slate-800">
                                                {formatCurrency(
                                                    receipt.totalAmount
                                                )}
                                            </span>

                                            <span className="ml-1 text-xs text-slate-400">
                                                VND
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            {receipt.status === "COMPLETED" ? (
                                                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(
                                                            `/import-receipts/${receipt.id}`
                                                        )
                                                    }
                                                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#183b63]"
                                                >
                                                    <svg
                                                        className="h-3.5 w-3.5"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="2.5"
                                                        />
                                                    </svg>

                                                    Detail
                                                </button>

                                                {receipt.status === "COMPLETED" && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditForm(
                                                                receipt
                                                            )
                                                        }
                                                        className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#183b63]"
                                                    >
                                                        Edit
                                                    </button>
                                                )}

                                                {receipt.status === "COMPLETED" ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeactivate(
                                                                receipt.id
                                                            )
                                                        }
                                                        className="inline-flex h-8 items-center rounded-md border border-red-200 bg-white px-3 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                    >
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleActivate(
                                                                receipt.id
                                                            )
                                                        }
                                                        className="inline-flex h-8 items-center rounded-md border border-emerald-200 bg-white px-3 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Create / Edit Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 py-6 backdrop-blur-[2px]">

                        <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">

                            {/* Modal Header */}
                            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">
                                <div>
                                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                                        {editingId
                                            ? "Edit Import Receipt"
                                            : "Create Import Receipt"}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {editingId
                                            ? "Update the import date, quantities, and unit prices."
                                            : "Enter the publisher, import date, and book details."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                    aria-label="Close"
                                >
                                    <svg
                                        className="h-[18px] w-[18px]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                    >
                                        <path d="M6 6l12 12" />
                                        <path d="M18 6L6 18" />
                                    </svg>
                                </button>
                            </div>

                            {/* Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="overflow-y-auto"
                            >
                                <div className="space-y-7 px-6 py-6">

                                    {/* Receipt Information */}
                                    <div>
                                        <div className="mb-4">
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                Receipt Information
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Basic information about this import receipt.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                            <div>
                                                <label className="mb-2 block text-xs font-medium text-slate-700">
                                                    Publisher
                                                    <span className="ml-1 text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <select
                                                    value={publisherId}
                                                    onChange={(event) =>
                                                        setPublisherId(
                                                            event.target.value
                                                        )
                                                    }
                                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                                                >
                                                    <option value="">
                                                        Select a publisher...
                                                    </option>

                                                    {publishers
                                                        .filter(
                                                            (publisher) =>
                                                                publisher.status ===
                                                                "ACTIVE"
                                                        )
                                                        .map((publisher) => (
                                                            <option
                                                                key={publisher.id}
                                                                value={publisher.id}
                                                            >
                                                                {publisher.name}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-medium text-slate-700">
                                                    Import Date
                                                    <span className="ml-1 text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    type="date"
                                                    value={importDate}
                                                    onChange={(event) =>
                                                        setImportDate(
                                                            event.target.value
                                                        )
                                                    }
                                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    {/* Book Details */}
                                    <div>
                                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900">
                                                    Book Details
                                                </h3>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    Add existing books or create new books as part of this receipt.
                                                </p>
                                            </div>

                                            {!editingId && (
                                                <button
                                                    type="button"
                                                    onClick={addDetailRow}
                                                    className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#183b63] sm:self-auto"
                                                >
                                                    <svg
                                                        className="h-3.5 w-3.5"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.7"
                                                        strokeLinecap="round"
                                                    >
                                                        <path d="M12 5v14" />
                                                        <path d="M5 12h14" />
                                                    </svg>

                                                    Add Book
                                                </button>
                                            )}

                                        </div>

                                        <div className="space-y-4">

                                            {details.map(
                                                (detail, index) => {
                                                    const quantity =
                                                        Number(
                                                            detail.quantity
                                                        ) || 0;

                                                    const unitPrice =
                                                        Number(
                                                            detail.unitPrice
                                                        ) || 0;

                                                    const amount =
                                                        quantity *
                                                        unitPrice;

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                                                        >

                                                            {/* Row Header */}
                                                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">

                                                                <div className="flex items-center gap-3">
                                                                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                                                        {index + 1}
                                                                    </span>

                                                                    <div>
                                                                        <p className="text-xs font-semibold text-slate-800">
                                                                            Book Item
                                                                        </p>

                                                                        <p className="text-[11px] text-slate-400">
                                                                            {detail.type ===
                                                                            "EXISTING"
                                                                                ? "Existing book"
                                                                                : "New book"}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {!editingId && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            details.length ===
                                                                            1
                                                                        }
                                                                        onClick={() =>
                                                                            removeDetailRow(
                                                                                index
                                                                            )
                                                                        }
                                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30"
                                                                        title="Remove item"
                                                                        aria-label="Remove item"
                                                                    >
                                                                        <svg
                                                                            className="h-4 w-4"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="1.6"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        >
                                                                            <path d="M4 7h16" />
                                                                            <path d="M10 11v6" />
                                                                            <path d="M14 11v6" />
                                                                            <path d="M5 7l1 14h10l1-14" />
                                                                            <path d="M9 7V4h6v3" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="space-y-5 p-4">

                                                                {/* Type */}
                                                                {!editingId && (
                                                                    <div>
                                                                        <label className="mb-2 block text-xs font-medium text-slate-700">
                                                                            Book Type
                                                                        </label>

                                                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    updateDetail(
                                                                                        index,
                                                                                        "type",
                                                                                        "EXISTING"
                                                                                    )
                                                                                }
                                                                                className={`rounded-lg border px-3 py-2.5 text-left transition ${
                                                                                    detail.type ===
                                                                                    "EXISTING"
                                                                                        ? "border-[#183b63] bg-[#183b63]/5 ring-1 ring-[#183b63]/10"
                                                                                        : "border-slate-200 bg-white hover:border-slate-300"
                                                                                }`}
                                                                            >
                                                                                <p className="text-xs font-semibold text-slate-800">
                                                                                    Existing Book
                                                                                </p>

                                                                                <p className="mt-0.5 text-[11px] text-slate-400">
                                                                                    Select a book already in the catalog.
                                                                                </p>
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    updateDetail(
                                                                                        index,
                                                                                        "type",
                                                                                        "NEW"
                                                                                    )
                                                                                }
                                                                                className={`rounded-lg border px-3 py-2.5 text-left transition ${
                                                                                    detail.type ===
                                                                                    "NEW"
                                                                                        ? "border-[#183b63] bg-[#183b63]/5 ring-1 ring-[#183b63]/10"
                                                                                        : "border-slate-200 bg-white hover:border-slate-300"
                                                                                }`}
                                                                            >
                                                                                <p className="text-xs font-semibold text-slate-800">
                                                                                    New Book
                                                                                </p>

                                                                                <p className="mt-0.5 text-[11px] text-slate-400">
                                                                                    Create a new catalog book.
                                                                                </p>
                                                                            </button>

                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Existing Book */}
                                                                {detail.type ===
                                                                    "EXISTING" && (
                                                                        <div>
                                                                            <label className="mb-2 block text-xs font-medium text-slate-700">
                                                                                Book
                                                                                <span className="ml-1 text-red-500">
                                                                                *
                                                                            </span>
                                                                            </label>

                                                                            <select
                                                                                value={
                                                                                    detail.bookId
                                                                                }
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    updateDetail(
                                                                                        index,
                                                                                        "bookId",
                                                                                        event
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                                                                            >
                                                                                <option value="">
                                                                                    Select a book...
                                                                                </option>

                                                                                {books
                                                                                    .filter(
                                                                                        (
                                                                                            book
                                                                                        ) =>
                                                                                            book.status ===
                                                                                            "ACTIVE"
                                                                                    )
                                                                                    .map(
                                                                                        (
                                                                                            book
                                                                                        ) => (
                                                                                            <option
                                                                                                key={
                                                                                                    book.id
                                                                                                }
                                                                                                value={
                                                                                                    book.id
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    book.title
                                                                                                }{" "}
                                                                                                (ISBN:{" "}
                                                                                                {
                                                                                                    book.isbn
                                                                                                }
                                                                                                )
                                                                                            </option>
                                                                                        )
                                                                                    )}
                                                                            </select>
                                                                        </div>
                                                                    )}

                                                                {/* New Book */}
                                                                {detail.type ===
                                                                    "NEW" && (
                                                                        <div className="space-y-5 rounded-lg border border-slate-200 bg-slate-50/60 p-4">

                                                                            <div>
                                                                                <h4 className="text-xs font-semibold text-slate-800">
                                                                                    New Book Information
                                                                                </h4>

                                                                                <p className="mt-1 text-[11px] text-slate-400">
                                                                                    Publisher is inherited from the import receipt.
                                                                                </p>
                                                                            </div>

                                                                            {/* Basic Information */}
                                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                                                                <div className="md:col-span-2">
                                                                                    <label className="mb-2 block text-xs font-medium text-slate-700">
                                                                                        Title
                                                                                        <span className="ml-1 text-red-500">
                                                                                        *
                                                                                    </span>
                                                                                    </label>

                                                                                    <input
                                                                                        type="text"
                                                                                        value={
                                                                                            detail
                                                                                                .newBook
                                                                                                .title
                                                                                        }
                                                                                        onChange={(
                                                                                            event
                                                                                        ) =>
                                                                                            updateNewBook(
                                                                                                index,
                                                                                                "title",
                                                                                                event
                                                                                                    .target
                                                                                                    .value
                                                                                            )
                                                                                        }
                                                                                        placeholder="Enter book title..."
                                                                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                                                                                    />
                                                                                </div>

                                                                                <div>
                                                                                    <label className="mb-2 block text-xs font-medium text-slate-700">
                                                                                        ISBN
                                                                                        <span className="ml-1 text-red-500">
                                                                                        *
                                                                                    </span>
                                                                                    </label>

                                                                                    <input
                                                                                        type="text"
                                                                                        value={
                                                                                            detail
                                                                                                .newBook
                                                                                                .isbn
                                                                                        }
                                                                                        onChange={(
                                                                                            event
                                                                                        ) =>
                                                                                            updateNewBook(
                                                                                                index,
                                                                                                "isbn",
                                                                                                event
                                                                                                    .target
                                                                                                    .value
                                                                                            )
                                                                                        }
                                                                                        placeholder="Enter ISBN..."
                                                                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                                                                                    />
                                                                                </div>

                                                                                <div>
                                                                                    <label className="mb-2 block text-xs font-medium text-slate-700">
                                                                                        Publish Year
                                                                                    </label>

                                                                                    <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        value={
                                                                                            detail
                                                                                                .newBook
                                                                                                .publishYear
                                                                                        }
                                                                                        onChange={(
                                                                                            event
                                                                                        ) =>
                                                                                            updateNewBook(
                                                                                                index,
                                                                                                "publishYear",
                                                                                                event
                                                                                                    .target
                                                                                                    .value
                                                                                            )
                                                                                        }
                                                                                        placeholder="e.g. 2024"
                                                                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                                                                                    />
                                                                                </div>

                                                                                <div>
                                                                                    <label className="mb-2 block text-xs font-medium text-slate-700">
                                                                                        Book Price
                                                                                        <span className="ml-1 text-red-500">
                                                                                        *
                                                                                    </span>
                                                                                    </label>

                                                                                    <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        value={
                                                                                            detail
                                                                                                .newBook
                                                                                                .price
                                                                                        }
                                                                                        onChange={(
                                                                                            event
                                                                                        ) =>
                                                                                            updateNewBook(
                                                                                                index,
                                                                                                "price",
                                                                                                event
                                                                                                    .target
                                                                                                    .value
                                                                                            )
                                                                                        }
                                                                                        placeholder="0"
                                                                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                                                                                    />
                                                                                </div>

                                                                                <div className="md:col-span-2">
                                                                                    <label className="mb-2 block text-xs font-medium text-slate-700">
                                                                                        Description
                                                                                    </label>

                                                                                    <textarea
                                                                                        value={
                                                                                            detail
                                                                                                .newBook
                                                                                                .description
                                                                                        }
                                                                                        onChange={(
                                                                                            event
                                                                                        ) =>
                                                                                            updateNewBook(
                                                                                                index,
                                                                                                "description",
                                                                                                event
                                                                                                    .target
                                                                                                    .value
                                                                                            )
                                                                                        }
                                                                                        rows={3}
                                                                                        placeholder="Enter book description..."
                                                                                        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                                                                                    />
                                                                                </div>

                                                                            </div>

                                                                            {/* Authors */}
                                                                            <div>
                                                                                <label className="mb-2 block text-xs font-medium text-slate-700">
                                                                                    Authors
                                                                                </label>

                                                                                <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">

                                                                                    {authors.filter(
                                                                                        (
                                                                                            author
                                                                                        ) =>
                                                                                            author.status ===
                                                                                            undefined ||
                                                                                            author.status ===
                                                                                            "ACTIVE"
                                                                                    ).length ===
                                                                                    0 ? (
                                                                                        <p className="px-2 py-2 text-xs text-slate-400">
                                                                                            No active authors available.
                                                                                        </p>
                                                                                    ) : (
                                                                                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">

                                                                                            {authors
                                                                                                .filter(
                                                                                                    (
                                                                                                        author
                                                                                                    ) =>
                                                                                                        author.status ===
                                                                                                        undefined ||
                                                                                                        author.status ===
                                                                                                        "ACTIVE"
                                                                                                )
                                                                                                .map(
                                                                                                    (
                                                                                                        author
                                                                                                    ) => (
                                                                                                        <label
                                                                                                            key={
                                                                                                                author.id
                                                                                                            }
                                                                                                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                                                                                        >
                                                                                                            <input
                                                                                                                type="checkbox"
                                                                                                                checked={detail.newBook.authorIds.includes(
                                                                                                                    String(
                                                                                                                        author.id
                                                                                                                    )
                                                                                                                )}
                                                                                                                onChange={() =>
                                                                                                                    updateNewBookAuthors(
                                                                                                                        index,
                                                                                                                        String(
                                                                                                                            author.id
                                                                                                                        )
                                                                                                                    )
                                                                                                                }
                                                                                                                className="h-3.5 w-3.5 rounded border-slate-300"
                                                                                                            />

                                                                                                            <span>
                                                                                                            {
                                                                                                                author.name
                                                                                                            }
                                                                                                        </span>
                                                                                                        </label>
                                                                                                    )
                                                                                                )}

                                                                                        </div>
                                                                                    )}

                                                                                </div>
                                                                            </div>

                                                                            {/* Categories */}
                                                                            <div>
                                                                                <label className="mb-2 block text-xs font-medium text-slate-700">
                                                                                    Categories
                                                                                    <span className="ml-1 text-red-500">
                                                                                    *
                                                                                </span>
                                                                                </label>

                                                                                <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">

                                                                                    {categories.filter(
                                                                                        (
                                                                                            category
                                                                                        ) =>
                                                                                            category.status ===
                                                                                            undefined ||
                                                                                            category.status ===
                                                                                            "ACTIVE"
                                                                                    ).length ===
                                                                                    0 ? (
                                                                                        <p className="px-2 py-2 text-xs text-slate-400">
                                                                                            No active categories available.
                                                                                        </p>
                                                                                    ) : (
                                                                                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">

                                                                                            {categories
                                                                                                .filter(
                                                                                                    (
                                                                                                        category
                                                                                                    ) =>
                                                                                                        category.status ===
                                                                                                        undefined ||
                                                                                                        category.status ===
                                                                                                        "ACTIVE"
                                                                                                )
                                                                                                .map(
                                                                                                    (
                                                                                                        category
                                                                                                    ) => (
                                                                                                        <label
                                                                                                            key={
                                                                                                                category.id
                                                                                                            }
                                                                                                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                                                                                        >
                                                                                                            <input
                                                                                                                type="checkbox"
                                                                                                                checked={detail.newBook.categoryIds.includes(
                                                                                                                    String(
                                                                                                                        category.id
                                                                                                                    )
                                                                                                                )}
                                                                                                                onChange={() =>
                                                                                                                    updateNewBookCategories(
                                                                                                                        index,
                                                                                                                        String(
                                                                                                                            category.id
                                                                                                                        )
                                                                                                                    )
                                                                                                                }
                                                                                                                className="h-3.5 w-3.5 rounded border-slate-300"
                                                                                                            />

                                                                                                            <span>
                                                                                                            {
                                                                                                                category.name
                                                                                                            }
                                                                                                        </span>
                                                                                                        </label>
                                                                                                    )
                                                                                                )}

                                                                                        </div>
                                                                                    )}

                                                                                </div>
                                                                            </div>

                                                                            {/* Primary Category */}
                                                                            <div>
                                                                                <label className="mb-2 block text-xs font-medium text-slate-700">
                                                                                    Primary Category
                                                                                    <span className="ml-1 text-red-500">
                                                                                    *
                                                                                </span>
                                                                                </label>

                                                                                <select
                                                                                    value={
                                                                                        detail
                                                                                            .newBook
                                                                                            .primaryCategoryId
                                                                                    }
                                                                                    onChange={(
                                                                                        event
                                                                                    ) =>
                                                                                        updateNewBook(
                                                                                            index,
                                                                                            "primaryCategoryId",
                                                                                            event
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                                                                                >
                                                                                    <option value="">
                                                                                        Select primary category...
                                                                                    </option>

                                                                                    {categories
                                                                                        .filter(
                                                                                            (
                                                                                                category
                                                                                            ) =>
                                                                                                category.status ===
                                                                                                undefined ||
                                                                                                category.status ===
                                                                                                "ACTIVE"
                                                                                        )
                                                                                        .filter(
                                                                                            (
                                                                                                category
                                                                                            ) =>
                                                                                                detail.newBook.categoryIds.includes(
                                                                                                    String(
                                                                                                        category.id
                                                                                                    )
                                                                                                )
                                                                                        )
                                                                                        .map(
                                                                                            (
                                                                                                category
                                                                                            ) => (
                                                                                                <option
                                                                                                    key={
                                                                                                        category.id
                                                                                                    }
                                                                                                    value={
                                                                                                        category.id
                                                                                                    }
                                                                                                >
                                                                                                    {
                                                                                                        category.name
                                                                                                    }
                                                                                                </option>
                                                                                            )
                                                                                        )}
                                                                                </select>
                                                                            </div>

                                                                        </div>
                                                                    )}

                                                                {/* Quantity / Unit Price */}
                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                                                                    <div>
                                                                        <label className="mb-2 block text-xs font-medium text-slate-700">
                                                                            Quantity
                                                                            <span className="ml-1 text-red-500">
                                                                                *
                                                                            </span>
                                                                        </label>

                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            placeholder="1"
                                                                            value={
                                                                                detail.quantity
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                updateDetail(
                                                                                    index,
                                                                                    "quantity",
                                                                                    event
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="mb-2 block text-xs font-medium text-slate-700">
                                                                            Unit Price
                                                                            <span className="ml-1 text-red-500">
                                                                                *
                                                                            </span>
                                                                        </label>

                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            placeholder="0"
                                                                            value={
                                                                                detail.unitPrice
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                updateDetail(
                                                                                    index,
                                                                                    "unitPrice",
                                                                                    event
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#183b63] focus:ring-2 focus:ring-[#183b63]/10"
                                                                        />
                                                                    </div>

                                                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">

                                                                        <p className="text-[11px] font-medium text-slate-400">
                                                                            Subtotal
                                                                        </p>

                                                                        <p className="mt-1 text-sm font-semibold text-slate-800">
                                                                            {formatCurrency(
                                                                                amount
                                                                            )}{" "}
                                                                            <span className="text-[11px] font-medium text-slate-400">
                                                                                VND
                                                                            </span>
                                                                        </p>

                                                                    </div>

                                                                </div>

                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-end">
                                        <div className="min-w-[260px] rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">

                                            <div className="flex items-center justify-between gap-6">
                                                <span className="text-xs font-medium text-slate-500">
                                                    Total Amount
                                                </span>

                                                <span className="text-lg font-semibold tracking-tight text-slate-900">
                                                    {formatCurrency(
                                                        calculateTotal()
                                                    )}{" "}
                                                    <span className="text-xs font-medium text-slate-400">
                                                        VND
                                                    </span>
                                                </span>
                                            </div>

                                        </div>
                                    </div>

                                </div>

                                {/* Footer */}
                                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/60 px-6 py-4 sm:flex-row sm:justify-end">

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            resetForm();
                                        }}
                                        className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-black px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20 disabled:cursor-not-allowed disabled:bg-black disabled:opacity-50"
                                    >
                                        {saving && (
                                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        )}

                                        {saving
                                            ? "Saving..."
                                            : editingId
                                                ? "Update Receipt"
                                                : "Create Receipt"}
                                    </button>

                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}