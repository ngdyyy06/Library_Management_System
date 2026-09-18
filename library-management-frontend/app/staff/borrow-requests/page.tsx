"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import {
    getAllBorrowRequests,
    approveBorrowRequest,
    rejectBorrowRequest,
} from "@/app/lib/api";

interface Reader {
    id: number;
    readerCode: string;
    fullName: string;
    email?: string;
}

interface Book {
    id: number;
    title: string;
    isbn?: string;
}

interface BorrowRequest {
    id: number;
    reader: Reader;
    book: Book;
    quantity: number;
    status: string;
    requestedAt: string;
}

export default function StaffBorrowRequestsPage() {
    const router = useRouter();

    const [requests, setRequests] = useState<BorrowRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [readerSearch, setReaderSearch] = useState("");

    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    async function loadRequests() {
        try {
            setLoading(true);
            setError("");

            const data = await getAllBorrowRequests();

            setRequests(data);
        } catch (error: any) {
            console.error(
                "Failed to load borrowing requests:",
                error
            );

            setError(
                error.message ||
                "Failed to load borrowing requests"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(id: number) {
        const confirmed = window.confirm(
            "Are you sure you want to accept this borrowing request?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setApprovingId(id);
            setError("");
            setSuccess("");

            await approveBorrowRequest(id);

            window.dispatchEvent(
                new Event("borrow-request-updated")
            );

            setSuccess(
                `Borrowing request #${id} has been approved successfully.`
            );

            await loadRequests();
        } catch (error: any) {
            console.error(
                "Failed to approve borrowing request:",
                error
            );

            setError(
                error.message ||
                "Failed to approve borrowing request"
            );
        } finally {
            setApprovingId(null);
        }
    }

    async function handleReject(id: number) {
        const confirmed = window.confirm(
            "Are you sure you want to reject this borrowing request?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setRejectingId(id);
            setError("");
            setSuccess("");

            await rejectBorrowRequest(id);

            window.dispatchEvent(
                new Event("borrow-request-updated")
            );

            setSuccess(
                `Borrowing request #${id} has been rejected successfully.`
            );

            await loadRequests();
        } catch (error: any) {
            console.error(
                "Failed to reject borrowing request:",
                error
            );

            setError(
                error.message ||
                "Failed to reject borrowing request"
            );
        } finally {
            setRejectingId(null);
        }
    }

    function getStatusClass(status: string) {
        switch (status) {
            case "PENDING":
                return "border-amber-200 bg-amber-50 text-amber-700";

            case "APPROVED":
                return "border-emerald-200 bg-emerald-50 text-emerald-700";

            case "REJECTED":
                return "border-red-200 bg-red-50 text-red-700";

            case "CANCELLED":
                return "border-slate-200 bg-slate-100 text-slate-600";

            default:
                return "border-slate-200 bg-slate-50 text-slate-600";
        }
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleString("vi-VN");
    }

    const filteredRequests = useMemo(() => {
        const keyword = readerSearch.trim().toLowerCase();

        return requests.filter((request) => {
            const matchesStatus =
                statusFilter === "ALL" ||
                request.status === statusFilter;

            const readerName =
                request.reader?.fullName?.toLowerCase() || "";

            const readerCode =
                request.reader?.readerCode?.toLowerCase() || "";

            const matchesReader =
                keyword === "" ||
                readerName.includes(keyword) ||
                readerCode.includes(keyword);

            return matchesStatus && matchesReader;
        });
    }, [requests, statusFilter, readerSearch]);

    const totalRequests = requests.length;

    const pendingCount = requests.filter(
        (request) => request.status === "PENDING"
    ).length;

    const approvedCount = requests.filter(
        (request) => request.status === "APPROVED"
    ).length;

    const rejectedCount = requests.filter(
        (request) => request.status === "REJECTED"
    ).length;

    const cancelledCount = requests.filter(
        (request) => request.status === "CANCELLED"
    ).length;

    return (
        <RoleGuard allowedRoles={["LIBRARIAN", "ADMIN"]}>
            <div className="min-h-screen w-full bg-[#fafafa] p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Header */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-7">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push("/staff")
                                    }
                                    className="mb-3 text-xs font-medium text-slate-500 transition hover:text-slate-900"
                                >
                                    ← Back to Staff Dashboard
                                </button>

                                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                    Borrowing Requests
                                </h1>

                                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                    Review and manage reader borrowing requests.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                {filteredRequests.length} of{" "}
                                {totalRequests} Requests
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">

                        {/* All */}
                        <button
                            type="button"
                            onClick={() =>
                                setStatusFilter("ALL")
                            }
                            className={`rounded-xl border bg-white p-4 text-left shadow-xs transition ${
                                statusFilter === "ALL"
                                    ? "border-slate-400"
                                    : "border-slate-200/80 hover:border-slate-300"
                            }`}
                        >
                            <p className="text-xs font-medium text-slate-500">
                                All Requests
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                {totalRequests}
                            </p>
                        </button>

                        {/* Pending */}
                        <button
                            type="button"
                            onClick={() =>
                                setStatusFilter("PENDING")
                            }
                            className={`rounded-xl border bg-white p-4 text-left shadow-xs transition ${
                                statusFilter === "PENDING"
                                    ? "border-amber-300"
                                    : "border-slate-200/80 hover:border-slate-300"
                            }`}
                        >
                            <p className="text-xs font-medium text-slate-500">
                                Pending
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">
                                {pendingCount}
                            </p>
                        </button>

                        {/* Approved */}
                        <button
                            type="button"
                            onClick={() =>
                                setStatusFilter("APPROVED")
                            }
                            className={`rounded-xl border bg-white p-4 text-left shadow-xs transition ${
                                statusFilter === "APPROVED"
                                    ? "border-emerald-300"
                                    : "border-slate-200/80 hover:border-slate-300"
                            }`}
                        >
                            <p className="text-xs font-medium text-slate-500">
                                Approved
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">
                                {approvedCount}
                            </p>
                        </button>

                        {/* Rejected */}
                        <button
                            type="button"
                            onClick={() =>
                                setStatusFilter("REJECTED")
                            }
                            className={`rounded-xl border bg-white p-4 text-left shadow-xs transition ${
                                statusFilter === "REJECTED"
                                    ? "border-red-300"
                                    : "border-slate-200/80 hover:border-slate-300"
                            }`}
                        >
                            <p className="text-xs font-medium text-slate-500">
                                Rejected
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-red-600">
                                {rejectedCount}
                            </p>
                        </button>

                        {/* Cancelled */}
                        <button
                            type="button"
                            onClick={() =>
                                setStatusFilter("CANCELLED")
                            }
                            className={`rounded-xl border bg-white p-4 text-left shadow-xs transition ${
                                statusFilter === "CANCELLED"
                                    ? "border-slate-400"
                                    : "border-slate-200/80 hover:border-slate-300"
                            }`}
                        >
                            <p className="text-xs font-medium text-slate-500">
                                Cancelled
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-600">
                                {cancelledCount}
                            </p>
                        </button>
                    </div>

                    {/* Search & Filter */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

                            {/* Reader Search */}
                            <div className="flex-1">
                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                    Search Reader
                                </label>

                                <div className="relative">
                                    <svg
                                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
                                        />
                                    </svg>

                                    <input
                                        type="text"
                                        value={readerSearch}
                                        onChange={(e) =>
                                            setReaderSearch(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Search by reader name or reader code..."
                                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="w-full lg:w-52">
                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                    Status
                                </label>

                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                >
                                    <option value="ALL">
                                        All Statuses
                                    </option>

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="APPROVED">
                                        Approved
                                    </option>

                                    <option value="REJECTED">
                                        Rejected
                                    </option>

                                    <option value="CANCELLED">
                                        Cancelled
                                    </option>
                                </select>
                            </div>

                        </div>
                    </div>

                    {/* Success */}
                    {success && (
                        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            <span>{success}</span>

                            <button
                                type="button"
                                onClick={() => setSuccess("")}
                                className="ml-4 text-xs font-medium text-emerald-700 hover:text-emerald-900"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => setError("")}
                                className="ml-4 text-xs font-medium text-red-700 hover:text-red-900"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    {loading ? (
                        <div className="rounded-xl border border-slate-200/80 bg-white p-10 text-center shadow-xs">
                            <p className="text-sm text-slate-500">
                                Loading borrowing requests...
                            </p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="rounded-xl border border-slate-200/80 bg-white p-10 text-center shadow-xs">
                            <p className="text-sm font-medium text-slate-700">
                                No borrowing requests found
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Try changing the status filter or search keyword.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">

                            {/* Desktop Table */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full text-left">
                                    <thead className="border-b border-slate-200 bg-slate-50/70">
                                    <tr>
                                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            ID
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            Reader
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            Book
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            Quantity
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            Requested At
                                        </th>

                                        <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                    {filteredRequests.map(
                                        (request) => (
                                            <tr
                                                key={request.id}
                                                className="transition hover:bg-slate-50/60"
                                            >
                                                {/* ID */}
                                                <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                                    #{request.id}
                                                </td>

                                                {/* Reader */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {
                                                            request
                                                                .reader
                                                                ?.fullName
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {
                                                            request
                                                                .reader
                                                                ?.readerCode
                                                        }
                                                    </p>
                                                </td>

                                                {/* Book */}
                                                <td className="px-5 py-4">
                                                    <p className="max-w-xs truncate text-sm font-medium text-slate-900">
                                                        {
                                                            request
                                                                .book
                                                                ?.title
                                                        }
                                                    </p>

                                                    {request.book
                                                        ?.isbn && (
                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            ISBN:{" "}
                                                            {
                                                                request
                                                                    .book
                                                                    .isbn
                                                            }
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Quantity */}
                                                <td className="px-5 py-4 text-sm text-slate-700">
                                                    {
                                                        request.quantity
                                                    }
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-medium ${getStatusClass(
                                                            request.status
                                                        )}`}
                                                    >
                                                        {
                                                            request.status
                                                        }
                                                    </span>
                                                </td>

                                                {/* Requested At */}
                                                <td className="px-5 py-4 text-xs text-slate-500">
                                                    {formatDate(
                                                        request.requestedAt
                                                    )}
                                                </td>

                                                {/* Action */}
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/staff/borrow-requests/${request.id}`
                                                                )
                                                            }
                                                            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                                        >
                                                            View
                                                        </button>

                                                        {request.status ===
                                                            "PENDING" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        approvingId ===
                                                                        request.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            request.id
                                                                        )
                                                                    }
                                                                    className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    {approvingId ===
                                                                    request.id
                                                                        ? "Accepting..."
                                                                        : "Accept"}
                                                                </button>
                                                            )}

                                                        {request.status ===
                                                            "PENDING" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        rejectingId ===
                                                                        request.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleReject(
                                                                            request.id
                                                                        )
                                                                    }
                                                                    className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    {rejectingId ===
                                                                    request.id
                                                                        ? "Rejecting..."
                                                                        : "Reject"}
                                                                </button>
                                                            )}

                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="divide-y divide-slate-100 md:hidden">
                                {filteredRequests.map(
                                    (request) => (
                                        <div
                                            key={request.id}
                                            className="p-5"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        Request #
                                                        {
                                                            request.id
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {formatDate(
                                                            request.requestedAt
                                                        )}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-medium ${getStatusClass(
                                                        request.status
                                                    )}`}
                                                >
                                                    {
                                                        request.status
                                                    }
                                                </span>
                                            </div>

                                            <div className="mt-4 space-y-3">

                                                {/* Reader */}
                                                <div>
                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Reader
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                                        {
                                                            request
                                                                .reader
                                                                ?.fullName
                                                        }
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        {
                                                            request
                                                                .reader
                                                                ?.readerCode
                                                        }
                                                    </p>
                                                </div>

                                                {/* Book */}
                                                <div>
                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Book
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                                        {
                                                            request
                                                                .book
                                                                ?.title
                                                        }
                                                    </p>

                                                    {request.book
                                                        ?.isbn && (
                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            ISBN:{" "}
                                                            {
                                                                request
                                                                    .book
                                                                    .isbn
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Quantity */}
                                                <div>
                                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Quantity
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-700">
                                                        {
                                                            request.quantity
                                                        }
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 pt-1">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.push(
                                                                `/staff/borrow-requests/${request.id}`
                                                            )
                                                        }
                                                        className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                                    >
                                                        View Request
                                                    </button>

                                                    {request.status ===
                                                        "PENDING" && (
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    approvingId ===
                                                                    request.id
                                                                }
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        request.id
                                                                    )
                                                                }
                                                                className="flex-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {approvingId ===
                                                                request.id
                                                                    ? "Accepting..."
                                                                    : "Accept"}
                                                            </button>
                                                        )}

                                                    {request.status ===
                                                        "PENDING" && (
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    rejectingId ===
                                                                    request.id
                                                                }
                                                                onClick={() =>
                                                                    handleReject(
                                                                        request.id
                                                                    )
                                                                }
                                                                className="flex-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {rejectingId ===
                                                                request.id
                                                                    ? "Rejecting..."
                                                                    : "Reject"}
                                                            </button>
                                                        )}

                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}