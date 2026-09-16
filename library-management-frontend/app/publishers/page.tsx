"use client";

import { useEffect, useState, useMemo } from "react";
import {
    getPublishers,
    deactivatePublisher,
    activatePublisher,
    createPublisher,
    updatePublisher,
} from "../lib/api";

export default function PublishersPage() {
    const [publishers, setPublishers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPublisher, setEditingPublisher] = useState<any | null>(null);
    const [detailPublisher, setDetailPublisher] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
    });

    const loadPublishers = async () => {
        try {
            setLoading(true);
            const data = await getPublishers();
            setPublishers(data || []);

            if (detailPublisher) {
                const updated = data?.find((p: any) => p.id === detailPublisher.id);
                if (updated) setDetailPublisher(updated);
            }
        } catch (error) {
            console.error("Failed to load publishers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPublishers();
    }, []);

    const handleToggleStatus = async (publisher: any) => {
        const isActive = publisher.status === "ACTIVE" || publisher.active === true;
        const confirmMsg = isActive
            ? `Are you sure you want to deactivate publisher "${publisher.name}"?`
            : `Are you sure you want to activate publisher "${publisher.name}"?`;

        if (!confirm(confirmMsg)) return;

        try {
            if (isActive) {
                await deactivatePublisher(publisher.id);
            } else {
                await activatePublisher(publisher.id);
            }
            await loadPublishers();
        } catch (error: any) {
            alert(error.message || "Failed to update publisher status");
        }
    };

    const handleCreatePublisher = async () => {
        if (!formData.name.trim()) {
            alert("Please enter publisher name!");
            return;
        }

        try {
            await createPublisher({
                name: formData.name.trim(),
                address: formData.address.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
            });

            handleCloseForm();
            await loadPublishers();
        } catch (error: any) {
            alert(error.message || "Failed to create publisher");
        }
    };

    const handleEditPublisher = (publisher: any) => {
        setEditingPublisher(publisher);
        setFormData({
            name: publisher.name || "",
            address: publisher.address || "",
            phone: publisher.phone || "",
            email: publisher.email || "",
        });
        setDetailPublisher(null);
        setShowAddForm(true);
    };

    const handleUpdatePublisher = async () => {
        if (!editingPublisher || !formData.name.trim()) {
            alert("Please enter publisher name!");
            return;
        }

        try {
            await updatePublisher(editingPublisher.id, {
                name: formData.name.trim(),
                address: formData.address.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
            });

            handleCloseForm();
            await loadPublishers();
        } catch (error: any) {
            alert(error.message || "Failed to update publisher");
        }
    };

    const handleCloseForm = () => {
        setShowAddForm(false);
        setEditingPublisher(null);
        setFormData({
            name: "",
            address: "",
            phone: "",
            email: "",
        });
    };

    // Filter publishers by search and status
    const filteredPublishers = useMemo(() => {
        return publishers.filter((publisher) => {
            const keyword = searchTerm.toLowerCase();

            const matchesSearch =
                publisher.name?.toLowerCase().includes(keyword) ||
                publisher.email?.toLowerCase().includes(keyword) ||
                publisher.phone?.toLowerCase().includes(keyword) ||
                publisher.address?.toLowerCase().includes(keyword);

            const isActive = publisher.status === "ACTIVE" || publisher.active === true;

            let matchesStatus = true;
            if (statusFilter === "ACTIVE") matchesStatus = isActive;
            if (statusFilter === "INACTIVE") matchesStatus = !isActive;

            return matchesSearch && matchesStatus;
        });
    }, [publishers, searchTerm, statusFilter]);

    // Metric Calculations
    const totalCount = publishers.length;
    const activeCount = publishers.filter((p) => p.status === "ACTIVE" || p.active === true).length;
    const inactiveCount = totalCount - activeCount;

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] p-6 lg:p-8 font-sans">
            <div className="w-full space-y-6">

                {/* Header & Quick Action */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Publishers
                            </h1>
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                                Publishing Houses
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage publishing houses, distribution partners, contact details, and catalog availability.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setEditingPublisher(null);
                            setFormData({
                                name: "",
                                address: "",
                                phone: "",
                                email: "",
                            });
                            setShowAddForm(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                         Add Publisher
                    </button>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Total Card */}
                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                TOTAL PUBLISHERS
                            </span>
                            <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                        </div>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{totalCount}</p>
                        <p className="mt-1 text-xs text-slate-400">Registered partner houses</p>
                    </div>

                    {/* Active Card */}
                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                                ACTIVE PUBLISHERS
                            </span>
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <p className="mt-2 text-3xl font-bold text-emerald-600">{activeCount}</p>
                        <p className="mt-1 text-xs text-slate-400">Available for book assignment</p>
                    </div>

                    {/* Inactive Card */}
                    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                                INACTIVE PUBLISHERS
                            </span>
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        </div>
                        <p className="mt-2 text-3xl font-bold text-amber-600">{inactiveCount}</p>
                        <p className="mt-1 text-xs text-slate-400">Archived or disabled</p>
                    </div>
                </div>

                {/* Main Table Container Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">

                    {/* Inner Header with Search & Filters */}
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Publishers Directory</h2>
                            <p className="text-xs text-slate-400">
                                Showing {filteredPublishers.length} of {totalCount} items
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search Box */}
                            <div className="relative min-w-[260px]">
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
                                    placeholder="Search by name, email, phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            {/* Status Filter */}
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

                    {/* Table View */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
                            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Loading publishers...</p>
                        </div>
                    ) : filteredPublishers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-slate-900">No publishers found</h3>
                            <p className="mt-1 text-xs text-slate-400">
                                {searchTerm || statusFilter !== "ALL"
                                    ? "Try adjusting your search criteria or status filter."
                                    : "Get started by adding a new publisher to the catalog."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3">ID</th>
                                    <th scope="col" className="px-4 py-3.5">PUBLISHER NAME</th>
                                    <th scope="col" className="px-4 py-3.5">CONTACT INFO</th>
                                    <th scope="col" className="px-4 py-3.5">ADDRESS</th>
                                    <th scope="col" className="px-4 py-3.5 text-center">STATUS</th>
                                    <th scope="col" className="py-3.5 pl-4 pr-6 text-right">ACTIONS</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {filteredPublishers.map((publisher) => {
                                    const isActive = publisher.status === "ACTIVE" || publisher.active === true;
                                    return (
                                        <tr key={publisher.id} className="transition hover:bg-slate-50/60">
                                            <td className="py-4 pl-6 pr-3 font-mono text-xs font-semibold text-slate-400">
                                                #{publisher.id}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div
                                                    onClick={() => setDetailPublisher(publisher)}
                                                    className="group flex cursor-pointer items-center gap-3"
                                                >
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition text-sm">
                                                            {publisher.name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400">
                                                            Click to view details
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-xs">
                                                <div className="space-y-0.5">
                                                    <div className="font-medium text-slate-700">
                                                        {publisher.email || <span className="italic text-slate-400">No email</span>}
                                                    </div>
                                                    <div className="font-mono text-[11px] text-slate-400">
                                                        {publisher.phone || "No phone"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="max-w-xs px-4 py-4 text-xs text-slate-500 truncate">
                                                {publisher.address || <span className="italic text-slate-400">—</span>}
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
                                                        onClick={() => setDetailPublisher(publisher)}
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600"
                                                    >
                                                        Detail
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditPublisher(publisher)}
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(publisher)}
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

            {/* ========================================================= */}
            {/* PUBLISHER DETAIL DOSSIER MODAL                           */}
            {/* ========================================================= */}
            {detailPublisher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5 transition-all">
                        {/* Header Dossier */}
                        <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white">
                            <button
                                onClick={() => setDetailPublisher(null)}
                                className="absolute right-4 top-4 rounded-xl bg-white/10 p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white shadow-inner backdrop-blur-md">
                                    {detailPublisher.name ? detailPublisher.name.charAt(0).toUpperCase() : "P"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-200">
                                        PUBLISHER ID: #{detailPublisher.id}
                                    </span>
                                    <h3 className="truncate text-xl font-bold text-white">
                                        {detailPublisher.name}
                                    </h3>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                detailPublisher.status === "ACTIVE" || detailPublisher.active === true
                                                    ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/30"
                                                    : "bg-white/20 text-slate-200 ring-1 ring-white/30"
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    detailPublisher.status === "ACTIVE" || detailPublisher.active === true
                                                        ? "bg-emerald-400"
                                                        : "bg-slate-300"
                                                }`}
                                            />
                                            {detailPublisher.status === "ACTIVE" || detailPublisher.active === true
                                                ? "ACTIVE"
                                                : "INACTIVE"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dossier Body */}
                        <div className="space-y-4 p-6">
                            {/* Contact Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5">
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Email Address</span>
                                    <p className="mt-1 text-xs font-bold text-slate-800 break-all">
                                        {detailPublisher.email || "—"}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5">
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Phone Number</span>
                                    <p className="mt-1 font-mono text-xs font-bold text-slate-800">
                                        {detailPublisher.phone || "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Address Card */}
                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Headquarters Address
                                </h4>
                                <div className="mt-2 rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
                                    {detailPublisher.address ? (
                                        <p>{detailPublisher.address}</p>
                                    ) : (
                                        <p className="italic text-slate-400">
                                            No office address has been provided for this publisher.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Meta Codes */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5">
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase">System Status</span>
                                    <p className="mt-1 text-xs font-bold text-slate-800">
                                        {detailPublisher.status === "ACTIVE" || detailPublisher.active === true
                                            ? "Active & Available"
                                            : "Disabled / Archived"}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5">
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Catalog Code</span>
                                    <p className="mt-1 font-mono text-xs font-bold text-slate-800">
                                        PUB-{String(detailPublisher.id).padStart(4, "0")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dossier Footer Actions */}
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => handleToggleStatus(detailPublisher)}
                                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                    detailPublisher.status === "ACTIVE" || detailPublisher.active === true
                                        ? "text-rose-600 hover:bg-rose-50"
                                        : "text-emerald-700 hover:bg-emerald-50"
                                }`}
                            >
                                {detailPublisher.status === "ACTIVE" || detailPublisher.active === true
                                    ? "Deactivate Publisher"
                                    : "Activate Publisher"}
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleEditPublisher(detailPublisher)}
                                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600"
                                >
                                    Edit Details
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDetailPublisher(null)}
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-indigo-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* ADD / EDIT PUBLISHER MODAL FORM                          */}
            {/* ========================================================= */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 transition-all">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {editingPublisher ? "Edit Publisher Information" : "Add New Publisher"}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Fill in publishing house profile and contact information
                                </p>
                            </div>
                            <button
                                onClick={handleCloseForm}
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
                                    Publisher Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. O'Reilly Media, Pearson, NXB Trẻ"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. +1 800-998-9938"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="contact@publisher.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">
                                    Headquarters Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 1005 Gravenstein Highway North, Sebastopol, CA"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={handleCloseForm}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={editingPublisher ? handleUpdatePublisher : handleCreatePublisher}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-indigo-700"
                            >
                                {editingPublisher ? "Save Changes" : "Create Publisher"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}