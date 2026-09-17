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

    const renderStatusBadge = (status?: string) => {
        const normalized = (status || "").toUpperCase();
        switch (normalized) {
            case "BORROWED":
            case "ACTIVE":
            case "PARTIALLY_RETURNED":
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {status}
                    </span>
                );
            case "RETURNED":
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {status}
                    </span>
                );
            case "OVERDUE":
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        {status}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
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
            await returnBook(selectedDetail.id, returnCondition);
            await loadData();
            setSelectedDetail(null);
            setReturnCondition("GOOD");
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to return book");
        } finally {
            setReturning(false);
        }
    };

    return (
        <RoleGuard allowedRoles={["ADMIN", "LIBRARIAN"]}>
            <div className="min-h-screen bg-white p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-5xl space-y-8">

                    {/* ── Header ── */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
                                <span
                                    className="cursor-pointer hover:text-gray-600"
                                    onClick={() => router.push("/borrowings")}
                                >
                                    Borrowings
                                </span>
                                <span>/</span>
                                <span className="text-gray-600">Record #{id}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Borrowing Record #{id}
                                </h1>
                                {renderStatusBadge(borrowing?.status)}
                            </div>
                            <p className="mt-1 text-sm text-gray-400">
                                View borrowing details and process book returns.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                            ← Back to List
                        </button>
                    </div>

                    {/* ── Overview ── */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs text-gray-400">Reader</p>
                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {borrowing?.reader?.fullName ?? "—"}
                            </p>
                            <p className="text-xs text-gray-400">{borrowing?.reader?.readerCode ?? ""}</p>
                        </div>

                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs text-gray-400">Borrowed At</p>
                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {borrowing?.borrowedAt
                                    ? new Date(borrowing.borrowedAt).toLocaleDateString("vi-VN")
                                    : "—"}
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs text-gray-400">Due Date</p>
                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {borrowing?.dueDate ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs text-gray-400">Total Books</p>
                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {details.length} item(s)
                            </p>
                        </div>
                    </div>

                    {/* ── Books Table ── */}
                    <div className="rounded-lg border border-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-gray-800">Borrowed Books</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <tr>
                                    <th className="px-5 py-3">ID</th>
                                    <th className="px-5 py-3">Book Title</th>
                                    <th className="px-5 py-3">Barcode</th>
                                    <th className="px-5 py-3">Returned At</th>
                                    <th className="px-5 py-3">Fine</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                {details.map((detail) => {
                                    const isReturned = Boolean(detail.returnedAt);
                                    const totalFine =
                                        (detail.fine ?? 0) + Number(detail.damageFine ?? 0);

                                    return (
                                        <tr key={detail.id} className="hover:bg-gray-50 transition">
                                            <td className="px-5 py-3.5 text-xs text-gray-400">
                                                #{detail.id}
                                            </td>

                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-gray-800">
                                                    {detail.bookCopy?.book?.title ?? "—"}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    ISBN: {detail.bookCopy?.book?.isbn ?? "—"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-3.5 font-mono text-xs text-gray-600">
                                                {detail.bookCopy?.barcode ?? "—"}
                                            </td>

                                            <td className="px-5 py-3.5 text-xs text-gray-600">
                                                {isReturned
                                                    ? new Date(detail.returnedAt).toLocaleString("vi-VN")
                                                    : <span className="text-amber-500">Pending</span>
                                                }
                                            </td>

                                            <td className="px-5 py-3.5 text-xs font-medium">
                                                    <span className={totalFine > 0 ? "text-rose-600" : "text-gray-400"}>
                                                        {totalFine.toLocaleString("vi-VN")} VND
                                                    </span>
                                            </td>

                                            <td className="px-5 py-3.5 text-right">
                                                {!isReturned ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openReturnModal(detail)}
                                                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition"
                                                    >
                                                        Return
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Returned</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {details.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                                            No books found in this record.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Return Modal ── */}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">

                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-base font-semibold text-gray-900">Return Book</h2>
                            <p className="mt-0.5 text-xs text-gray-400">
                                Select the condition of the returned copy.
                            </p>
                        </div>

                        <div className="px-5 pt-4">
                            <div className="rounded-lg bg-gray-50 px-4 py-3">
                                <p className="text-sm font-medium text-gray-800">
                                    {selectedDetail.bookCopy?.book?.title ?? "—"}
                                </p>
                                <p className="mt-0.5 font-mono text-xs text-gray-400">
                                    {selectedDetail.bookCopy?.barcode ?? "—"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 px-5 py-4">
                            {(["GOOD", "DAMAGED", "LOST"] as const).map((cond) => (
                                <button
                                    key={cond}
                                    type="button"
                                    onClick={() => setReturnCondition(cond)}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition ${
                                        returnCondition === cond
                                            ? "border-gray-900 bg-gray-900 text-white"
                                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {cond === "GOOD" && "Good — Normal condition"}
                                    {cond === "DAMAGED" && "Damaged — +50,000 VND fee"}
                                    {cond === "LOST" && "Lost — Fee equals book price"}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
                            <button
                                type="button"
                                onClick={closeReturnModal}
                                disabled={returning}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmReturn}
                                disabled={returning}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition"
                            >
                                {returning ? "Processing..." : "Confirm Return"}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </RoleGuard>
    );
}