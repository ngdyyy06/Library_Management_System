"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getBooks,
    getAuthors,
    updateBook,
    activateBook,
    deactivateBook,
    getPublishers,
    getCategories,
} from "../lib/api";

export default function BooksPage() {
    const [books, setBooks] = useState<any[]>([]);
    const [authors, setAuthors] = useState<any[]>([]);
    const [publishers, setPublishers] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        description: "",
        authorIds: [] as number[],
        authorNames: "",
        categoryIds: [] as number[],
        primaryCategoryId: "",
    });

    // =========================================================
    // LOAD DATA
    // =========================================================

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
                loadCategories(),
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

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data || []);
        } catch (error) {
            console.error("Failed to load categories:", error);
        }
    };

    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {
        setFormData({
            title: "",
            isbn: "",
            publisher: "",
            publishYear: "",
            price: "",
            description: "",
            authorIds: [],
            authorNames: "",
            categoryIds: [],
            primaryCategoryId: "",
        });
    };

    // =========================================================
    // CATEGORY HELPERS
    // =========================================================

    const getSelectedPrimaryCategory = () => {
        if (!formData.primaryCategoryId) {
            return null;
        }

        return (
            categories.find(
                (category) =>
                    Number(category.id) ===
                    Number(formData.primaryCategoryId)
            ) || null
        );
    };

    const selectedPrimaryCategory =
        getSelectedPrimaryCategory();

    const selectedShelf =
        selectedPrimaryCategory?.defaultShelf || null;

    const handleCategoryChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedIds = Array.from(
            event.target.selectedOptions
        ).map((option) => Number(option.value));

        setFormData((prev) => {
            const primaryStillSelected =
                prev.primaryCategoryId &&
                selectedIds.includes(
                    Number(prev.primaryCategoryId)
                );

            return {
                ...prev,
                categoryIds: selectedIds,
                primaryCategoryId:
                    primaryStillSelected
                        ? prev.primaryCategoryId
                        : "",
            };
        });
    };

    const handlePrimaryCategoryChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const primaryCategoryId = event.target.value;

        setFormData((prev) => ({
            ...prev,
            primaryCategoryId,
        }));
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

        const selectedCategoryIds =
            book.categories?.map(
                (category: any) =>
                    Number(category.id)
            ) || [];

        const primaryCategoryId =
            book.primaryCategory?.id
                ? String(book.primaryCategory.id)
                : "";

        setFormData({
            title: book.title || "",

            isbn: book.isbn || "",

            publisher: book.publisher?.id
                ? String(book.publisher.id)
                : "",

            publishYear:
                book.publishYear !== undefined &&
                book.publishYear !== null
                    ? String(book.publishYear)
                    : "",

            price:
                book.price !== undefined &&
                book.price !== null
                    ? String(book.price)
                    : "",

            description: book.description || "",

            authorIds: selectedAuthorIds,

            authorNames: "",

            categoryIds: selectedCategoryIds,

            primaryCategoryId,
        });
    };

    const handleUpdateBook = async () => {
        if (!editingBook || !formData.title.trim()) {
            alert("Please enter a book title!");
            return;
        }

        if (!formData.isbn.trim()) {
            alert("Please enter an ISBN code!");
            return;
        }

        if (formData.categoryIds.length === 0) {
            alert("Please select at least one category!");
            return;
        }

        if (!formData.primaryCategoryId) {
            alert("Please select a primary category!");
            return;
        }

        const primaryCategory =
            categories.find(
                (category) =>
                    Number(category.id) ===
                    Number(formData.primaryCategoryId)
            );

        if (!primaryCategory) {
            alert("Primary category not found!");
            return;
        }

        if (!primaryCategory.defaultShelf) {
            alert(
                "The selected primary category does not have a default shelf."
            );
            return;
        }

        try {
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

                    description:
                        formData.description.trim(),

                    authorIds: formData.authorIds,

                    authorNames,

                    categoryIds: formData.categoryIds,

                    primaryCategoryId: Number(
                        formData.primaryCategoryId
                    ),
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

            await Promise.all([
                loadBooks(),
                loadAuthors(),
                loadCategories(),
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

            const categoryNames =
                b.categories
                    ?.map(
                        (category: any) =>
                            category.name || ""
                    )
                    .join(" ")
                    .toLowerCase() || "";

            const primaryCategoryName =
                b.primaryCategory?.name?.toLowerCase() ||
                "";

            const shelfName =
                b.shelf?.name?.toLowerCase() || "";

            const shelfCode =
                b.shelf?.shelfCode?.toLowerCase() || "";

            const matchesSearch =
                (b.title || "")
                    .toLowerCase()
                    .includes(query) ||
                (b.isbn || "")
                    .toLowerCase()
                    .includes(query) ||
                (b.publisher?.name || "")
                    .toLowerCase()
                    .includes(query) ||
                categoryNames.includes(query) ||
                primaryCategoryName.includes(query) ||
                shelfName.includes(query) ||
                shelfCode.includes(query);

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
    }, [
        books,
        searchTerm,
        statusFilter,
    ]);

    // =========================================================
    // METRICS
    // =========================================================

    const totalTitles = books.length;

    const activeBooksCount =
        books.filter(
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
                acc +
                (curr.availableQuantity || 0),
            0
        );

    return (
        <div className="min-h-screen w-full bg-[#f7f8fa] p-5 font-sans sm:p-6 lg:p-8">
            <div className="w-full space-y-6">

                {/* ========================================================= */}
                {/* HEADER                                                     */}
                {/* ========================================================= */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                            <span>Library</span>

                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                    d="m9 18 6-6-6-6"
                                />
                            </svg>

                            <span className="text-slate-500">
                                Books
                            </span>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                            Books
                        </h1>

                        <p className="mt-1 max-w-3xl text-sm text-slate-500">
                            Manage book titles, publications,
                            authors, categories, shelves, and
                            catalog information. Inventory is
                            added through Import Receipts.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-500 shadow-sm sm:self-center">
                        <svg
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.7"
                                d="M12 9v4m0 4h.01M10.29 3.86 2.82 17a2 2 0 0 0 1.74 3h14.88a2 2 0 0 0 1.74-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                            />
                        </svg>

                        Inventory managed via Import Receipts
                    </div>
                </div>

                {/* ========================================================= */}
                {/* METRIC CARDS                                               */}
                {/* ========================================================= */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* Total Titles */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Total Titles
                            </p>

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.6"
                                        d="M6 4.5A2.5 2.5 0 0 1 8.5 2H20v17H8.5A2.5 2.5 0 0 0 6 21.5m0-17A2.5 2.5 0 0 0 3.5 7v12A2.5 2.5 0 0 0 6 21.5"
                                    />
                                </svg>
                            </div>
                        </div>

                        <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                            {totalTitles}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Unique catalog entries
                        </p>
                    </div>

                    {/* Available Copies */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Available Copies
                            </p>

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.7"
                                        d="m5 12 4 4L19 6"
                                    />
                                </svg>
                            </div>
                        </div>

                        <p className="mt-4 text-3xl font-semibold tracking-tight text-emerald-600">
                            {totalAvailable}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Ready on shelves
                        </p>
                    </div>

                    {/* Active Titles */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Active Titles
                            </p>

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-600">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.7"
                                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <p className="mt-4 text-3xl font-semibold tracking-tight text-sky-600">
                            {activeBooksCount}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Currently active
                        </p>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* BOOK TABLE                                                 */}
                {/* ========================================================= */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Search / Filter */}

                    <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Books Catalog
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Showing {filteredBooks.length} of{" "}
                                {totalTitles} titles
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">

                            {/* Search */}

                            <div className="relative w-full sm:w-72">
                                <svg
                                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.7"
                                        d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                                    />
                                </svg>

                                <input
                                    type="text"
                                    placeholder="Search books..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(
                                            e.target.value
                                        )
                                    }
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
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
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
                        <div className="flex min-h-[320px] flex-col items-center justify-center">
                            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-black" />

                            <p className="mt-3 text-xs font-medium text-slate-400">
                                Loading catalog...
                            </p>
                        </div>
                    ) : filteredBooks.length === 0 ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
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
                                        d="M6 4.5A2.5 2.5 0 0 1 8.5 2H20v17H8.5A2.5 2.5 0 0 0 6 21.5m0-17A2.5 2.5 0 0 0 3.5 7v12A2.5 2.5 0 0 0 6 21.5"
                                    />
                                </svg>
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                No books found
                            </h3>

                            <p className="mt-1 max-w-md text-xs text-slate-400">
                                {searchTerm ||
                                statusFilter !== "ALL"
                                    ? "Try adjusting your search criteria or status filter."
                                    : "Books are created and added to inventory through Import Receipts."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1450px] text-left text-xs">

                                <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="py-3.5 pl-6 pr-3">
                                        ID
                                    </th>

                                    <th className="px-4 py-3.5">
                                        Title
                                    </th>

                                    <th className="px-4 py-3.5">
                                        ISBN
                                    </th>

                                    <th className="px-4 py-3.5">
                                        Publisher
                                    </th>

                                    <th className="px-4 py-3.5">
                                        Primary Category
                                    </th>

                                    <th className="px-4 py-3.5">
                                        Shelf
                                    </th>

                                    <th className="px-4 py-3.5">
                                        Year
                                    </th>

                                    <th className="px-4 py-3.5 text-center">
                                        Total
                                    </th>

                                    <th className="px-4 py-3.5 text-center">
                                        Available
                                    </th>

                                    <th className="px-4 py-3.5 text-center">
                                        Status
                                    </th>

                                    <th className="py-3.5 pl-4 pr-6 text-right">
                                        Actions
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {filteredBooks.map(
                                    (book) => {
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
                                                className="transition-colors hover:bg-slate-50/60"
                                            >
                                                {/* ID */}

                                                <td className="py-4 pl-6 pr-3 align-top">
                                                    <span className="font-mono text-xs font-medium text-slate-400">
                                                        #{book.id}
                                                    </span>
                                                </td>

                                                {/* Title */}

                                                <td className="max-w-sm px-4 py-4 align-top">
                                                    <div
                                                        onClick={() =>
                                                            router.push(
                                                                `/books/${book.id}`
                                                            )
                                                        }
                                                        className="group flex cursor-pointer items-start gap-3"
                                                    >
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:border-slate-300 group-hover:bg-white group-hover:text-slate-900">
                                                            <svg
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="1.6"
                                                                    d="M6 4.5A2.5 2.5 0 0 1 8.5 2H20v17H8.5A2.5 2.5 0 0 0 6 21.5m0-17A2.5 2.5 0 0 0 3.5 7v12A2.5 2.5 0 0 0 6 21.5"
                                                                />
                                                            </svg>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="truncate text-sm font-semibold text-slate-900 transition group-hover:text-slate-600">
                                                                {book.title}
                                                            </div>

                                                            {book.description ? (
                                                                <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-slate-400">
                                                                    {book.description}
                                                                </p>
                                                            ) : (
                                                                <span className="mt-1 block text-[11px] text-slate-400">
                                                                    Click to view details
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ISBN */}

                                                <td className="px-4 py-4 align-top">
                                                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600">
                                                        {book.isbn || "—"}
                                                    </span>
                                                </td>

                                                {/* Publisher */}

                                                <td className="px-4 py-4 align-top text-slate-600">
                                                    {book.publisher?.name || (
                                                        <span className="italic text-slate-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Primary Category */}

                                                <td className="px-4 py-4 align-top">
                                                    {book.primaryCategory ? (
                                                        <div>
                                                            <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                                {
                                                                    book
                                                                        .primaryCategory
                                                                        .name
                                                                }
                                                            </span>

                                                            {book.categories &&
                                                            book.categories.length >
                                                            1 ? (
                                                                <p className="mt-1 text-[10px] text-slate-400">
                                                                    +
                                                                    {book
                                                                            .categories
                                                                            .length -
                                                                        1}{" "}
                                                                    other categor
                                                                    {book
                                                                        .categories
                                                                        .length -
                                                                    1 ===
                                                                    1
                                                                        ? "y"
                                                                        : "ies"}
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        <span className="italic text-slate-400">
                                                            Not assigned
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Shelf */}

                                                <td className="px-4 py-4 align-top">
                                                    {book.shelf ? (
                                                        <div>
                                                            <span className="font-mono text-[11px] font-semibold text-slate-700">
                                                                {
                                                                    book
                                                                        .shelf
                                                                        .shelfCode
                                                                }
                                                            </span>

                                                            <p className="mt-1 text-[11px] text-slate-500">
                                                                {
                                                                    book
                                                                        .shelf
                                                                        .name
                                                                }
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="italic text-slate-400">
                                                            Not assigned
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Year */}

                                                <td className="px-4 py-4 align-top font-medium text-slate-600">
                                                    {book.publishYear || "—"}
                                                </td>

                                                {/* Total */}

                                                <td className="px-4 py-4 text-center align-top">
                                                    <span className="font-semibold text-slate-800">
                                                        {book.totalQuantity || 0}
                                                    </span>
                                                </td>

                                                {/* Available */}

                                                <td className="px-4 py-4 text-center align-top">
                                                    <span
                                                        className={`inline-flex min-w-8 justify-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                                                            !isActive
                                                                ? "bg-slate-100 text-slate-400"
                                                                : hasStock
                                                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15"
                                                                    : "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-600/15"
                                                        }`}
                                                    >
                                                        {isActive
                                                            ? book.availableQuantity ??
                                                            0
                                                            : 0}
                                                    </span>
                                                </td>

                                                {/* Status */}

                                                <td className="px-4 py-4 text-center align-top">
                                                    <span
                                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                            isActive
                                                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15"
                                                                : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-500/15"
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
                                                            ? "ACTIVE"
                                                            : "INACTIVE"}
                                                    </span>
                                                </td>

                                                {/* Actions */}

                                                <td className="py-4 pl-4 pr-6 align-top">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() =>
                                                                router.push(
                                                                    `/books/${book.id}`
                                                                )
                                                            }
                                                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                                        >
                                                            Detail
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleEditClick(
                                                                    book
                                                                )
                                                            }
                                                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
                                                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none ${
                                                                isActive
                                                                    ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 focus:ring-2 focus:ring-rose-500/15"
                                                                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-2 focus:ring-emerald-500/15"
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
                                    }
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================= */}
            {/* EDIT BOOK MODAL                                           */}
            {/* ========================================================= */}

            {editingBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">

                        {/* Header */}

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Edit Book Information
                                </h3>

                                <p className="mt-1 text-xs text-slate-400">
                                    Update catalog entry #
                                    {editingBook.id}.
                                    Inventory quantities are
                                    managed through Import Receipts.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setEditingBook(null);
                                    resetForm();
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
                                        strokeWidth="1.8"
                                        d="M6 6l12 12M18 6 6 18"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-5 px-6 py-6">

                            {/* Title */}

                            <div>
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
                                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                />
                            </div>

                            {/* ISBN + Publisher */}

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

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
                                        value={formData.isbn}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                isbn: e.target.value,
                                            })
                                        }
                                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
                                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                    >
                                        <option value="">
                                            Select Publisher
                                        </option>

                                        {publishers.map(
                                            (pub) => (
                                                <option
                                                    key={pub.id}
                                                    value={pub.id}
                                                >
                                                    {pub.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Categories */}

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Categories{" "}
                                    <span className="text-rose-500">
                                        *
                                    </span>
                                </label>

                                <select
                                    multiple
                                    value={formData.categoryIds.map(
                                        String
                                    )}
                                    onChange={handleCategoryChange}
                                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                    size={Math.min(
                                        Math.max(
                                            categories.length,
                                            3
                                        ),
                                        6
                                    )}
                                >
                                    {categories.map(
                                        (category) => (
                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {category.name}
                                                {category.status ===
                                                "INACTIVE"
                                                    ? " (Inactive)"
                                                    : ""}
                                            </option>
                                        )
                                    )}
                                </select>

                                <p className="mt-1.5 text-[11px] text-slate-400">
                                    Hold Ctrl to select multiple
                                    categories.
                                </p>
                            </div>

                            {/* Primary Category + Default Shelf */}

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                {/* Primary Category */}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Primary Category{" "}
                                        <span className="text-rose-500">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={
                                            formData.primaryCategoryId
                                        }
                                        onChange={
                                            handlePrimaryCategoryChange
                                        }
                                        disabled={
                                            formData.categoryIds
                                                .length === 0
                                        }
                                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                                    >
                                        <option value="">
                                            {formData.categoryIds
                                                .length === 0
                                                ? "Select categories first"
                                                : "Select Primary Category"}
                                        </option>

                                        {categories
                                            .filter(
                                                (category) =>
                                                    formData.categoryIds.includes(
                                                        Number(
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
                                                        {category.status ===
                                                        "INACTIVE"
                                                            ? " (Inactive)"
                                                            : ""}
                                                    </option>
                                                )
                                            )}
                                    </select>
                                </div>

                                {/* Default Shelf */}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Default Shelf
                                    </label>

                                    <div className="mt-1.5 min-h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                        {selectedShelf ? (
                                            <div>
                                                <div className="font-mono text-xs font-semibold text-slate-800">
                                                    {
                                                        selectedShelf.shelfCode
                                                    }
                                                </div>

                                                <div className="mt-0.5 text-[11px] text-slate-500">
                                                    {
                                                        selectedShelf.name
                                                    }
                                                </div>
                                            </div>
                                        ) : editingBook?.shelf &&
                                        editingBook?.primaryCategory?.id ===
                                        Number(
                                            formData.primaryCategoryId
                                        ) ? (
                                            <div>
                                                <div className="font-mono text-xs font-semibold text-slate-800">
                                                    {
                                                        editingBook
                                                            .shelf
                                                            .shelfCode
                                                    }
                                                </div>

                                                <div className="mt-0.5 text-[11px] text-slate-500">
                                                    {
                                                        editingBook
                                                            .shelf
                                                            .name
                                                    }
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400">
                                                Select a primary
                                                category
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1.5 text-[11px] text-slate-400">
                                        Shelf is determined
                                        automatically from the
                                        primary category.
                                    </p>
                                </div>
                            </div>

                            {/* Publish Year + Price */}

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                {/* Publish Year */}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Publish Year
                                    </label>

                                    <input
                                        type="number"
                                        value={
                                            formData.publishYear
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                publishYear:
                                                e.target.value,
                                            })
                                        }
                                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                    />
                                </div>

                                {/* Price */}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Price (VND)
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
                                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                    />
                                </div>
                            </div>

                            {/* Existing Authors */}

                            <div>
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
                                            ).map(
                                                (opt) =>
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
                                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                    size={Math.min(
                                        Math.max(
                                            authors.length,
                                            3
                                        ),
                                        5
                                    )}
                                >
                                    {authors.map(
                                        (author) => (
                                            <option
                                                key={
                                                    author.id
                                                }
                                                value={
                                                    author.id
                                                }
                                            >
                                                {author.name}
                                                {author.status ===
                                                "INACTIVE"
                                                    ? " (Inactive)"
                                                    : ""}
                                            </option>
                                        )
                                    )}
                                </select>

                                <p className="mt-1.5 text-[11px] text-slate-400">
                                    Hold Ctrl to select multiple
                                    existing authors.
                                </p>
                            </div>

                            {/* New Authors */}

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    New Author Names
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. Robert C. Martin, Martin Fowler"
                                    value={
                                        formData.authorNames
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            authorNames:
                                            e.target.value,
                                        })
                                    }
                                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                />

                                <p className="mt-1.5 text-[11px] leading-4 text-slate-400">
                                    Enter multiple author names
                                    separated by commas. Existing
                                    names will be reused
                                    automatically; new names will
                                    be added to Author Management.
                                </p>
                            </div>

                            {/* Description */}

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    rows={4}
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
                                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                />
                            </div>
                        </div>

                        {/* Footer */}

                        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingBook(null);
                                    resetForm();
                                }}
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleUpdateBook}
                                className="inline-flex h-10 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[0.98]"
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