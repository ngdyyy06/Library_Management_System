"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getBookShelves,
    getBookShelfById,
    createBookShelf,
    updateBookShelf,
    activateBookShelf,
    deactivateBookShelf,
    getCategories,
} from "@/app/lib/api";

interface BookShelfCategory {
    id: number;
    name: string;
    status: string;
}

interface BookShelf {
    id: number;
    shelfCode: string;
    name: string;
    status: string;
    usedCapacity: number;
    maxCapacity: number;
    availableCapacity: number;
}

interface BookShelfDetail extends BookShelf {
    categories?: BookShelfCategory[];
}

interface Category {
    id: number;
    name: string;
    status: string;
}

export default function BookShelvesPage() {

    const router = useRouter();

    const [shelves, setShelves] = useState<BookShelf[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    /*
     * Store categories belonging to each shelf.
     *
     * Example:
     *
     * {
     *   1: [
     *      { id: 1, name: "Computer Science" }
     *   ],
     *
     *   2: [
     *      { id: 1, name: "Computer Science" },
     *      { id: 6, name: "Animal" }
     *   ]
     * }
     *
     * This allows the same category to belong to
     * multiple shelves.
     */
    const [shelfCategories, setShelfCategories] =
        useState<Record<number, BookShelfCategory[]>>({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showFormModal, setShowFormModal] = useState(false);

    const [editingShelf, setEditingShelf] =
        useState<BookShelf | null>(null);

    const [shelfCode, setShelfCode] = useState("");
    const [name, setName] = useState("");

    const [selectedCategoryIds, setSelectedCategoryIds] =
        useState<number[]>([]);

    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // =========================================================
    // LOAD DATA
    // =========================================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                shelfData,
                categoryData,
            ] = await Promise.all([
                getBookShelves(),
                getCategories(),
            ]);

            setShelves(shelfData);
            setCategories(categoryData);

            /*
             * Load detail of every shelf.
             *
             * We need this because getBookShelves()
             * returns capacity information but does not
             * contain the shelf's categories.
             */
            const shelfDetailResults =
                await Promise.all(
                    shelfData.map(async (shelf: BookShelf) => {

                        const detail =
                            await getBookShelfById(
                                shelf.id
                            );

                        return {
                            shelfId: shelf.id,
                            categories:
                                detail?.categories || [],
                        };
                    })
                );

            const categoryMap:
                Record<number, BookShelfCategory[]> = {};

            shelfDetailResults.forEach(
                (item) => {

                    categoryMap[item.shelfId] =
                        item.categories;
                }
            );

            setShelfCategories(categoryMap);

        } catch (error: any) {

            setError(
                error?.message ||
                "Failed to load book shelves"
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        loadData();

    }, []);

    // =========================================================
    // CREATE MODAL
    // =========================================================

    const openCreateModal = () => {

        setEditingShelf(null);

        setShelfCode("");
        setName("");

        setSelectedCategoryIds([]);

        setFormError("");

        setShowFormModal(true);
    };

    // =========================================================
    // EDIT MODAL
    // =========================================================

    const openEditModal = async (
        shelf: BookShelf
    ) => {

        try {

            setFormError("");

            /*
             * Get the real categories of this shelf.
             *
             * Do NOT use Category.defaultShelf here.
             *
             * A category can belong to multiple shelves.
             */
            const detail: BookShelfDetail =
                await getBookShelfById(
                    shelf.id
                );

            const categoryIds =
                (detail.categories || [])
                    .map(
                        (category) =>
                            category.id
                    );

            setEditingShelf(shelf);

            setShelfCode(
                shelf.shelfCode
            );

            setName(
                shelf.name
            );

            setSelectedCategoryIds(
                categoryIds
            );

            setShowFormModal(true);

        } catch (error: any) {

            setError(
                error?.message ||
                "Failed to load shelf details"
            );
        }
    };

    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const closeFormModal = () => {

        if (saving) return;

        setShowFormModal(false);

        setEditingShelf(null);

        setShelfCode("");
        setName("");

        setSelectedCategoryIds([]);

        setFormError("");
    };

    // =========================================================
    // CATEGORY CHECKBOX
    // =========================================================

    const handleCategoryChange = (
        categoryId: number
    ) => {

        setSelectedCategoryIds(
            (current) => {

                if (
                    current.includes(
                        categoryId
                    )
                ) {

                    return current.filter(
                        (id) =>
                            id !== categoryId
                    );
                }

                return [
                    ...current,
                    categoryId,
                ];
            }
        );
    };

    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (
        event: React.FormEvent
    ) => {

        event.preventDefault();

        // -----------------------------------------------------
        // Validate Shelf Code
        // -----------------------------------------------------

        if (!shelfCode.trim()) {

            setFormError(
                "Shelf code is required."
            );

            return;
        }

        // -----------------------------------------------------
        // Validate Shelf Name
        // -----------------------------------------------------

        if (!name.trim()) {

            setFormError(
                "Shelf name is required."
            );

            return;
        }

        try {

            setSaving(true);
            setFormError("");

            /*
             * IMPORTANT:
             *
             * categories here represent the categories
             * belonging to this shelf.
             *
             * They do NOT modify Category.defaultShelf.
             */
            const shelfRequest = {

                shelfCode:
                    shelfCode.trim(),

                name:
                    name.trim(),

                status:
                    editingShelf
                        ? editingShelf.status
                        : "ACTIVE",

                categories:
                    selectedCategoryIds.map(
                        (id) => ({
                            id,
                        })
                    ),
            };

            // =================================================
            // UPDATE
            // =================================================

            if (editingShelf) {

                await updateBookShelf(
                    editingShelf.id,
                    shelfRequest
                );

            }

                // =================================================
                // CREATE
            // =================================================

            else {

                await createBookShelf(
                    shelfRequest
                );
            }

            /*
             * DO NOT call syncCategories().
             *
             * Previously this changed:
             *
             * Category.defaultShelf
             *
             * which caused the old shelf to lose the category.
             *
             * The shelf categories are already saved by
             * createBookShelf/updateBookShelf.
             */

            closeFormModal();

            await loadData();

        } catch (error: any) {

            setFormError(
                error?.message ||
                "Failed to save book shelf"
            );

        } finally {

            setSaving(false);
        }
    };

    // =========================================================
    // DEACTIVATE
    // =========================================================

    const handleDeactivate = async (
        shelf: BookShelf
    ) => {

        const confirmed =
            window.confirm(
                `Deactivate shelf "${shelf.name}"?`
            );

        if (!confirmed) return;

        try {

            setError("");

            await deactivateBookShelf(
                shelf.id
            );

            await loadData();

        } catch (error: any) {

            setError(
                error?.message ||
                "Failed to deactivate shelf"
            );
        }
    };

    // =========================================================
    // ACTIVATE
    // =========================================================

    const handleActivate = async (
        shelf: BookShelf
    ) => {

        const confirmed =
            window.confirm(
                `Activate shelf "${shelf.name}"?`
            );

        if (!confirmed) return;

        try {

            setError("");

            await activateBookShelf(
                shelf.id
            );

            await loadData();

        } catch (error: any) {

            setError(
                error?.message ||
                "Failed to activate shelf"
            );
        }
    };

    // =========================================================
    // GET CATEGORY NAMES
    // =========================================================

    const getCategoryNames = (
        shelfId: number
    ) => {

        return (
            shelfCategories[shelfId] || []
        ).map(
            (category) =>
                category.name
        );
    };

    // =========================================================
    // CAPACITY
    // =========================================================

    const getCapacityPercentage = (
        shelf: BookShelf
    ) => {

        if (
            shelf.maxCapacity <= 0
        ) {

            return 0;
        }

        return Math.min(
            100,
            Math.round(
                (
                    shelf.usedCapacity /
                    shelf.maxCapacity
                ) * 100
            )
        );
    };

    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="min-h-screen bg-[#f7f8fa] p-6 font-sans sm:p-8">

            <div className="mx-auto max-w-7xl space-y-6">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Library Management
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Book Shelf Management
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage physical shelves and their category assignments.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
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

                        Add Shelf

                    </button>

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">

                        {error}

                    </div>
                )}

                {/* =================================================
                    SHELF TABLE
                ================================================= */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-6 py-5">

                        <div>

                            <h2 className="text-sm font-bold text-slate-900">
                                Shelf List
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">

                                {shelves.length} shelf
                                {shelves.length !== 1
                                    ? "s"
                                    : ""}

                                {" "}registered

                            </p>

                        </div>

                    </div>

                    {loading ? (

                        <div className="flex min-h-[300px] items-center justify-center">

                            <div className="flex flex-col items-center gap-3">

                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />

                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Loading shelves...
                                </p>

                            </div>

                        </div>

                    ) : shelves.length === 0 ? (

                        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >

                                    <path
                                        strokeWidth={1.6}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 7h16M4 12h16M4 17h16"
                                    />

                                </svg>

                            </div>

                            <h3 className="mt-4 text-sm font-bold text-slate-900">
                                No shelves found
                            </h3>

                            <p className="mt-1 max-w-sm text-xs text-slate-400">
                                Create a shelf to start organizing the physical book collection.
                            </p>

                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                            >
                                Add Shelf
                            </button>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[1150px]">

                                <thead>

                                <tr className="border-b border-slate-100 bg-slate-50/70">

                                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Shelf
                                    </th>

                                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Name
                                    </th>

                                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Capacity
                                    </th>

                                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Categories
                                    </th>

                                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Status
                                    </th>

                                    <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Actions
                                    </th>

                                </tr>

                                </thead>

                                <tbody>

                                {shelves.map(
                                    (shelf) => {

                                        const categoryNames =
                                            getCategoryNames(
                                                shelf.id
                                            );

                                        const capacityPercentage =
                                            getCapacityPercentage(
                                                shelf
                                            );

                                        return (

                                            <tr
                                                key={shelf.id}
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                                            >

                                                {/* SHELF */}

                                                <td className="px-6 py-4">

                                                    <span className="font-mono text-sm font-semibold text-slate-900">
                                                        {shelf.shelfCode}
                                                    </span>

                                                </td>

                                                {/* NAME */}

                                                <td className="px-6 py-4">

                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {shelf.name}
                                                    </p>

                                                </td>

                                                {/* CAPACITY */}

                                                <td className="px-6 py-4">

                                                    <div className="w-44">

                                                        <div className="flex items-center justify-between">

                                                            <span className="text-xs font-semibold text-slate-700">
                                                                {shelf.usedCapacity}
                                                                {" / "}
                                                                {shelf.maxCapacity}
                                                            </span>

                                                            <span className="text-[10px] font-medium text-slate-400">
                                                                {capacityPercentage}%
                                                            </span>

                                                        </div>

                                                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">

                                                            <div
                                                                className={`h-full rounded-full transition-all ${
                                                                    capacityPercentage >= 90
                                                                        ? "bg-rose-500"
                                                                        : capacityPercentage >= 70
                                                                            ? "bg-amber-500"
                                                                            : "bg-slate-800"
                                                                }`}
                                                                style={{
                                                                    width:
                                                                        `${capacityPercentage}%`,
                                                                }}
                                                            />

                                                        </div>

                                                        <p className="mt-1 text-[10px] text-slate-400">
                                                            {shelf.availableCapacity}
                                                            {" "}available
                                                        </p>

                                                    </div>

                                                </td>

                                                {/* CATEGORIES */}

                                                <td className="px-6 py-4">

                                                    {categoryNames.length > 0 ? (

                                                        <div className="flex max-w-md flex-wrap gap-1.5">

                                                            {categoryNames.map(
                                                                (
                                                                    categoryName
                                                                ) => (

                                                                    <span
                                                                        key={
                                                                            categoryName
                                                                        }
                                                                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600"
                                                                    >
                                                                        {
                                                                            categoryName
                                                                        }
                                                                    </span>

                                                                )
                                                            )}

                                                        </div>

                                                    ) : (

                                                        <span className="text-xs italic text-slate-400">
                                                            No categories
                                                        </span>

                                                    )}

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
                                                            shelf.status ===
                                                            "ACTIVE"
                                                                ? "bg-emerald-50 text-emerald-600 ring-emerald-500/20"
                                                                : "bg-slate-100 text-slate-500 ring-slate-400/20"
                                                        }`}
                                                    >

                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                shelf.status ===
                                                                "ACTIVE"
                                                                    ? "bg-emerald-500"
                                                                    : "bg-slate-400"
                                                            }`}
                                                        />

                                                        {shelf.status}

                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-6 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/book-shelves/${shelf.id}`
                                                                )
                                                            }
                                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                        >
                                                            Detail
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    shelf
                                                                )
                                                            }
                                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                        >
                                                            Edit
                                                        </button>

                                                        {shelf.status ===
                                                        "ACTIVE" ? (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeactivate(
                                                                        shelf
                                                                    )
                                                                }
                                                                className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                                            >
                                                                Deactivate
                                                            </button>

                                                        ) : (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleActivate(
                                                                        shelf
                                                                    )
                                                                }
                                                                className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                                                            >
                                                                Activate
                                                            </button>

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

            </div>

            {/* =====================================================
                ADD / EDIT MODAL
            ===================================================== */}

            {showFormModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">

                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">

                        {/* HEADER */}

                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

                            <div>

                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">

                                    {editingShelf
                                        ? "Shelf Management"
                                        : "New Shelf"}

                                </p>

                                <h2 className="mt-1 text-lg font-bold text-slate-900">

                                    {editingShelf
                                        ? "Edit Book Shelf"
                                        : "Add Book Shelf"}

                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeFormModal
                                }
                                className="text-slate-400 hover:text-slate-700"
                            >

                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >

                                    <path
                                        strokeWidth={1.7}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 6l12 12M6 18L18 6"
                                    />

                                </svg>

                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-5 px-6 py-6"
                        >

                            {/* ERROR */}

                            {formError && (

                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">

                                    {formError}

                                </div>
                            )}

                            {/* SHELF CODE */}

                            <div>

                                <label className="text-xs font-semibold text-slate-700">
                                    Shelf Code
                                </label>

                                <input
                                    type="text"
                                    value={
                                        shelfCode
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setShelfCode(
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. S-A01"
                                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
                                />

                            </div>

                            {/* SHELF NAME */}

                            <div>

                                <label className="text-xs font-semibold text-slate-700">
                                    Shelf Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        name
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Programming Shelf"
                                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
                                />

                            </div>

                            {/* CATEGORIES */}

                            <div>

                                <label className="text-xs font-semibold text-slate-700">
                                    Categories
                                </label>

                                <p className="mt-1 text-[11px] text-slate-400">
                                    Select categories that belong to this shelf.
                                </p>

                                <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-slate-200">

                                    {categories.length ===
                                    0 ? (

                                        <div className="px-3 py-4 text-xs text-slate-400">
                                            No categories available.
                                        </div>

                                    ) : (

                                        categories.map(
                                            (
                                                category
                                            ) => {

                                                const checked =
                                                    selectedCategoryIds.includes(
                                                        category.id
                                                    );

                                                return (

                                                    <label
                                                        key={
                                                            category.id
                                                        }
                                                        className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-0 hover:bg-slate-50"
                                                    >

                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                checked
                                                            }
                                                            onChange={() =>
                                                                handleCategoryChange(
                                                                    category.id
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                                        />

                                                        <div className="min-w-0 flex-1">

                                                            <p className="text-xs font-semibold text-slate-700">
                                                                {
                                                                    category.name
                                                                }
                                                            </p>

                                                            <p className="text-[10px] text-slate-400">
                                                                {
                                                                    category.status
                                                                }
                                                            </p>

                                                        </div>

                                                    </label>
                                                );
                                            }
                                        )

                                    )}

                                </div>

                                <p className="mt-1.5 text-[11px] text-slate-400">

                                    {
                                        selectedCategoryIds.length
                                    }

                                    {" "}categor
                                    {selectedCategoryIds.length ===
                                    1
                                        ? "y"
                                        : "ies"}

                                    {" "}selected

                                </p>

                            </div>

                            {/* ACTIONS */}

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                    type="button"
                                    onClick={
                                        closeFormModal
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingShelf
                                            ? "Save Changes"
                                            : "Create Shelf"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}