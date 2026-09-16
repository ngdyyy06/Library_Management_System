"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import {
    getBorrowingById,
    getBorrowingDetails,
    returnBook,
} from "@/app/lib/api";

export default function BorrowingDetailPage() {
    const params = useParams();
    const router = useRouter();

    const id = Number(params.id);

    const [borrowing, setBorrowing] = useState<any>(null);
    const [details, setDetails] = useState<any[]>([]);

    const [selectedDetail, setSelectedDetail] = useState<any>(null);
    const [returnCondition, setReturnCondition] = useState("GOOD");
    const [returning, setReturning] = useState(false);

    const loadData = async () => {
        try {
            const [borrowingData, detailsData] = await Promise.all([
                getBorrowingById(id),
                getBorrowingDetails(id),
            ]);

            setBorrowing(borrowingData);
            setDetails(detailsData);
        } catch (error) {
            console.error("Failed to load borrowing detail:", error);
        }
    };

    useEffect(() => {
        if (!id) return;

        loadData();
    }, [id]);

    // Helper render status badge
    const renderStatusBadge = (status?: string) => {
        const normalized = (status || "").toUpperCase();

        switch (normalized) {
            case "BORROWED":
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {status}
                    </span>
                );

            case "RETURNED":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {status}
                    </span>
                );

            case "OVERDUE":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        {status}
                    </span>
                );

            default:
                return (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                        {status ?? "—"}
                    </span>
                );
        }
    };

    const openReturnModal = (detail: any) => {
        setSelectedDetail(detail);
        setReturnCondition("GOOD");
    };

    const closeReturnModal = () => {
        if (returning) return;

        setSelectedDetail(null);
        setReturnCondition("GOOD");
    };

    const handleConfirmReturn = async () => {
        if (!selectedDetail) return;

        try {
            setReturning(true);

            await returnBook(
                selectedDetail.id,
                returnCondition
            );

            await loadData();

            setSelectedDetail(null);
            setReturnCondition("GOOD");
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to return book"
            );
        } finally {
            setReturning(false);
        }
    };

    return (
        <RoleGuard allowedRoles={["ADMIN", "LIBRARIAN"]}>
            <div className="min-h-screen bg-slate-50 p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-7xl space-y-8">

                    {/* ── Page Header & Back Button ── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                                <span
                                    className="hover:text-slate-600 cursor-pointer"
                                    onClick={() => router.push("/borrowings")}
                                >
                                    Borrowings
                                </span>

                                <span>/</span>

                                <span className="text-slate-700 font-semibold">
                                    Record #{id}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                    Borrowing Record #{id}
                                </h1>

                                {renderStatusBadge(borrowing?.status)}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="group inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:translate-y-0"
                        >
                            <svg
                                className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>

                            <span>Back to List</span>
                        </button>
                    </div>

                    {/* ── Borrowing Information Card ── */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.121 5.121A1 1 0 0118 9.121V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>

                                <h2 className="text-base font-bold text-slate-900">
                                    Circulation Overview
                                </h2>
                            </div>

                            <span className="text-xs font-semibold text-slate-400">
                                #{borrowing?.id ?? id}
                            </span>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                            {/* Reader */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Reader Name
                                </p>

                                <div className="mt-2 flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                                        {(borrowing?.reader?.fullName || "R")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <p className="text-sm font-bold text-slate-900 truncate">
                                        {borrowing?.reader?.fullName ?? "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Borrowed At */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Borrowed At
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                    {borrowing?.borrowedAt
                                        ? new Date(
                                            borrowing.borrowedAt
                                        ).toLocaleString("vi-VN")
                                        : "—"}
                                </p>
                            </div>

                            {/* Due Date */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Due Date
                                </p>

                                <p className="mt-2 text-sm font-bold text-slate-900">
                                    {borrowing?.dueDate ?? "—"}
                                </p>
                            </div>

                            {/* Renewal & Books Count */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Renewals
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-slate-900">
                                            {borrowing?.renewalCount ?? 0} time(s)
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Total Books
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-indigo-600">
                                            {details.length} item(s)
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ── Borrowed Books Table Card ── */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

                        <div className="border-b border-slate-100 px-6 py-5">
                            <h2 className="text-base font-bold text-slate-900">
                                Borrowed Books List
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                                Detailed status and return processing for each physical copy
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-6 py-3.5">ID</th>
                                    <th className="px-6 py-3.5">Book Information</th>
                                    <th className="px-6 py-3.5">Barcode</th>
                                    <th className="px-6 py-3.5">Copy Status</th>
                                    <th className="px-6 py-3.5">Returned At</th>
                                    <th className="px-6 py-3.5">Fine Amount</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {details.map((detail) => {
                                    const isReturned = Boolean(
                                        detail.returnedAt
                                    );

                                    const hasFine =
                                        (detail.fine ?? 0) > 0 ||
                                        (detail.damageFine ?? 0) > 0;

                                    const totalFine =
                                        (detail.fine ?? 0) +
                                        Number(detail.damageFine ?? 0);

                                    return (
                                        <tr
                                            key={detail.id}
                                            className="transition-colors duration-150 hover:bg-slate-50/70"
                                        >
                                            <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-400">
                                                #{detail.id}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                            />
                                                        </svg>
                                                    </div>

                                                    <div>
                                                        <p className="font-bold text-slate-900">
                                                            {detail.bookCopy?.book?.title ?? "—"}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-400 font-mono">
                                                            ISBN:{" "}
                                                            {detail.bookCopy?.book?.isbn ?? "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                    <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 border border-slate-200/80">
                                                        {detail.bookCopy?.barcode ?? "—"}
                                                    </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                        {detail.bookCopy?.status ?? "—"}
                                                    </span>
                                            </td>

                                            <td className="px-6 py-4 text-xs font-medium">
                                                {isReturned ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700">
                                                            <svg
                                                                className="h-3.5 w-3.5"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>

                                                        {new Date(
                                                            detail.returnedAt
                                                        ).toLocaleString("vi-VN")}
                                                        </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                            Pending return
                                                        </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                    <span
                                                        className={`text-xs font-bold ${
                                                            hasFine
                                                                ? "text-rose-600"
                                                                : "text-slate-600"
                                                        }`}
                                                    >
                                                        {totalFine.toLocaleString(
                                                            "vi-VN"
                                                        )}{" "}
                                                        VND
                                                    </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                {!isReturned ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openReturnModal(
                                                                detail
                                                            )
                                                        }
                                                        className="group inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-200 transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md active:translate-y-0"
                                                    >
                                                        <svg
                                                            className="h-3.5 w-3.5"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>

                                                        <span>
                                                                Return Book
                                                            </span>
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                                                            <svg
                                                                className="h-4 w-4 text-emerald-500"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                />
                                                            </svg>

                                                            Returned
                                                        </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {details.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                <svg
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253"
                                                    />
                                                </svg>
                                            </div>

                                            <p className="mt-3 text-sm font-semibold text-slate-700">
                                                No books found in this record
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                There are no physical book copies attached to this borrowing.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Return Book Modal ── */}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

                        {/* Modal Header */}
                        <div className="border-b border-slate-100 px-6 py-5">
                            <h2 className="text-lg font-bold text-slate-900">
                                Return Book
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Select the condition of the physical book copy.
                            </p>
                        </div>

                        {/* Book Information */}
                        <div className="px-6 pt-5">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-sm font-bold text-slate-900">
                                    {selectedDetail.bookCopy?.book?.title ?? "—"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500 font-mono">
                                    Barcode:{" "}
                                    {selectedDetail.bookCopy?.barcode ?? "—"}
                                </p>
                            </div>
                        </div>

                        {/* Conditions */}
                        <div className="space-y-3 px-6 py-5">

                            {/* GOOD */}
                            <button
                                type="button"
                                onClick={() =>
                                    setReturnCondition("GOOD")
                                }
                                className={`w-full rounded-xl border p-4 text-left transition-all ${
                                    returnCondition === "GOOD"
                                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10"
                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                            returnCondition === "GOOD"
                                                ? "bg-emerald-100 text-emerald-600"
                                                : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-slate-900">
                                            Good
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Book is returned in normal condition.
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* DAMAGED */}
                            <button
                                type="button"
                                onClick={() =>
                                    setReturnCondition("DAMAGED")
                                }
                                className={`w-full rounded-xl border p-4 text-left transition-all ${
                                    returnCondition === "DAMAGED"
                                        ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/10"
                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                            returnCondition === "DAMAGED"
                                                ? "bg-amber-100 text-amber-600"
                                                : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 9v4m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 00-3.42 0z"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-slate-900">
                                            Damaged
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Additional damage fee: 50,000 VND.
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* LOST */}
                            <button
                                type="button"
                                onClick={() =>
                                    setReturnCondition("LOST")
                                }
                                className={`w-full rounded-xl border p-4 text-left transition-all ${
                                    returnCondition === "LOST"
                                        ? "border-rose-500 bg-rose-50 ring-2 ring-rose-500/10"
                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                            returnCondition === "LOST"
                                                ? "bg-rose-100 text-rose-600"
                                                : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 6l12 12M6 18L18 6"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-slate-900">
                                            Lost
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Additional fee equals the book price.
                                        </p>
                                    </div>
                                </div>
                            </button>

                        </div>

                        {/* Modal Actions */}
                        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={closeReturnModal}
                                disabled={returning}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmReturn}
                                disabled={returning}
                                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {returning
                                    ? "Processing..."
                                    : "Confirm Return"}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </RoleGuard>
    );
}