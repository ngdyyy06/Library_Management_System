"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import { getReturnHistory } from "@/app/lib/api";

interface Reader {
    id: number;
    readerCode: string;
    fullName: string;
}

interface Book {
    id: number;
    title: string;
    isbn: string;
}

interface ReturnHistoryItem {
    id: number;
    borrowingId: number;

    reader: Reader;

    book: Book;

    borrowedAt: string;
    dueDate: string;
    returnedAt: string;

    goodQuantity: number;
    damagedQuantity: number;
    lostQuantity: number;

    fine: number;
    damageFine: number;

    status: string;
}

export default function ReturnHistoryPage() {

    const router = useRouter();

    const [history, setHistory] =
        useState<ReturnHistoryItem[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // =========================================================
    // SEARCH & FILTER
    // =========================================================

    const [searchTerm, setSearchTerm] =
        useState("");

    const [fineFilter, setFineFilter] =
        useState<
            "ALL"
            | "OVERDUE_ONLY"
            | "DAMAGE_ONLY"
            | "NO_FINE"
        >("ALL");

    // =========================================================
    // LOAD RETURN HISTORY
    // =========================================================

    const loadReturnHistory = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getReturnHistory();

            const returnedItems: ReturnHistoryItem[] =
                (data || [])
                    .map((item: any) => ({

                        id: item.id,

                        borrowingId:
                            item.borrowing?.id || 0,

                        reader:
                            item.borrowing?.reader || {
                                id: 0,
                                readerCode: "N/A",
                                fullName: "General Patron",
                            },

                        book:
                            item.book || {
                                id: 0,
                                title: "Untitled Catalog",
                                isbn: "N/A",
                            },

                        borrowedAt:
                            item.borrowing?.borrowedAt || "",

                        dueDate:
                            item.borrowing?.dueDate || "",

                        returnedAt:
                            item.returnedAt || "",

                        goodQuantity:
                            item.goodQuantity || 0,

                        damagedQuantity:
                            item.damagedQuantity || 0,

                        lostQuantity:
                            item.lostQuantity || 0,

                        fine:
                            item.fine || 0,

                        damageFine:
                            Number(item.damageFine) || 0,

                        status:
                            item.status || "RETURNED",
                    }))
                    .sort(
                        (
                            a: ReturnHistoryItem,
                            b: ReturnHistoryItem
                        ) =>
                            new Date(b.returnedAt).getTime()
                            -
                            new Date(a.returnedAt).getTime()
                    );

            setHistory(
                returnedItems
            );

        } catch (err: any) {

            console.error(
                "Failed to load return history:",
                err
            );

            setError(
                err?.message ||
                "Failed to load return history."
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadReturnHistory();

    }, []);

    // =========================================================
    // FILTER
    // =========================================================

    const filteredHistory =
        useMemo(() => {

            return history.filter(
                (item) => {

                    const keyword =
                        searchTerm
                            .trim()
                            .toLowerCase();

                    const matchesSearch =
                        !keyword ||

                        item.reader?.fullName
                            ?.toLowerCase()
                            .includes(
                                keyword
                            ) ||

                        item.reader?.readerCode
                            ?.toLowerCase()
                            .includes(
                                keyword
                            ) ||

                        item.book?.title
                            ?.toLowerCase()
                            .includes(
                                keyword
                            ) ||

                        item.book?.isbn
                            ?.toLowerCase()
                            .includes(
                                keyword
                            );

                    let matchesFine =
                        true;

                    if (
                        fineFilter ===
                        "OVERDUE_ONLY"
                    ) {

                        matchesFine =
                            item.fine > 0;

                    } else if (
                        fineFilter ===
                        "DAMAGE_ONLY"
                    ) {

                        matchesFine =
                            item.damageFine > 0;

                    } else if (
                        fineFilter ===
                        "NO_FINE"
                    ) {

                        matchesFine =
                            item.fine === 0 &&
                            item.damageFine === 0;
                    }

                    return (
                        matchesSearch &&
                        matchesFine
                    );
                }
            );

        }, [
            history,
            searchTerm,
            fineFilter,
        ]);

    // =========================================================
    // STATISTICS
    // =========================================================

    const totalReturns =
        history.length;

    const totalOverdueFine =
        history.reduce(
            (sum, item) =>
                sum +
                (item.fine || 0),
            0
        );

    const totalDamageFine =
        history.reduce(
            (sum, item) =>
                sum +
                (item.damageFine || 0),
            0
        );

    const totalRevenue =
        totalOverdueFine +
        totalDamageFine;

    // =========================================================
    // FORMAT
    // =========================================================

    function formatCurrency(
        value: number
    ) {

        return new Intl.NumberFormat(
            "vi-VN"
        ).format(
            value || 0
        );
    }

    const formatDateTime =
        (value: string) => {

            if (!value) {
                return "—";
            }

            return new Date(
                value
            ).toLocaleString(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );
        };

    const formatDate =
        (value: string) => {

            if (!value) {
                return "—";
            }

            return new Date(
                value
            ).toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }
            );
        };

    // =========================================================
    // STATUS
    // =========================================================

    const getStatusLabel =
        (status: string) => {

            if (
                status ===
                "PARTIALLY_RETURNED"
            ) {
                return "Partial Return";
            }

            return "Returned";
        };

    // =========================================================
    // STATUS STYLE
    // =========================================================

    const getStatusStyle =
        (status: string) => {

            if (
                status ===
                "PARTIALLY_RETURNED"
            ) {

                return {
                    wrapper:
                        "bg-amber-50 text-amber-700",
                    dot:
                        "bg-amber-500",
                };
            }

            return {
                wrapper:
                    "bg-emerald-50 text-emerald-700",
                dot:
                    "bg-emerald-500",
            };
        };

    return (

        <RoleGuard
            allowedRoles={[
                "LIBRARIAN",
                "ADMIN",
            ]}
        >

            <div className="min-h-screen w-full bg-[#fafafa] p-6 lg:p-8">

                <div className="mx-auto max-w-7xl space-y-6">

                    {/* ================================================= */}
                    {/* HEADER */}
                    {/* ================================================= */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <div className="flex items-center gap-2.5">

                                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                    Return History
                                </h1>

                                <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs">
                                    Archive Ledger
                                </span>

                            </div>

                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                Audit ledger of all returned books, condition assessments, and collected fines.
                            </p>

                        </div>

                        {/* Refresh */}

                        <button
                            type="button"
                            onClick={
                                loadReturnHistory
                            }
                            disabled={
                                loading
                            }
                            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 sm:self-auto sm:text-sm"
                        >

                            <svg
                                className={`h-3.5 w-3.5 text-slate-500 ${
                                    loading
                                        ? "animate-spin text-slate-900"
                                        : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                />

                            </svg>

                            Refresh Log

                        </button>

                    </div>

                    {/* ================================================= */}
                    {/* ERROR */}
                    {/* ================================================= */}

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

                                <span>
                                    {error}
                                </span>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setError("")
                                }
                                className="text-xs font-medium text-rose-600 hover:text-rose-800"
                            >
                                Dismiss
                            </button>

                        </div>

                    )}

                    {/* ================================================= */}
                    {/* STATISTICS */}
                    {/* ================================================= */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                        {/* Total */}

                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">

                            <p className="text-xs font-medium text-slate-500">
                                Return Records
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                                {totalReturns}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                                Individual return transactions
                            </p>

                        </div>

                        {/* Overdue */}

                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">

                            <p className="text-xs font-medium text-slate-500">
                                Overdue Fines
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">

                                {formatCurrency(
                                    totalOverdueFine
                                )}

                                {" "}

                                <span className="text-xs font-normal text-slate-400">
                                    ₫
                                </span>

                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                                Late return restitution
                            </p>

                        </div>

                        {/* Damage */}

                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">

                            <p className="text-xs font-medium text-slate-500">
                                Damage/Lost Penalties
                            </p>

                            <p className="mt-2 text-2xl font-semibold tracking-tight text-rose-600">

                                {formatCurrency(
                                    totalDamageFine
                                )}

                                {" "}

                                <span className="text-xs font-normal text-slate-400">
                                    ₫
                                </span>

                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">

                                Total penalties:{" "}

                                {formatCurrency(
                                    totalRevenue
                                )}{" "}
                                ₫

                            </p>

                        </div>

                    </div>

                    {/* ================================================= */}
                    {/* MAIN */}
                    {/* ================================================= */}

                    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">

                        {/* Filter */}

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
                                        value={
                                            searchTerm
                                        }
                                        onChange={
                                            (e) =>
                                                setSearchTerm(
                                                    e.target.value
                                                )
                                        }
                                        placeholder="Search by patron name, code, title, or ISBN..."
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                    />

                                </div>

                                <select
                                    value={
                                        fineFilter
                                    }
                                    onChange={
                                        (e) =>
                                            setFineFilter(
                                                e.target.value as
                                                    | "ALL"
                                                    | "OVERDUE_ONLY"
                                                    | "DAMAGE_ONLY"
                                                    | "NO_FINE"
                                            )
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 sm:text-sm"
                                >

                                    <option value="ALL">
                                        All Return Records
                                    </option>

                                    <option value="OVERDUE_ONLY">
                                        With Overdue Fines
                                    </option>

                                    <option value="DAMAGE_ONLY">
                                        With Damage Penalties
                                    </option>

                                    <option value="NO_FINE">
                                        Clean Returns (Zero Fines)
                                    </option>

                                </select>

                            </div>

                        </div>

                        {/* ================================================= */}
                        {/* LOADING */}
                        {/* ================================================= */}

                        {loading ? (

                            <div className="flex flex-col items-center justify-center py-16 text-center">

                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />

                                <p className="mt-3 text-xs text-slate-500">
                                    Compiling return history records...
                                </p>

                            </div>

                        ) : filteredHistory.length === 0 ? (

                            /* ================================================= */
                            /* EMPTY */
                            /* ================================================= */

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
                                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />

                                    </svg>

                                </div>

                                <p className="mt-3 text-sm font-medium text-slate-800">
                                    No return records found
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    No items match your filter criteria.
                                </p>

                            </div>

                        ) : (

                            /* ================================================= */
                            /* TABLE */
                            /* ================================================= */

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[1200px] border-collapse text-left">

                                    <thead className="border-b border-slate-100 bg-slate-50/50">

                                    <tr>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Patron
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Book
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Returned
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Condition
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Overdue Fine
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Damage Fine
                                        </th>

                                        <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Action
                                        </th>

                                    </tr>

                                    </thead>

                                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">

                                    {filteredHistory.map(
                                        (item) => {

                                            const statusStyle =
                                                getStatusStyle(
                                                    item.status
                                                );

                                            return (

                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                    className="transition-colors hover:bg-slate-50/70"
                                                >

                                                    {/* Patron */}

                                                    <td className="px-5 py-3.5">

                                                        <div>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/staff/readers/${item.reader.id}`
                                                                    )
                                                                }
                                                                className="font-medium text-slate-900 transition hover:underline"
                                                            >
                                                                {
                                                                    item.reader
                                                                        .fullName
                                                                }
                                                            </button>

                                                            <p className="font-mono text-[11px] text-slate-400">
                                                                {
                                                                    item.reader
                                                                        .readerCode
                                                                }
                                                            </p>

                                                        </div>

                                                    </td>

                                                    {/* Book */}

                                                    <td className="px-5 py-3.5">

                                                        <div>

                                                            <p className="line-clamp-1 font-medium text-slate-900">
                                                                {
                                                                    item.book
                                                                        .title
                                                                }
                                                            </p>

                                                            <span className="font-mono text-[11px] text-slate-400">
                                                                ISBN:{" "}
                                                                {
                                                                    item.book
                                                                        .isbn
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>

                                                    {/* Returned */}

                                                    <td className="px-5 py-3.5">

                                                        <p className="font-medium text-slate-900">
                                                            {
                                                                formatDateTime(
                                                                    item.returnedAt
                                                                )
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                                            Due:{" "}
                                                            {
                                                                formatDate(
                                                                    item.dueDate
                                                                )
                                                            }
                                                        </p>

                                                    </td>

                                                    {/* Condition */}

                                                    <td className="px-5 py-3.5">

                                                        <div className="space-y-1 text-xs">

                                                            <div className="flex items-center gap-2">

                                                                <span className="w-16 text-slate-500">
                                                                    Good
                                                                </span>

                                                                <span className="font-semibold text-emerald-600">
                                                                    {
                                                                        item.goodQuantity
                                                                    }
                                                                </span>

                                                            </div>

                                                            <div className="flex items-center gap-2">

                                                                <span className="w-16 text-slate-500">
                                                                    Damaged
                                                                </span>

                                                                <span className="font-semibold text-amber-600">
                                                                    {
                                                                        item.damagedQuantity
                                                                    }
                                                                </span>

                                                            </div>

                                                            <div className="flex items-center gap-2">

                                                                <span className="w-16 text-slate-500">
                                                                    Lost
                                                                </span>

                                                                <span className="font-semibold text-rose-600">
                                                                    {
                                                                        item.lostQuantity
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* Overdue */}

                                                    <td className="px-5 py-3.5">

                                                        {item.fine > 0 ? (

                                                            <span className="font-semibold text-rose-600">

                                                                {
                                                                    formatCurrency(
                                                                        item.fine
                                                                    )
                                                                }{" "}
                                                                ₫

                                                            </span>

                                                        ) : (

                                                            <span className="text-slate-400">
                                                                0 ₫
                                                            </span>

                                                        )}

                                                    </td>

                                                    {/* Damage */}

                                                    <td className="px-5 py-3.5">

                                                        {item.damageFine > 0 ? (

                                                            <span className="font-semibold text-rose-600">

                                                                {
                                                                    formatCurrency(
                                                                        item.damageFine
                                                                    )
                                                                }{" "}
                                                                ₫

                                                            </span>

                                                        ) : (

                                                            <span className="text-slate-400">
                                                                0 ₫
                                                            </span>

                                                        )}

                                                    </td>

                                                    {/* Status */}

                                                    <td className="px-5 py-3.5">

                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.wrapper}`}
                                                        >

                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                                                            />

                                                            {
                                                                getStatusLabel(
                                                                    item.status
                                                                )
                                                            }

                                                        </span>

                                                    </td>

                                                    {/* Action */}

                                                    <td className="px-5 py-3.5 text-right">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/borrowings/${item.borrowingId}`
                                                                )
                                                            }
                                                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
                                                        >
                                                            View Loan
                                                        </button>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}