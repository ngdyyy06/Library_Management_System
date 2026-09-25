"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import {
    getReaders,
    createReader,
    updateReader,
    activateReader,
    deactivateReader,
    getLibraryCard,
} from "@/app/lib/api";

export default function StaffReadersPage() {
    const router = useRouter();

    const [readers, setReaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

    // Add / Edit Modal state
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingReader, setEditingReader] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);

    // Page-level error
    const [error, setError] = useState("");

    // Form-level error
    const [formError, setFormError] = useState("");

    // Library Card state
    const [selectedLibraryCard, setSelectedLibraryCard] = useState<any | null>(null);
    const [showLibraryCardModal, setShowLibraryCardModal] = useState(false);
    const [loadingLibraryCard, setLoadingLibraryCard] = useState(false);

    const [formData, setFormData] = useState({
        readerCode: "",
        fullName: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
    });

    useEffect(() => {
        loadReaders();
    }, []);

    async function loadReaders() {
        try {
            setLoading(true);
            const data = await getReaders();
            setReaders(data || []);
        } catch (err: any) {
            console.error("Failed to load readers:", err);
            setError(err?.message || "Failed to load readers.");
        } finally {
            setLoading(false);
        }
    }

    function openAddModal() {
        setEditingReader(null);
        setFormData({
            readerCode: "",
            fullName: "",
            email: "",
            phone: "",
            address: "",
            dateOfBirth: "",
        });
        setFormError("");
        setShowFormModal(true);
    }

    function openEditModal(reader: any) {
        setEditingReader(reader);
        setFormData({
            readerCode: reader.readerCode || "",
            fullName: reader.fullName || "",
            email: reader.email || "",
            phone: reader.phone || "",
            address: reader.address || "",
            dateOfBirth: reader.dateOfBirth || "",
        });
        setFormError("");
        setShowFormModal(true);
    }

    function closeFormModal() {
        if (saving) return;
        setShowFormModal(false);
        setEditingReader(null);
        setFormError("");
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear form error when user starts correcting the input
        setFormError("");
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setFormError("");

        if (!formData.readerCode.trim()) {
            setFormError("Reader code is required.");
            return;
        }

        if (!formData.fullName.trim()) {
            setFormError("Full name is required.");
            return;
        }

        if (!formData.phone.trim()) {
            setFormError("Phone number is required.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                readerCode: formData.readerCode.trim(),
                fullName: formData.fullName.trim(),
                email: formData.email.trim() || undefined,
                phone: formData.phone.trim(),
                address: formData.address.trim() || undefined,
                dateOfBirth: formData.dateOfBirth || undefined,
            };

            if (editingReader) {
                await updateReader(editingReader.id, payload);
            } else {
                await createReader(payload);
            }

            await loadReaders();
            closeFormModal();
        } catch (err: any) {
            console.error("Failed to save reader:", err);
            setFormError(err?.message || "Failed to save reader.");
        } finally {
            setSaving(false);
        }
    }

    async function handleActivate(id: number) {
        if (!window.confirm("Are you sure you want to activate this reader account?")) {
            return;
        }

        try {
            setError("");
            await activateReader(id);
            await loadReaders();
        } catch (err: any) {
            setError(err?.message || "Failed to activate reader.");
        }
    }

    async function handleDeactivate(id: number) {
        if (!window.confirm("Are you sure you want to deactivate this reader account?")) {
            return;
        }

        try {
            setError("");
            await deactivateReader(id);
            await loadReaders();
        } catch (err: any) {
            setError(err?.message || "Failed to deactivate reader.");
        }
    }

    async function handleViewCard(readerId: number) {
        try {
            setError("");
            setLoadingLibraryCard(true);

            const card = await getLibraryCard(readerId);

            setSelectedLibraryCard(card);
            setShowLibraryCardModal(true);
        } catch (err: any) {
            console.error("Failed to load library card:", err);
            setError(err?.message || "Failed to load library card.");
        } finally {
            setLoadingLibraryCard(false);
        }
    }

    function closeLibraryCardModal() {
        if (loadingLibraryCard) return;

        setShowLibraryCardModal(false);
        setSelectedLibraryCard(null);
    }

    // Filter & Search Logic
    const filteredReaders = useMemo(() => {
        return readers.filter((reader) => {
            const keyword = searchTerm.trim().toLowerCase();

            const matchesSearch =
                !keyword ||
                reader.readerCode?.toLowerCase().includes(keyword) ||
                reader.fullName?.toLowerCase().includes(keyword) ||
                reader.email?.toLowerCase().includes(keyword) ||
                reader.phone?.toLowerCase().includes(keyword);

            const matchesStatus =
                statusFilter === "ALL" || reader.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [readers, searchTerm, statusFilter]);

    // Metric Calculations
    const totalReaders = readers.length;
    const activeReaders = readers.filter((r) => r.status === "ACTIVE").length;
    const inactiveReaders = readers.filter((r) => r.status === "INACTIVE").length;

    return (
        <RoleGuard allowedRoles={["LIBRARIAN", "ADMIN"]}>
            <div className="min-h-screen w-full bg-[#fafafa] p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* ── Page Header ── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                    Readers Directory
                                </h1>

                                <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs">
                                    Patrons
                                </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                Manage library patron records, contact information, and borrowing eligibility.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openAddModal}
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
                                    strokeWidth={1.5}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>

                            Add Reader
                        </button>
                    </div>

                    {/* ── Page-level Error Banner ── */}
                    {error && (
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
                                        strokeWidth={1.5}
                                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                    />
                                </svg>

                                <span>{error}</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setError("")}
                                className="text-xs font-medium text-rose-600 hover:text-rose-800"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* ── 3-Metric Statistics Strip ── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                        {/* Total Readers */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">
                                Total Readers
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                {totalReaders}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                                All registered patrons
                            </p>
                        </div>

                        {/* Active Readers */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">
                                Active Readers
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">
                                {activeReaders}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                                Eligible for borrowing
                            </p>
                        </div>

                        {/* Inactive Readers */}
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <p className="text-xs font-medium text-slate-500">
                                Inactive Readers
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-600">
                                {inactiveReaders}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                                Suspended or locked
                            </p>
                        </div>
                    </div>

                    {/* ── Main Container: Search, Filter & Table ── */}
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
                                            strokeWidth={1.5}
                                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                        />
                                    </svg>

                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by code, name, email, or phone number..."
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                    />
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value as "ALL" | "ACTIVE" | "INACTIVE"
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Table View */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                                <p className="mt-3 text-xs text-slate-500">
                                    Loading readers directory...
                                </p>
                            </div>
                        ) : filteredReaders.length === 0 ? (
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
                                            strokeWidth={1.5}
                                            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                        />
                                    </svg>
                                </div>

                                <p className="mt-3 text-sm font-medium text-slate-800">
                                    No readers found
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    No patron records match your search or filter criteria.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] border-collapse text-left">
                                    <thead className="border-b border-slate-100 bg-slate-50/50">
                                    <tr>
                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Reader Code
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Full Name
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Email
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Phone Number
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                    {filteredReaders.map((reader) => (
                                        <tr
                                            key={reader.id}
                                            className="transition-colors hover:bg-slate-50/70"
                                        >
                                            <td className="px-5 py-3.5">
                                                    <span className="font-mono text-xs font-semibold text-slate-700">
                                                        {reader.readerCode}
                                                    </span>
                                            </td>

                                            <td className="px-5 py-3.5 font-medium text-slate-900">
                                                {reader.fullName}
                                            </td>

                                            <td className="px-5 py-3.5 text-slate-600">
                                                {reader.email || "—"}
                                            </td>

                                            <td className="px-5 py-3.5 text-slate-600">
                                                {reader.phone || "—"}
                                            </td>

                                            <td className="px-5 py-3.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            reader.status === "ACTIVE"
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                reader.status === "ACTIVE"
                                                                    ? "bg-emerald-500"
                                                                    : "bg-slate-400"
                                                            }`}
                                                        />

                                                        {reader.status === "ACTIVE"
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                            </td>

                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">

                                                    {/* Dedicated Detail Page Navigation */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.push(
                                                                `/staff/readers/${reader.id}`
                                                            )
                                                        }
                                                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        Details
                                                    </button>

                                                    {/* Library Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewCard(reader.id)}
                                                        disabled={loadingLibraryCard}
                                                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        View Card
                                                    </button>

                                                    {/* In-Page Edit Modal Trigger */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(reader)}
                                                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        Edit
                                                    </button>

                                                    {/* Activate / Deactivate Action */}
                                                    {reader.status === "ACTIVE" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeactivate(reader.id)
                                                            }
                                                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 shadow-2xs transition hover:bg-rose-50"
                                                        >
                                                            Deactivate
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleActivate(reader.id)
                                                            }
                                                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-emerald-600 shadow-2xs transition hover:bg-emerald-50"
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
                    </div>

                    {/* ── Library Card Modal ── */}
                    {showLibraryCardModal && selectedLibraryCard && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]">
                            <div className="w-full max-w-md rounded-xl border border-slate-200/80 bg-white shadow-xl">

                                {/* Modal Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Library Card
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Reader identification card
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeLibraryCardModal}
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
                                                strokeWidth={1.5}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {/* Card Preview */}
                                <div className="p-6">
                                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    Library Card
                                                </p>

                                                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                                                    Library Membership
                                                </h3>
                                            </div>

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                                                    selectedLibraryCard.status === "ACTIVE"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {selectedLibraryCard.status}
                                            </span>
                                        </div>

                                        <div className="mt-5 space-y-3">

                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                                    Card Number
                                                </p>

                                                <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                                                    {selectedLibraryCard.cardNumber}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                                    Reader Code
                                                </p>

                                                <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                                                    {selectedLibraryCard.reader?.readerCode || "—"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                                    Full Name
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-900">
                                                    {selectedLibraryCard.reader?.fullName || "—"}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                                        Issued
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-700">
                                                        {selectedLibraryCard.issuedAt || "—"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                                        Expires
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-700">
                                                        {selectedLibraryCard.expiredAt || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex justify-end border-t border-slate-100 px-6 py-3.5">
                                    <button
                                        type="button"
                                        onClick={closeLibraryCardModal}
                                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Add / Edit Reader Modal ── */}
                    {showFormModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]">
                            <div className="w-full max-w-xl rounded-xl border border-slate-200/80 bg-white shadow-xl">

                                {/* Modal Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            {editingReader
                                                ? "Edit Reader Profile"
                                                : "Register New Reader"}
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {editingReader
                                                ? "Update patron information and contact records."
                                                : "Enter details to create a new reader in the library system."}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeFormModal}
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
                                                strokeWidth={1.5}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit}>

                                    {/* Form Error */}
                                    {formError && (
                                        <div className="mx-6 mt-6 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-3 text-xs text-rose-700 sm:text-sm">
                                            <svg
                                                className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                                />
                                            </svg>

                                            <span>{formError}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">

                                        {/* Reader Code */}
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                                Reader Code{" "}
                                                <span className="text-rose-500">*</span>
                                            </label>

                                            <input
                                                type="text"
                                                name="readerCode"
                                                value={formData.readerCode}
                                                onChange={handleChange}
                                                placeholder="e.g. RD-2026-001"
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                            />
                                        </div>

                                        {/* Full Name */}
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                                Full Name{" "}
                                                <span className="text-rose-500">*</span>
                                            </label>

                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="Enter full legal name"
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                                Email Address
                                            </label>

                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="patron@example.com"
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                                Phone Number{" "}
                                                <span className="text-rose-500">*</span>
                                            </label>

                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="e.g. 0901234567"
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                            />
                                        </div>

                                        {/* Date of Birth */}
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                                Date of Birth
                                            </label>

                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                            />
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                                Residential Address
                                            </label>

                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="e.g. 123 Main St, District 1"
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Modal Actions */}
                                    <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-3.5">
                                        <button
                                            type="button"
                                            onClick={closeFormModal}
                                            disabled={saving}
                                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                                        >
                                            {saving && (
                                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            )}

                                            {saving
                                                ? "Saving..."
                                                : editingReader
                                                    ? "Save Changes"
                                                    : "Create Reader"}
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