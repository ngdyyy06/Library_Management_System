"use client";

import { useEffect, useMemo, useState } from "react";
import {
    getAuthors,
    createAuthor,
    updateAuthor,
    activateAuthor,
    deactivateAuthor,
} from "../lib/api";

export default function AuthorsPage() {
    const [authors, setAuthors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "ALL" | "ACTIVE" | "INACTIVE"
    >("ALL");

    const [formData, setFormData] = useState({
        name: "",
        biography: "",
    });

    useEffect(() => {
        loadAuthors();
    }, []);

    const loadAuthors = async () => {
        try {
            setLoading(true);
            const data = await getAuthors();
            setAuthors(data || []);
        } catch (error) {
            console.error("Failed to load authors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAuthor = async () => {
        if (!formData.name.trim()) {
            alert("Please enter author name!");
            return;
        }

        try {
            await createAuthor({
                name: formData.name.trim(),
                biography: formData.biography.trim(),
            });

            setShowAddForm(false);
            setFormData({ name: "", biography: "" });
            await loadAuthors();
        } catch (error) {
            console.error("Failed to create author:", error);
            alert("Failed to create author. Please try again!");
        }
    };

    const handleUpdateAuthor = async () => {
        if (!editingAuthor || !formData.name.trim()) {
            alert("Please enter author name!");
            return;
        }

        try {
            await updateAuthor(editingAuthor.id, {
                name: formData.name.trim(),
                biography: formData.biography.trim(),
            });

            setEditingAuthor(null);
            setFormData({ name: "", biography: "" });
            await loadAuthors();
        } catch (error) {
            console.error("Failed to update author:", error);
            alert("Failed to update author details!");
        }
    };

    const handleToggleStatus = async (author: any) => {
        const isActive =
            author.status === "ACTIVE" || author.active === true;

        const confirmMsg = isActive
            ? `Are you sure you want to deactivate author "${author.name}"?`
            : `Are you sure you want to activate author "${author.name}"?`;

        if (!confirm(confirmMsg)) return;

        try {
            if (isActive) {
                await deactivateAuthor(author.id);
            } else {
                await activateAuthor(author.id);
            }

            await loadAuthors();
        } catch (error) {
            console.error("Failed to toggle author status:", error);
            alert("Action failed. Please try again!");
        }
    };

    const startEditing = (author: any) => {
        setEditingAuthor(author);
        setFormData({
            name: author.name || "",
            biography: author.biography || "",
        });
        setShowAddForm(true);
    };

    const closeFormModal = () => {
        setShowAddForm(false);
        setEditingAuthor(null);
        setFormData({ name: "", biography: "" });
    };

    const filteredAuthors = useMemo(() => {
        return authors.filter((author) => {
            const matchesSearch =
                author.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                author.biography
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const isActive =
                author.status === "ACTIVE" || author.active === true;

            let matchesStatus = true;

            if (statusFilter === "ACTIVE") {
                matchesStatus = isActive;
            }

            if (statusFilter === "INACTIVE") {
                matchesStatus = !isActive;
            }

            return matchesSearch && matchesStatus;
        });
    }, [authors, searchTerm, statusFilter]);

    const totalCount = authors.length;

    const activeCount = authors.filter(
        (author) =>
            author.status === "ACTIVE" || author.active === true
    ).length;

    const inactiveCount = totalCount - activeCount;

    return (
        <div className="min-h-screen w-full bg-[#f7f8fa] p-6 font-sans lg:p-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                            <span>Library</span>
                            <span>/</span>
                            <span className="font-medium text-slate-700">
                                Authors
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Authors
                            </h1>

                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                Writers Directory
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage authors, biographies, and activity status.
                        </p>
                    </div>

                    {/* Primary Action */}
                    <button
                        type="button"
                        onClick={() => {
                            setEditingAuthor(null);
                            setFormData({
                                name: "",
                                biography: "",
                            });
                            setShowAddForm(true);
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[0.98]"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                        </svg>
                        Add Author
                    </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* Total */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Total Authors
                            </p>

                            <span className="h-2 w-2 rounded-full bg-slate-900" />
                        </div>

                        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                            {totalCount}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Registered creators in catalog
                        </p>
                    </div>

                    {/* Active */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Active Authors
                            </p>

                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>

                        <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-600">
                            {activeCount}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Available for book assignment
                        </p>
                    </div>

                    {/* Inactive */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Inactive Authors
                            </p>

                            <span className="h-2 w-2 rounded-full bg-slate-400" />
                        </div>

                        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-700">
                            {inactiveCount}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Archived or disabled
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Table Header */}
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Authors Inventory
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                                Showing {filteredAuthors.length} of{" "}
                                {totalCount} authors
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">

                            {/* Search */}
                            <div className="relative w-full sm:w-64">
                                <svg
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                                    placeholder="Search authors..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
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
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
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

                    {/* Loading */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

                            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-400">
                                Loading authors...
                            </p>
                        </div>
                    ) : filteredAuthors.length === 0 ? (

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
                                    <path d="M15 21a6 6 0 0 0-12 0" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M16 3.5a4 4 0 0 1 0 7.5" />
                                    <path d="M18 14a6 6 0 0 1 3 5" />
                                </svg>
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                No Authors Found
                            </h3>

                            <p className="mt-1 max-w-sm text-xs text-slate-400">
                                {searchTerm ||
                                statusFilter !== "ALL"
                                    ? "Try adjusting your search criteria or status filter."
                                    : "Get started by creating a new author record."}
                            </p>
                        </div>
                    ) : (

                        /* Table */
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50/60">
                                <tr>
                                    <th
                                        scope="col"
                                        className="w-20 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                                    >
                                        ID
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                                    >
                                        Author
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                                    >
                                        Biography
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                                    >
                                        Status
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                                    >
                                        Actions
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {filteredAuthors.map((author) => {
                                    const isActive =
                                        author.status === "ACTIVE" ||
                                        author.active === true;

                                    return (
                                        <tr
                                            key={author.id}
                                            className="group transition-colors hover:bg-slate-50/60"
                                        >
                                            {/* ID */}
                                            <td className="px-6 py-4 align-middle">
                                                    <span className="font-mono text-xs font-medium text-slate-400">
                                                        #{author.id}
                                                    </span>
                                            </td>

                                            {/* Author */}
                                            <td className="px-4 py-4 align-middle">
                                                <div
                                                    onClick={() =>
                                                        (window.location.href = `/authors/${author.id}`)
                                                    }
                                                    className="group/author flex cursor-pointer items-center gap-3"
                                                >
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition-colors group-hover/author:border-slate-300 group-hover/author:bg-white group-hover/author:text-slate-900">
                                                        <svg
                                                            className="h-5 w-5"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <circle
                                                                cx="12"
                                                                cy="8"
                                                                r="3.5"
                                                            />
                                                            <path d="M5 21a7 7 0 0 1 14 0" />
                                                        </svg>
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover/author:text-slate-600">
                                                            {author.name}
                                                        </div>

                                                        <div className="mt-0.5 text-[11px] text-slate-400">
                                                            Click to view details
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Biography */}
                                            <td className="max-w-md px-4 py-4 align-middle">
                                                {author.biography ? (
                                                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                                                        {author.biography}
                                                    </p>
                                                ) : (
                                                    <span className="text-xs italic text-slate-400">
                                                            No biography provided
                                                        </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4 text-center align-middle">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
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
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-center justify-end gap-1.5">

                                                    {/* Detail */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            (window.location.href = `/authors/${author.id}`)
                                                        }
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                                    >
                                                        Detail
                                                    </button>

                                                    {/* Edit */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEditing(author)
                                                        }
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                                    >
                                                        Edit
                                                    </button>

                                                    {/* Activate / Deactivate */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                author
                                                            )
                                                        }
                                                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 ${
                                                            isActive
                                                                ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 focus:ring-rose-500/10"
                                                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-500/10"
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

            {/* Add / Edit Author Modal */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Author Record
                                </p>

                                <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                                    {editingAuthor
                                        ? "Edit Author Information"
                                        : "Add New Author"}
                                </h3>

                                <p className="mt-1 text-xs text-slate-400">
                                    Fill in the author name and biography.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeFormModal}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                aria-label="Close modal"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="m6 6 12 12" />
                                    <path d="m18 6-12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-5 px-6 py-6">

                            {/* Author Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Author Name{" "}
                                    <span className="text-rose-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter author name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                                />
                            </div>

                            {/* Biography */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Biography
                                </label>

                                <textarea
                                    rows={5}
                                    placeholder="Write a brief overview of the author's background and notable achievements..."
                                    value={formData.biography}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            biography: e.target.value,
                                        })
                                    }
                                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-xs leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4">

                            {/* Cancel */}
                            <button
                                type="button"
                                onClick={closeFormModal}
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 active:scale-[0.98]"
                            >
                                Cancel
                            </button>

                            {/* Create / Save */}
                            <button
                                type="button"
                                onClick={
                                    editingAuthor
                                        ? handleUpdateAuthor
                                        : handleCreateAuthor
                                }
                                className="inline-flex h-10 items-center justify-center rounded-lg bg-black px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[0.98]"
                            >
                                {editingAuthor
                                    ? "Save Changes"
                                    : "Create Author"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}