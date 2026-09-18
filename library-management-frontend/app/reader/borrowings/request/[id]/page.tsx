"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    cancelBorrowRequest,
    getMyBorrowRequestById,
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

export default function BorrowRequestDetailPage() {
    const router = useRouter();
    const params = useParams();

    const requestId = Number(params.id);

    const [request, setRequest] = useState<BorrowRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!requestId || Number.isNaN(requestId)) {
            setError("Invalid borrowing request.");
            setLoading(false);
            return;
        }

        loadRequest();
    }, [requestId]);

    async function loadRequest() {
        try {
            setLoading(true);
            setError("");

            const data =
                await getMyBorrowRequestById(requestId);

            setRequest(data);
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to load borrowing request."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel() {
        if (!request) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to cancel this borrowing request?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setCancelling(true);
            setError("");
            setSuccessMessage("");

            const updatedRequest =
                await cancelBorrowRequest(request.id);

            setRequest(updatedRequest);

            setSuccessMessage(
                "Borrowing request cancelled successfully."
            );
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to cancel borrowing request."
                );
            }
        } finally {
            setCancelling(false);
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

    function formatPrice(price: number) {
        return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />

                        <p className="mt-4 text-sm text-gray-500">
                            Loading borrowing request...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !request) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/reader/borrowings/requests"
                            )
                        }
                        className="mb-5 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                    >
                        ← Back to Borrowing Requests
                    </button>

                    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!request) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            "/reader/borrowings/requests"
                        )
                    }
                    className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    ← Back to Borrowing Requests
                </button>

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            Borrowing Request
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                            Request #{request.id}
                        </h1>
                    </div>

                    <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            request.status
                        )}`}
                    >
                        {request.status}
                    </span>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {successMessage}
                    </div>
                )}

                <div className="space-y-5">
                    {/* Book information */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Book Information
                            </h2>
                        </div>

                        <div className="px-5 py-6 sm:px-6">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xl font-semibold text-gray-900">
                                        {request.book.title}
                                    </p>

                                    <p className="mt-2 text-sm text-gray-500">
                                        ISBN: {request.book.isbn}
                                    </p>
                                </div>

                                <span
                                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                                        request.book.status ===
                                        "ACTIVE"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    {request.book.status}
                                </span>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-xs text-gray-500">
                                        Requested quantity
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                        {request.quantity}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-xs text-gray-500">
                                        Available copies
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                        {
                                            request.book
                                                .availableQuantity
                                        }
                                    </p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-xs text-gray-500">
                                        Book price
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                        {formatPrice(
                                            request.book.price
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Request information */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Request Information
                            </h2>
                        </div>

                        <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-6">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Request ID
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    #{request.id}
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
                                    Status
                                </p>

                                <span
                                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                        request.status
                                    )}`}
                                >
                                    {request.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Rejection reason */}
                    {request.rejectionReason && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 shadow-sm">
                            <div className="px-5 py-5 sm:px-6">
                                <p className="text-sm font-semibold text-red-800">
                                    Rejection Reason
                                </p>

                                <p className="mt-2 text-sm leading-6 text-red-700">
                                    {request.rejectionReason}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:justify-end sm:px-6">
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/reader/borrowings/request"
                                )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Back
                        </button>

                        {request.status === "PENDING" && (
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={handleCancel}
                                className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {cancelling
                                    ? "Cancelling..."
                                    : "Cancel Request"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}