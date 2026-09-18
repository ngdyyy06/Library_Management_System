"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import { getBorrowRequestById } from "@/app/lib/api";

interface Reader {
    id: number;
    readerCode: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
}

interface Book {
    id: number;
    title: string;
    isbn?: string | null;
    price?: number | null;
}

interface BorrowRequest {
    id: number;
    reader: Reader;
    book: Book;
    quantity: number;
    status: string;
    requestedAt: string;
}

export default function BorrowRequestDetailPage() {
    const params = useParams();
    const router = useRouter();

    const [request, setRequest] =
        useState<BorrowRequest | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadBorrowRequest() {
            try {
                const id = Number(params.id);

                if (!id) {
                    setError("Invalid borrowing request ID.");
                    return;
                }

                const data = await getBorrowRequestById(id);

                setRequest(data);
            } catch (error) {
                console.error(error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load borrowing request."
                );
            } finally {
                setLoading(false);
            }
        }

        loadBorrowRequest();
    }, [params.id]);

    const displayValue = (
        value: string | number | null | undefined
    ) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        return value;
    };

    const formatDateTime = (
        value: string | null | undefined
    ) => {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderStatus = (status: string) => {
        let className =
            "bg-gray-100 text-gray-600 border-gray-200";

        if (status === "PENDING") {
            className =
                "bg-yellow-50 text-yellow-700 border-yellow-200";
        }

        if (status === "APPROVED") {
            className =
                "bg-emerald-50 text-emerald-700 border-emerald-200";
        }

        if (status === "REJECTED") {
            className =
                "bg-red-50 text-red-600 border-red-200";
        }

        if (status === "CANCELLED") {
            className =
                "bg-gray-100 text-gray-500 border-gray-200";
        }

        return (
            <span
                className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${className}`}
            >
                {displayValue(status)}
            </span>
        );
    };

    return (
        <RoleGuard allowedRoles={["LIBRARIAN", "ADMIN"]}>
            <div className="min-h-screen bg-white p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-5xl">

                    {/* Back */}
                    <button
                        type="button"
                        onClick={() =>
                            router.push("/staff/borrow-requests")
                        }
                        className="mb-6 text-sm font-medium text-gray-500 transition hover:text-gray-900"
                    >
                        ← Back to Borrow Requests
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Borrow Request Detail
                        </h1>

                        <p className="mt-1 text-sm text-gray-400">
                            View detailed information about this borrowing request.
                        </p>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-400">
                            Loading borrowing request...
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Detail */}
                    {!loading && !error && request && (
                        <div className="space-y-6">

                            {/* Request Information */}
                            <div className="overflow-hidden rounded-xl border border-gray-200">

                                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                                    <h2 className="text-sm font-semibold text-gray-900">
                                        Request Information
                                    </h2>

                                    <p className="mt-0.5 text-xs text-gray-400">
                                        Basic information of the borrowing request.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2">

                                    {/* Request ID */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">
                                            Request ID
                                        </p>

                                        <p className="mt-1 font-mono text-sm text-gray-800">
                                            #{displayValue(request.id)}
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">
                                            Status
                                        </p>

                                        <p className="mt-1">
                                            {renderStatus(request.status)}
                                        </p>
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">
                                            Quantity
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                            {displayValue(request.quantity)}
                                        </p>
                                    </div>

                                    {/* Requested At */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">
                                            Requested At
                                        </p>

                                        <p className="mt-1 text-sm text-gray-800">
                                            {formatDateTime(
                                                request.requestedAt
                                            )}
                                        </p>
                                    </div>

                                </div>
                            </div>

                            {/* Reader Information */}
                            <div className="overflow-hidden rounded-xl border border-gray-200">

                                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                                    <h2 className="text-sm font-semibold text-gray-900">
                                        Reader Information
                                    </h2>

                                    <p className="mt-0.5 text-xs text-gray-400">
                                        Information about the reader who submitted this request.
                                    </p>
                                </div>

                                {!request.reader ? (
                                    <div className="p-6 text-sm text-gray-400">
                                        Reader information is not available.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2">

                                        {/* Reader ID */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-400">
                                                Reader ID
                                            </p>

                                            <p className="mt-1 font-mono text-sm text-gray-800">
                                                #{displayValue(
                                                request.reader.id
                                            )}
                                            </p>
                                        </div>

                                        {/* Reader Code */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-400">
                                                Reader Code
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-gray-900">
                                                {displayValue(
                                                    request.reader.readerCode
                                                )}
                                            </p>
                                        </div>

                                        {/* Full Name */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-400">
                                                Full Name
                                            </p>

                                            <p className="mt-1 text-sm text-gray-800">
                                                {displayValue(
                                                    request.reader.fullName
                                                )}
                                            </p>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-400">
                                                Email
                                            </p>

                                            <p className="mt-1 text-sm text-gray-800">
                                                {displayValue(
                                                    request.reader.email
                                                )}
                                            </p>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-400">
                                                Phone
                                            </p>

                                            <p className="mt-1 text-sm text-gray-800">
                                                {displayValue(
                                                    request.reader.phone
                                                )}
                                            </p>
                                        </div>

                                    </div>
                                )}
                            </div>

                            {/* Book Information */}
                            <div className="overflow-hidden rounded-xl border border-gray-200">

                                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                                    <h2 className="text-sm font-semibold text-gray-900">
                                        Book Information
                                    </h2>

                                    <p className="mt-0.5 text-xs text-gray-400">
                                        Information about the requested book.
                                    </p>
                                </div>

                                {!request.book ? (
                                    <div className="p-6 text-sm text-gray-400">
                                        Book information is not available.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2">

                                        {/* Book ID */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-400">
                                                Book ID
                                            </p>

                                            <p className="mt-1 font-mono text-sm text-gray-800">
                                                #{displayValue(
                                                request.book.id
                                            )}
                                            </p>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-400">
                                                Title
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-gray-900">
                                                {displayValue(
                                                    request.book.title
                                                )}
                                            </p>
                                        </div>

                                        {/* ISBN */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-400">
                                                ISBN
                                            </p>

                                            <p className="mt-1 font-mono text-sm text-gray-800">
                                                {displayValue(
                                                    request.book.isbn
                                                )}
                                            </p>
                                        </div>

                                        {/* Price */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-400">
                                                Price
                                            </p>

                                            <p className="mt-1 text-sm text-gray-800">
                                                {request.book.price !==
                                                null &&
                                                request.book.price !==
                                                undefined
                                                    ? `${request.book.price.toLocaleString(
                                                        "en-US"
                                                    )}`
                                                    : "—"}
                                            </p>
                                        </div>

                                    </div>
                                )}
                            </div>

                        </div>
                    )}

                </div>
            </div>
        </RoleGuard>
    );
}