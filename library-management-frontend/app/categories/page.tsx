"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    getCategories,
    createCategory,
    updateCategory,
    activateCategory,
    deactivateCategory,
} from "../lib/api";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await getCategories();
            setCategories(data || []);
        } catch (error) {
            console.error("Failed to load categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!formData.name.trim()) {
            alert("Please enter category name!");
            return;
        }

        try {
            await createCategory(formData.name.trim());
            setShowAddForm(false);
            setFormData({ name: "" });
            await loadCategories();
        } catch (error) {
            console.error("Failed to create category:", error);
            alert("Failed to create category. Please try again!");
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !formData.name.trim()) {
            alert("Please enter category name!");
            return;
        }

        try {
            await updateCategory(editingCategory.id, formData.name.trim());
            setEditingCategory(null);
            setShowAddForm(false);
            setFormData({ name: "" });
            await loadCategories();
        } catch (error) {
            console.error("Failed to update category:", error);
            alert("Failed to update category. Please try again!");
        }
    };

    const handleToggleStatus = async (category: any) => {
        const isActive =
            category.status === "ACTIVE" || category.active === true;

        const confirmMsg = isActive
            ? `Are you sure you want to deactivate category "${category.name}"?`
            : `Are you sure you want to activate category "${category.name}"?`;

        if (!confirm(confirmMsg)) return;

        try {
            if (isActive) {
                await deactivateCategory(category.id);
            } else {
                await activateCategory(category.id);
            }

            await loadCategories();
        } catch (error) {
            console.error("Failed to toggle category status:", error);
            alert("Action failed. Please try again!");
        }
    };

    const startEditing = (category: any) => {
        setEditingCategory(category);
        setFormData({
            name: category.name || "",
        });
        setShowAddForm(true);
    };

    const closeFormModal = () => {
        setShowAddForm(false);
        setEditingCategory(null);
        setFormData({ name: "" });
    };

    const filteredCategories = useMemo(() => {
        return categories.filter((category) => {
            const matchesSearch = category.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());

            const isActive =
                category.status === "ACTIVE" || category.active === true;

            let matchesStatus = true;

            if (statusFilter === "ACTIVE") {
                matchesStatus = isActive;
            }

            if (statusFilter === "INACTIVE") {
                matchesStatus = !isActive;
            }

            return matchesSearch && matchesStatus;
        });
    }, [categories, searchTerm, statusFilter]);

    const totalCount = categories.length;

    const activeCount = categories.filter(
        (category) =>
            category.status === "ACTIVE" || category.active === true
    ).length;

    const inactiveCount = totalCount - activeCount;

    return (
        <div className="min-h-screen w-full bg-[#f7f8fa] p-6 font-sans lg:p-8">
            <div className="w-full space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Categories
                            </h1>

                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                Book Categories
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage book genres, classification taxonomy, and activity status.
                        </p>
                    </div>

                    {/* Add Category */}
                    <button
                        type="button"
                        onClick={() => {
                            setEditingCategory(null);
                            setFormData({ name: "" });
                            setShowAddForm(true);
                        }}
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

                        Add Category
                    </button>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* Total Categories */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Total Categories
                            </span>
                        </div>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {totalCount}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Registered book categories
                        </p>
                    </div>

                    {/* Active Categories */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Active Categories
                            </span>

                        </div>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {activeCount}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Available for book assignment
                        </p>
                    </div>

                    {/* Inactive Categories */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Inactive Categories
                            </span>

                        </div>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {inactiveCount}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Archived or disabled
                        </p>
                    </div>
                </div>

                {/* Main Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Table Header */}
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Categories Inventory
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                                Showing {filteredCategories.length} of {totalCount} items
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">

                            {/* Search */}
                            <div className="relative min-w-[240px]">
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
                                    placeholder="Search category name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
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
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />

                            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                                Loading categories...
                            </p>
                        </div>

                    ) : filteredCategories.length === 0 ? (

                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
                                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 8H20" />
                                </svg>
                            </div>

                            <h3 className="mt-3 text-sm font-semibold text-slate-900">
                                No categories found
                            </h3>

                            <p className="mt-1 max-w-sm text-xs text-slate-400">
                                {searchTerm || statusFilter !== "ALL"
                                    ? "Try adjusting your search criteria or status filter."
                                    : "Get started by creating a new category record."}
                            </p>
                        </div>

                    ) : (

                        /* Table */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">

                                <thead className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                                        Category Name
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3.5 text-center"
                                    >
                                        Status
                                    </th>

                                    <th
                                        scope="col"
                                        className="py-3.5 pl-4 pr-6 text-right"
                                    >
                                        Actions
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {filteredCategories.map((category) => {
                                    const isActive =
                                        category.status === "ACTIVE" ||
                                        category.active === true;

                                    return (
                                        <tr
                                            key={category.id}
                                            className="transition hover:bg-slate-50/60"
                                        >
                                            {/* ID */}
                                            <td className="py-4 pl-6 pr-3 font-mono text-xs font-medium text-slate-400">
                                                #{category.id}
                                            </td>

                                            {/* Category Name */}
                                            <td className="px-4 py-4">
                                                <div
                                                    onClick={() =>
                                                        router.push(
                                                            `/categories/${category.id}`
                                                        )
                                                    }
                                                    className="group flex cursor-pointer items-center gap-3"
                                                >
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M7 7h10" />
                                                            <path d="M7 12h10" />
                                                            <path d="M7 17h6" />
                                                        </svg>
                                                    </div>

                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900 transition group-hover:text-slate-600">
                                                            {category.name}
                                                        </div>

                                                        <div className="text-[11px] text-slate-400">
                                                            Click to view details
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide ${
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
                                                            ? "ACTIVE"
                                                            : "INACTIVE"}
                                                    </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 pl-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">

                                                    {/* Detail */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.push(
                                                                `/categories/${category.id}`
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        Detail
                                                    </button>

                                                    {/* Edit */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEditing(category)
                                                        }
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        Edit
                                                    </button>

                                                    {/* Activate / Deactivate */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                category
                                                            )
                                                        }
                                                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
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

            {/* Add / Edit Modal */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    {editingCategory
                                        ? "Edit Category Information"
                                        : "Add New Category"}
                                </h3>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    Manage genre and catalog classification
                                </p>
                            </div>

                            {/* Close */}
                            <button
                                type="button"
                                onClick={closeFormModal}
                                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
                                        strokeWidth="1.7"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Category Name{" "}
                                    <span className="text-rose-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. Programming, Database, Science Fiction"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                                />
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">

                            {/* Cancel */}
                            <button
                                type="button"
                                onClick={closeFormModal}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                            >
                                Cancel
                            </button>

                            {/* Create / Save */}
                            <button
                                type="button"
                                onClick={
                                    editingCategory
                                        ? handleUpdateCategory
                                        : handleCreateCategory
                                }
                                className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20"
                            >
                                {editingCategory
                                    ? "Save Changes"
                                    : "Create Category"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}