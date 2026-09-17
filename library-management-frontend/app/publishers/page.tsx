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

    const [formData, setFormData] = useState({ name: "", address: "", phone: "", email: "" });

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

    useEffect(() => { loadPublishers(); }, []);

    const handleToggleStatus = async (publisher: any) => {
        const isActive = publisher.status === "ACTIVE" || publisher.active === true;
        if (!confirm(isActive
            ? `Deactivate "${publisher.name}"?`
            : `Activate "${publisher.name}"?`)) return;
        try {
            isActive ? await deactivatePublisher(publisher.id) : await activatePublisher(publisher.id);
            await loadPublishers();
        } catch (error: any) {
            alert(error.message || "Failed to update publisher status");
        }
    };

    const handleCreatePublisher = async () => {
        if (!formData.name.trim()) { alert("Publisher name is required!"); return; }
        try {
            await createPublisher({ name: formData.name.trim(), address: formData.address.trim(), phone: formData.phone.trim(), email: formData.email.trim() });
            handleCloseForm();
            await loadPublishers();
        } catch (error: any) { alert(error.message || "Failed to create publisher"); }
    };

    const handleEditPublisher = (publisher: any) => {
        setEditingPublisher(publisher);
        setFormData({ name: publisher.name || "", address: publisher.address || "", phone: publisher.phone || "", email: publisher.email || "" });
        setDetailPublisher(null);
        setShowAddForm(true);
    };

    const handleUpdatePublisher = async () => {
        if (!editingPublisher || !formData.name.trim()) { alert("Publisher name is required!"); return; }
        try {
            await updatePublisher(editingPublisher.id, { name: formData.name.trim(), address: formData.address.trim(), phone: formData.phone.trim(), email: formData.email.trim() });
            handleCloseForm();
            await loadPublishers();
        } catch (error: any) { alert(error.message || "Failed to update publisher"); }
    };

    const handleCloseForm = () => {
        setShowAddForm(false);
        setEditingPublisher(null);
        setFormData({ name: "", address: "", phone: "", email: "" });
    };

    const filteredPublishers = useMemo(() => {
        return publishers.filter((p) => {
            const kw = searchTerm.toLowerCase();
            const matchesSearch = p.name?.toLowerCase().includes(kw) || p.email?.toLowerCase().includes(kw) || p.phone?.toLowerCase().includes(kw) || p.address?.toLowerCase().includes(kw);
            const isActive = p.status === "ACTIVE" || p.active === true;
            const matchesStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? isActive : !isActive);
            return matchesSearch && matchesStatus;
        });
    }, [publishers, searchTerm, statusFilter]);

    const totalCount = publishers.length;
    const activeCount = publishers.filter((p) => p.status === "ACTIVE" || p.active === true).length;
    const inactiveCount = totalCount - activeCount;

    const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200";

    return (
        <div className="min-h-screen bg-white p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Publishers</h1>
                        <p className="mt-1 text-sm text-gray-400">
                            Manage publishing houses, contact details, and catalog availability.
                        </p>
                    </div>
                    <button
                        onClick={() => { setEditingPublisher(null); setFormData({ name: "", address: "", phone: "", email: "" }); setShowAddForm(true); }}
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
                    >
                        + Add Publisher
                    </button>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
                        <p className="text-xs text-gray-400">Total Publishers</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{totalCount}</p>
                        <p className="mt-0.5 text-xs text-gray-400">Registered partner houses</p>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
                        <p className="text-xs text-gray-400">Active</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{activeCount}</p>
                        <p className="mt-0.5 text-xs text-gray-400">Available for book assignment</p>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
                        <p className="text-xs text-gray-400">Inactive</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{inactiveCount}</p>
                        <p className="mt-0.5 text-xs text-gray-400">Archived or disabled</p>
                    </div>
                </div>

                {/* ── Table Card ── */}
                <div className="overflow-hidden rounded-lg border border-gray-200">

                    {/* Search & Filter */}
                    <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Publishers Directory</p>
                            <p className="text-xs text-gray-400">Showing {filteredPublishers.length} of {totalCount}</p>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search by name, email, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 sm:w-64"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="py-16 text-center text-sm text-gray-400">Loading publishers...</div>
                    ) : filteredPublishers.length === 0 ? (
                        <div className="py-16 text-center text-sm text-gray-400">
                            No publishers found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <tr>
                                    <th className="px-5 py-3">ID</th>
                                    <th className="px-5 py-3">Name</th>
                                    <th className="px-5 py-3">Contact</th>
                                    <th className="px-5 py-3">Address</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {filteredPublishers.map((publisher) => {
                                    const isActive = publisher.status === "ACTIVE" || publisher.active === true;
                                    return (
                                        <tr key={publisher.id} className="hover:bg-gray-50 transition">
                                            <td className="px-5 py-3.5 font-mono text-xs text-gray-400">#{publisher.id}</td>

                                            <td className="px-5 py-3.5">
                                                <p
                                                    className="cursor-pointer font-medium text-gray-800 hover:text-gray-600 transition"
                                                    onClick={() => setDetailPublisher(publisher)}
                                                >
                                                    {publisher.name}
                                                </p>
                                            </td>

                                            <td className="px-5 py-3.5 text-xs text-gray-500">
                                                <p>{publisher.email || <span className="text-gray-300">—</span>}</p>
                                                <p className="font-mono">{publisher.phone || ""}</p>
                                            </td>

                                            <td className="max-w-xs truncate px-5 py-3.5 text-xs text-gray-500">
                                                {publisher.address || <span className="text-gray-300">—</span>}
                                            </td>

                                            <td className="px-5 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isActive ? "text-emerald-600" : "text-gray-400"}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
                                                        {isActive ? "Active" : "Inactive"}
                                                    </span>
                                            </td>

                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => setDetailPublisher(publisher)} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition">Detail</button>
                                                    <button onClick={() => handleEditPublisher(publisher)} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition">Edit</button>
                                                    <button
                                                        onClick={() => handleToggleStatus(publisher)}
                                                        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${isActive ? "text-red-600 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`}
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

            {/* ── Detail Modal ── */}
            {detailPublisher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <p className="font-mono text-xs text-gray-400">PUB-{String(detailPublisher.id).padStart(4, "0")}</p>
                                <h3 className="text-base font-semibold text-gray-900">{detailPublisher.name}</h3>
                            </div>
                            <button onClick={() => setDetailPublisher(null)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4 p-5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3.5">
                                    <p className="text-xs text-gray-400">Email</p>
                                    <p className="mt-1 text-sm font-medium text-gray-800 break-all">{detailPublisher.email || "—"}</p>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3.5">
                                    <p className="text-xs text-gray-400">Phone</p>
                                    <p className="mt-1 font-mono text-sm font-medium text-gray-800">{detailPublisher.phone || "—"}</p>
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3.5">
                                <p className="text-xs text-gray-400">Address</p>
                                <p className="mt-1 text-sm text-gray-700">{detailPublisher.address || "—"}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3.5">
                                    <p className="text-xs text-gray-400">Status</p>
                                    <p className="mt-1 text-sm font-medium text-gray-800">
                                        {detailPublisher.status === "ACTIVE" || detailPublisher.active === true ? "Active" : "Inactive"}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3.5">
                                    <p className="text-xs text-gray-400">Catalog Code</p>
                                    <p className="mt-1 font-mono text-sm font-medium text-gray-800">PUB-{String(detailPublisher.id).padStart(4, "0")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
                            <button
                                onClick={() => handleToggleStatus(detailPublisher)}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                    detailPublisher.status === "ACTIVE" || detailPublisher.active === true
                                        ? "text-red-600 hover:bg-red-50"
                                        : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                            >
                                {detailPublisher.status === "ACTIVE" || detailPublisher.active === true ? "Deactivate" : "Activate"}
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditPublisher(detailPublisher)} className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition">Edit</button>
                                <button onClick={() => setDetailPublisher(null)} className="rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-700 transition">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Modal ── */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">
                                    {editingPublisher ? "Edit Publisher" : "Add Publisher"}
                                </h3>
                                <p className="text-xs text-gray-400">Fill in publisher contact information</p>
                            </div>
                            <button onClick={handleCloseForm} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4 p-5">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-700">Publisher Name <span className="text-red-500">*</span></label>
                                <input type="text" placeholder="e.g. O'Reilly Media" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-700">Phone</label>
                                    <input type="text" placeholder="e.g. +1 800-998-9938" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputCls} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-700">Email</label>
                                    <input type="email" placeholder="contact@publisher.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-700">Address</label>
                                <input type="text" placeholder="Headquarters address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputCls} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
                            <button onClick={handleCloseForm} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                            <button
                                onClick={editingPublisher ? handleUpdatePublisher : handleCreatePublisher}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition"
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