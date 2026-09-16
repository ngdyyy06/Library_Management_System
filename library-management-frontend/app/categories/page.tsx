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
        const isActive = category.status === "ACTIVE" || category.active === true;
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

            const isActive = category.status === "ACTIVE" || category.active === true;

            let matchesStatus = true;
            if (statusFilter === "ACTIVE") matchesStatus = isActive;
            if (statusFilter === "INACTIVE") matchesStatus = !isActive;

            return matchesSearch && matchesStatus;
        });
    }, [categories, searchTerm, statusFilter]);

    const totalCount = categories.length;
    const activeCount = categories.filter(
        (category) => category.status === "ACTIVE" || category.active === true
    ).length;
    const inactiveCount = totalCount - activeCount;

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] p-6 font-sans lg:p-8">
            <div className="w-full space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Categories
                            </h1>
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                                Book Categories
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage book genres, classification taxonomy, and activity status.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setEditingCategory(null);
                            setFormData({ name: "" });
                            setShowAddForm(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        + Add Category
                    </button>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                TOTAL CATEGORIES
                            </span>
                            <span className="h-2 w-2 rounded-full bg-indigo-600" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{totalCount}</p>
                        <p className="mt-1 text-xs text-slate-400">Registered book categories</p>
                    </div>

                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                                ACTIVE CATEGORIES
                            </span>
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-emerald-600">{activeCount}</p>
                        <p className="mt-1 text-xs text-slate-400">Available for book assignment</p>
                    </div>

                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                                INACTIVE CATEGORIES
                            </span>
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-amber-600">{inactiveCount}</p>
                        <p className="mt-1 text-xs text-slate-400">Archived or disabled</p>
                    </div>
                </div>

                {/* Main Table */}
                <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Categories Inventory</h2>
                            <p className="text-xs text-slate-400">
                                Showing {filteredCategories.length} of {totalCount} items
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[240px]">
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
                                    placeholder="Search category name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
                            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Loading categories...
                            </p>
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-slate-900">No categories found</h3>
                            <p className="mt-1 text-xs text-slate-400">
                                {searchTerm || statusFilter !== "ALL"
                                    ? "Try adjusting your search criteria or status filter."
                                    : "Get started by creating a new category record."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3">ID</th>
                                    <th scope="col" className="px-4 py-3.5">CATEGORY NAME</th>
                                    <th scope="col" className="px-4 py-3.5 text-center">STATUS</th>
                                    <th scope="col" className="py-3.5 pl-4 pr-6 text-right">ACTIONS</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {filteredCategories.map((category) => {
                                    const isActive = category.status === "ACTIVE" || category.active === true;
                                    return (
                                        <tr key={category.id} className="transition hover:bg-slate-50/60">
                                            <td className="py-4 pl-6 pr-3 font-mono text-xs font-semibold text-slate-400">
                                                #{category.id}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div
                                                    onClick={() => router.push(`/categories/${category.id}`)}
                                                    className="group flex cursor-pointer items-center gap-3"
                                                >
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10M7 12h10M7 17h6" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                                            {category.name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400">
                                                            Click to view details
                                                        </div>
                                                    </div>
                                                </div>
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
                                                                isActive ? "bg-emerald-500" : "bg-slate-400"
                                                            }`}
                                                        />
                                                        {isActive ? "AVAILABLE" : "INACTIVE"}
                                                    </span>
                                            </td>
                                            <td className="py-4 pl-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.push(`/categories/${category.id}`)}
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600"
                                                    >
                                                        Detail
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(category)}
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(category)}
                                                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                                                            isActive
                                                                ? "border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-50"
                                                                : "border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50"
                                                        }`}
                                                    >
                                                        {isActive ? "Deactivate" : "Activate"}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 transition-all">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {editingCategory ? "Edit Category Information" : "Add New Category"}
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Manage genre and catalog classification
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeFormModal}
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
                                    Category Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Programming, Database, Science Fiction"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={closeFormModal}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-indigo-700"
                            >
                                {editingCategory ? "Save Changes" : "Create Category"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}