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
    assignCategoryDefaultShelf,
    removeCategoryDefaultShelf,
} from "@/app/lib/api";

interface BookShelf {
    id: number;
    shelfCode: string;
    name: string;
    status: string;
}

interface Category {
    id: number;
    name: string;
    status: string;
    defaultShelf?: BookShelf | null;
}

export default function BookShelvesPage() {

    const router = useRouter();

    const [shelves, setShelves] = useState<BookShelf[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [editingShelf, setEditingShelf] =
        useState<BookShelf | null>(null);

    const [selectedShelf, setSelectedShelf] =
        useState<BookShelf | null>(null);

    const [shelfCode, setShelfCode] = useState("");
    const [name, setName] = useState("");

    const [selectedCategoryIds, setSelectedCategoryIds] =
        useState<number[]>([]);

    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const loadData = async () => {

        try {
            setLoading(true);
            setError("");

            const [shelfData, categoryData] =
                await Promise.all([
                    getBookShelves(),
                    getCategories(),
                ]);

            setShelves(shelfData);
            setCategories(categoryData);

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

    const openCreateModal = () => {

        setEditingShelf(null);

        setShelfCode("");
        setName("");
        setSelectedCategoryIds([]);

        setFormError("");

        setShowFormModal(true);
    };

    const openEditModal = (shelf: BookShelf) => {

        setEditingShelf(shelf);

        setShelfCode(shelf.shelfCode);
        setName(shelf.name);

        const categoryIds = categories
            .filter(
                (category) =>
                    category.defaultShelf?.id === shelf.id
            )
            .map((category) => category.id);

        setSelectedCategoryIds(categoryIds);

        setFormError("");

        setShowFormModal(true);
    };

    const closeFormModal = () => {

        if (saving) return;

        setShowFormModal(false);

        setEditingShelf(null);

        setShelfCode("");
        setName("");
        setSelectedCategoryIds([]);

        setFormError("");
    };

    const handleCategoryChange = (categoryId: number) => {

        setSelectedCategoryIds((current) => {

            if (current.includes(categoryId)) {
                return current.filter(
                    (id) => id !== categoryId
                );
            }

            return [...current, categoryId];
        });
    };

    const syncCategories = async (
        shelfId: number
    ) => {

        const currentCategoryIds = categories
            .filter(
                (category) =>
                    category.defaultShelf?.id === shelfId
            )
            .map((category) => category.id);

        const selectedIds = new Set(
            selectedCategoryIds
        );

        const currentIds = new Set(
            currentCategoryIds
        );

        const assignPromises =
            selectedCategoryIds
                .filter(
                    (categoryId) =>
                        !currentIds.has(categoryId)
                )
                .map(
                    (categoryId) =>
                        assignCategoryDefaultShelf(
                            categoryId,
                            shelfId
                        )
                );

        const removePromises =
            currentCategoryIds
                .filter(
                    (categoryId) =>
                        !selectedIds.has(categoryId)
                )
                .map(
                    (categoryId) =>
                        removeCategoryDefaultShelf(
                            categoryId
                        )
                );

        await Promise.all([
            ...assignPromises,
            ...removePromises,
        ]);
    };

    const handleSubmit = async (
        event: React.FormEvent
    ) => {

        event.preventDefault();

        if (!shelfCode.trim()) {
            setFormError("Shelf code is required.");
            return;
        }

        if (!name.trim()) {
            setFormError("Shelf name is required.");
            return;
        }

        try {

            setSaving(true);
            setFormError("");

            let shelfId: number;

            if (editingShelf) {

                await updateBookShelf(
                    editingShelf.id,
                    {
                        shelfCode: shelfCode.trim(),
                        name: name.trim(),
                    }
                );

                shelfId = editingShelf.id;

            } else {

                const createdShelf =
                    await createBookShelf({
                        shelfCode: shelfCode.trim(),
                        name: name.trim(),
                        status: "ACTIVE",
                    });

                shelfId = createdShelf.id;
            }

            await syncCategories(shelfId);

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

    const handleViewDetail = async (id: number) => {

        try {

            setError("");

            const shelf = await getBookShelfById(id);

            setSelectedShelf(shelf);

            setShowDetailModal(true);

        } catch (error: any) {

            setError(
                error?.message ||
                "Failed to load shelf details"
            );
        }
    };

    const handleDeactivate = async (
        shelf: BookShelf
    ) => {

        const confirmed = window.confirm(
            `Deactivate shelf "${shelf.name}"?`
        );

        if (!confirmed) return;

        try {

            setError("");

            await deactivateBookShelf(shelf.id);

            await loadData();

            if (
                selectedShelf &&
                selectedShelf.id === shelf.id
            ) {
                setSelectedShelf({
                    ...selectedShelf,
                    status: "INACTIVE",
                });
            }

        } catch (error: any) {

            setError(
                error?.message ||
                "Failed to deactivate shelf"
            );
        }
    };

    const handleActivate = async (
        shelf: BookShelf
    ) => {

        const confirmed = window.confirm(
            `Activate shelf "${shelf.name}"?`
        );

        if (!confirmed) return;

        try {

            setError("");

            await activateBookShelf(shelf.id);

            await loadData();

            if (
                selectedShelf &&
                selectedShelf.id === shelf.id
            ) {
                setSelectedShelf({
                    ...selectedShelf,
                    status: "ACTIVE",
                });
            }

        } catch (error: any) {

            setError(
                error?.message ||
                "Failed to activate shelf"
            );
        }
    };

    const getCategoryCount = (shelfId: number) => {

        return categories.filter(
            (category) =>
                category.defaultShelf?.id === shelfId
        ).length;
    };

    const getCategoryNames = (shelfId: number) => {

        return categories
            .filter(
                (category) =>
                    category.defaultShelf?.id === shelfId
            )
            .map((category) => category.name);
    };

    return (
        <div className="min-h-screen bg-[#f7f8fa] p-6 font-sans sm:p-8">

            <div className="mx-auto max-w-7xl space-y-6">

                {/* HEADER */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Library Management
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Book Shelf Management
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage physical shelves and their default category assignments.
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


                {/* ERROR */}

                {error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}


                {/* CONTENT */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-6 py-5">

                        <div>
                            <h2 className="text-sm font-bold text-slate-900">
                                Shelf List
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                {shelves.length} shelf
                                {shelves.length !== 1 ? "s" : ""}
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

                            <table className="w-full min-w-[1000px]">

                                <thead>

                                <tr className="border-b border-slate-100 bg-slate-50/70">

                                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Shelf
                                    </th>

                                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Name
                                    </th>

                                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Default Categories
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

                                {shelves.map((shelf) => {

                                    const categoryNames =
                                        getCategoryNames(
                                            shelf.id
                                        );

                                    return (
                                        <tr
                                            key={shelf.id}
                                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                                        >

                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-semibold text-slate-900">
                                                    {shelf.shelfCode}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {shelf.name}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">

                                                {categoryNames.length > 0 ? (

                                                    <div className="flex max-w-md flex-wrap gap-1.5">

                                                        {categoryNames.map(
                                                            (categoryName) => (
                                                                <span
                                                                    key={categoryName}
                                                                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600"
                                                                >
                                                                    {categoryName}
                                                                </span>
                                                            )
                                                        )}

                                                    </div>

                                                ) : (

                                                    <span className="text-xs italic text-slate-400">
                                                        No default categories
                                                    </span>

                                                )}

                                            </td>

                                            <td className="px-6 py-4">

                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
                                                        shelf.status === "ACTIVE"
                                                            ? "bg-emerald-50 text-emerald-600 ring-emerald-500/20"
                                                            : "bg-slate-100 text-slate-500 ring-slate-400/20"
                                                    }`}
                                                >

                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            shelf.status === "ACTIVE"
                                                                ? "bg-emerald-500"
                                                                : "bg-slate-400"
                                                        }`}
                                                    />

                                                    {shelf.status}

                                                </span>

                                            </td>

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

                                                    {shelf.status === "ACTIVE" ? (

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
                                })}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

            </div>


            {/* ADD / EDIT MODAL */}

            {showFormModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">

                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">

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
                                onClick={closeFormModal}
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


                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 px-6 py-6"
                        >

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
                                    value={shelfCode}
                                    onChange={(e) =>
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
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Programming Shelf"
                                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
                                />

                            </div>


                            {/* DEFAULT CATEGORIES */}

                            <div>

                                <label className="text-xs font-semibold text-slate-700">
                                    Default Categories
                                </label>

                                <p className="mt-1 text-[11px] text-slate-400">
                                    Select categories that should use this shelf by default.
                                </p>

                                <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-slate-200">

                                    {categories.length === 0 ? (

                                        <div className="px-3 py-4 text-xs text-slate-400">
                                            No categories available.
                                        </div>

                                    ) : (

                                        categories.map((category) => {

                                            const checked =
                                                selectedCategoryIds.includes(
                                                    category.id
                                                );

                                            return (
                                                <label
                                                    key={category.id}
                                                    className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-0 hover:bg-slate-50"
                                                >

                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() =>
                                                            handleCategoryChange(
                                                                category.id
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                                    />

                                                    <div className="min-w-0 flex-1">

                                                        <p className="text-xs font-semibold text-slate-700">
                                                            {category.name}
                                                        </p>

                                                        <p className="text-[10px] text-slate-400">
                                                            {category.status}
                                                            {category.defaultShelf
                                                                ? ` • Current shelf: ${category.defaultShelf.name}`
                                                                : " • No default shelf"}
                                                        </p>

                                                    </div>

                                                </label>
                                            );
                                        })

                                    )}

                                </div>

                                <p className="mt-1.5 text-[11px] text-slate-400">
                                    {selectedCategoryIds.length} categor
                                    {selectedCategoryIds.length === 1
                                        ? "y"
                                        : "ies"}{" "}
                                    selected
                                </p>

                            </div>


                            {/* ACTIONS */}

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                    type="button"
                                    onClick={closeFormModal}
                                    disabled={saving}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
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


            {/* OLD DETAIL MODAL */}

            {showDetailModal && selectedShelf && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">

                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">

                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

                            <div>

                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Shelf Details
                                </p>

                                <h2 className="mt-1 text-lg font-bold text-slate-900">
                                    {selectedShelf.name}
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowDetailModal(false)
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

                        <div className="space-y-4 px-6 py-6">

                            <div className="grid grid-cols-2 gap-3">

                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">

                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Shelf ID
                                    </p>

                                    <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                                        #{selectedShelf.id}
                                    </p>

                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">

                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Shelf Code
                                    </p>

                                    <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                                        {selectedShelf.shelfCode}
                                    </p>

                                </div>

                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">

                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Shelf Name
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {selectedShelf.name}
                                </p>

                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">

                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Status
                                </p>

                                <span
                                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                        selectedShelf.status === "ACTIVE"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            selectedShelf.status === "ACTIVE"
                                                ? "bg-emerald-500"
                                                : "bg-slate-400"
                                        }`}
                                    />

                                    {selectedShelf.status}
                                </span>

                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">

                                <div className="flex items-center justify-between">

                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Default Categories
                                    </p>

                                    <span className="text-[11px] font-semibold text-slate-400">
                                        {getCategoryCount(
                                            selectedShelf.id
                                        )}
                                    </span>

                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">

                                    {getCategoryNames(
                                        selectedShelf.id
                                    ).length > 0 ? (

                                        getCategoryNames(
                                            selectedShelf.id
                                        ).map((categoryName) => (

                                            <span
                                                key={categoryName}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                                            >
                                                {categoryName}
                                            </span>

                                        ))

                                    ) : (

                                        <span className="text-xs italic text-slate-400">
                                            No categories are assigned as default shelf.
                                        </span>

                                    )}

                                </div>

                            </div>

                        </div>

                        <div className="flex justify-end border-t border-slate-100 px-6 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowDetailModal(false)
                                }
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}