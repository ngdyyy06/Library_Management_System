"use client";

import { useEffect, useState } from "react";
import { getMyBorrowings, renewBorrowing } from "@/app/lib/api";

type Borrowing = {
    id: number;
    borrowedAt: string;
    dueDate: string;
    status: string;
    renewalCount: number;
};

export default function MyBorrowingsPage() {
    const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [renewingId, setRenewingId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        loadBorrowings();
    }, []);

    async function loadBorrowings() {
        try {
            setLoading(true);
            setError("");

            const data = await getMyBorrowings();

            setBorrowings(data);
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to load borrowing records.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleRenew(id: number) {
        try {
            setRenewingId(id);
            setError("");
            setSuccessMessage("");

            await renewBorrowing(id);

            setSuccessMessage(
                "Borrowing has been renewed successfully."
            );

            await loadBorrowings();
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to renew borrowing.");
            }
        } finally {
            setRenewingId(null);
        }
    }

    function getStatusClass(status: string) {
        switch (status) {
            case "RETURNED":
                return "bg-gray-100 text-gray-700";

            case "PARTIALLY_RETURNED":
                return "bg-blue-100 text-blue-700";

            case "BORROWING":
                return "bg-green-100 text-green-700";

            case "OVERDUE":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    }

    function canRenew(borrowing: Borrowing) {
        return borrowing.status !== "RETURNED";
    }

    function formatDate(dateString: string) {
        if (!dateString) {
            return "-";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString("en-GB");
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
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                        My Borrowings
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View and manage your borrowed books.
                    </p>
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
                            Loading your borrowings...
                        </p>
                    </div>
                ) : borrowings.length === 0 ? (
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
                                    d="M12 6.75v10.5m-5.25-7.5h10.5M5.25 4.5h13.5A1.5 1.5 0 0 1 20.25 6v12a1.5 1.5 0 0 1-1.5 1.5H5.25A1.5 1.5 0 0 1 3.75 18V6a1.5 1.5 0 0 1 1.5-1.5Z"
                                />
                            </svg>
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-gray-900">
                            No borrowing records
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                            You have not borrowed any books yet.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px]">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Borrowing
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Borrowed At
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Due Date
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Renewals
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Action
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                    {borrowings.map((borrowing) => {
                                        const renewable =
                                            canRenew(borrowing);

                                        const isRenewing =
                                            renewingId === borrowing.id;

                                        return (
                                            <tr
                                                key={borrowing.id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-5">
                                                    <p className="font-semibold text-gray-900">
                                                        #
                                                        {
                                                            borrowing.id
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Borrowing record
                                                    </p>
                                                </td>

                                                <td className="px-6 py-5 text-sm text-gray-700">
                                                    {formatDateTime(
                                                        borrowing.borrowedAt
                                                    )}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {formatDate(
                                                            borrowing.dueDate
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-5">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                                borrowing.status
                                                            )}`}
                                                        >
                                                            {borrowing.status.replace(
                                                                /_/g,
                                                                " "
                                                            )}
                                                        </span>
                                                </td>

                                                <td className="px-6 py-5 text-sm text-gray-700">
                                                    {
                                                        borrowing.renewalCount
                                                    }
                                                </td>

                                                <td className="px-6 py-5 text-right">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            !renewable ||
                                                            isRenewing
                                                        }
                                                        onClick={() =>
                                                            handleRenew(
                                                                borrowing.id
                                                            )
                                                        }
                                                        className={`inline-flex min-w-[90px] items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition ${
                                                            renewable
                                                                ? "bg-black text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                                : "cursor-not-allowed bg-gray-100 text-gray-400"
                                                        }`}
                                                    >
                                                        {isRenewing ? (
                                                            <>
                                                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                                Renewing
                                                            </>
                                                        ) : (
                                                            "Renew"
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile cards */}
                        <div className="space-y-4 md:hidden">
                            {borrowings.map((borrowing) => {
                                const renewable =
                                    canRenew(borrowing);

                                const isRenewing =
                                    renewingId === borrowing.id;

                                return (
                                    <div
                                        key={borrowing.id}
                                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                    Borrowing
                                                </p>

                                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                                    #{borrowing.id}
                                                </p>
                                            </div>

                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                    borrowing.status
                                                )}`}
                                            >
                                                {borrowing.status.replace(
                                                    /_/g,
                                                    " "
                                                )}
                                            </span>
                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Borrowed At
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    {formatDateTime(
                                                        borrowing.borrowedAt
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Due Date
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    {formatDate(
                                                        borrowing.dueDate
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Renewals
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    {
                                                        borrowing.renewalCount
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={
                                                !renewable ||
                                                isRenewing
                                            }
                                            onClick={() =>
                                                handleRenew(
                                                    borrowing.id
                                                )
                                            }
                                            className={`mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                                                renewable
                                                    ? "bg-black text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                    : "cursor-not-allowed bg-gray-100 text-gray-400"
                                            }`}
                                        >
                                            {isRenewing
                                                ? "Renewing..."
                                                : renewable
                                                    ? "Renew Borrowing"
                                                    : "Already Returned"}
                                        </button>
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