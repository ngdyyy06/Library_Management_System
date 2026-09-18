"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    cancelBorrowRequest,
    getMyBorrowRequests,
} from "@/app/lib/api";

type BorrowRequest = {
    id: number;
    quantity: number;
    status: string;
    requestedAt: string;
    rejectionReason: string | null;
    book: {
        id: number;
        title: string;
        isbn: string;
        price: number;
        availableQuantity: number;
        status: string;
    };
};

export default function BorrowingRequestsPage() {
    const router = useRouter();

    const [requests, setRequests] = useState<BorrowRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    async function loadRequests() {
        try {
            setLoading(true);
            setError("");

            const data = await getMyBorrowRequests();

            setRequests(data);
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to load borrowing requests.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(id: number) {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this borrowing request?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setCancellingId(id);
            setError("");
            setSuccessMessage("");

            await cancelBorrowRequest(id);

            setSuccessMessage(
                "Borrowing request cancelled successfully."
            );

            await loadRequests();
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to cancel borrowing request.");
            }
        } finally {
            setCancellingId(null);
        }
    }

    function getStatusClass(status: string) {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-700";

            case "APPROVED":
                return "bg-green-100 text-green-700";

            case "REJECTED":
                return "bg-red-100 text-red-700";

            case "CANCELLED":
                return "bg-gray-100 text-gray-600";

            default:
                return "bg-gray-100 text-gray-600";
        }
    }

    function formatDateTime(dateString: string) {
        if (!dateString) {
            return "-";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                            Borrowing Requests
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            View and manage your borrowing requests.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/reader/books")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
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

                        Add Request
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="shrink-0 font-medium text-red-700 hover:text-red-900"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Success */}
                {successMessage && (
                    <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        <p>{successMessage}</p>

                        <button
                            type="button"
                            onClick={() => setSuccessMessage("")}
                            className="shrink-0 font-medium text-green-700 hover:text-green-900"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />

                        <p className="mt-4 text-sm text-gray-500">
                            Loading borrowing requests...
                        </p>
                    </div>
                ) : requests.length === 0 ? (
                    /* Empty state */
                    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <svg
                                className="h-7 w-7 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.7}
                                    d="M8 7.5h8M8 11.5h5M6.75 4.5h10.5A1.75 1.75 0 0 1 19 6.25v11.5a1.75 1.75 0 0 1-1.75 1.75H6.75A1.75 1.75 0 0 1 5 17.75V6.25A1.75 1.75 0 0 1 6.75 4.5Z"
                                />
                            </svg>
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-gray-900">
                            No borrowing requests
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                            You have not submitted any borrowing requests yet.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                router.push("/reader/books")
                            }
                            className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Browse Books
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1050px]">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Request
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Book
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Quantity
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Requested At
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Action
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                    {requests.map((request) => {
                                        const isCancelling =
                                            cancellingId === request.id;

                                        return (
                                            <tr
                                                key={request.id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                {/* Request */}
                                                <td className="px-6 py-5">
                                                    <p className="font-semibold text-gray-900">
                                                        #{request.id}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Borrow request
                                                    </p>
                                                </td>

                                                {/* Book */}
                                                <td className="px-6 py-5">
                                                    <p className="font-medium text-gray-900">
                                                        {request.book.title}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        ISBN:{" "}
                                                        {request.book.isbn}
                                                    </p>
                                                </td>

                                                {/* Quantity */}
                                                <td className="px-6 py-5 text-sm text-gray-700">
                                                    {request.quantity}
                                                </td>

                                                {/* Requested At */}
                                                <td className="px-6 py-5 text-sm text-gray-700">
                                                    {formatDateTime(
                                                        request.requestedAt
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                            request.status
                                                        )}`}
                                                    >
                                                        {request.status}
                                                    </span>

                                                    {request.rejectionReason && (
                                                        <p className="mt-2 max-w-xs text-xs text-red-600">
                                                            {
                                                                request.rejectionReason
                                                            }
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Action */}
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/reader/borrowings/request/${request.id}`
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                                        >
                                                            Detail
                                                        </button>

                                                        {request.status ===
                                                            "PENDING" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        isCancelling
                                                                    }
                                                                    onClick={() =>
                                                                        handleCancel(
                                                                            request.id
                                                                        )
                                                                    }
                                                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    {isCancelling
                                                                        ? "Cancelling..."
                                                                        : "Cancel"}
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
                        </div>

                        {/* Mobile */}
                        <div className="space-y-4 md:hidden">
                            {requests.map((request) => {
                                const isCancelling =
                                    cancellingId === request.id;

                                return (
                                    <div
                                        key={request.id}
                                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                    Request
                                                </p>

                                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                                    #{request.id}
                                                </p>
                                            </div>

                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                    request.status
                                                )}`}
                                            >
                                                {request.status}
                                            </span>
                                        </div>

                                        {/* Book */}
                                        <div className="mt-5">
                                            <p className="text-xs text-gray-500">
                                                Book
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">
                                                {request.book.title}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                ISBN: {request.book.isbn}
                                            </p>
                                        </div>

                                        {/* Information */}
                                        <div className="mt-5 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Quantity
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    {request.quantity}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Requested At
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    {formatDateTime(
                                                        request.requestedAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Rejection reason */}
                                        {request.rejectionReason && (
                                            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                                <p className="text-xs font-medium text-red-700">
                                                    Rejection reason
                                                </p>

                                                <p className="mt-1 text-sm text-red-600">
                                                    {
                                                        request.rejectionReason
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/reader/borrowings/requests/${request.id}`
                                                    )
                                                }
                                                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                            >
                                                View Detail
                                            </button>

                                            {request.status === "PENDING" && (
                                                <button
                                                    type="button"
                                                    disabled={isCancelling}
                                                    onClick={() =>
                                                        handleCancel(
                                                            request.id
                                                        )
                                                    }
                                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isCancelling
                                                        ? "Cancelling..."
                                                        : "Cancel Request"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}