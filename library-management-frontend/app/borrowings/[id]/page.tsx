"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import {
    getBorrowingById,
    getBorrowingDetails,
    returnBook,
} from "@/app/lib/api";

type ReturnCondition = "GOOD" | "DAMAGED" | "LOST";

export default function BorrowingDetailPage() {
    const params = useParams();
    const router = useRouter();

    const id = Number(params.id);

    const [borrowing, setBorrowing] = useState<any>(null);
    const [details, setDetails] = useState<any[]>([]);

    const [selectedDetail, setSelectedDetail] = useState<any>(null);

    /*
     * Number of books that the staff wants to return
     * in the current operation.
     */
    const [returnQuantity, setReturnQuantity] = useState(1);

    /*
     * Store condition for each book being returned.
     *
     * Example:
     * {
     *   0: "GOOD",
     *   1: "DAMAGED"
     * }
     */
    const [returnConditions, setReturnConditions] = useState<
        Record<number, ReturnCondition>
    >({});

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
            case "BORROWING":
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

    /*
     * Calculate how many books from this detail
     * have already been returned.
     *
     * Backend stores only aggregate quantities:
     * goodQuantity + damagedQuantity + lostQuantity
     */
    const getReturnedQuantity = (detail: any) => {
        return (
            Number(detail.goodQuantity ?? 0) +
            Number(detail.damagedQuantity ?? 0) +
            Number(detail.lostQuantity ?? 0)
        );
    };

    /*
     * Calculate how many books are still waiting
     * to be returned.
     */
    const getRemainingQuantity = (detail: any) => {
        const quantity = Number(detail.quantity ?? 0);
        const returnedQuantity = getReturnedQuantity(detail);

        return Math.max(0, quantity - returnedQuantity);
    };

    const openReturnModal = (detail: any) => {
        const remainingQuantity = getRemainingQuantity(detail);

        if (remainingQuantity <= 0) {
            return;
        }

        /*
         * By default, return one book at a time.
         */
        const initialQuantity = 1;

        const initialConditions: Record<number, ReturnCondition> = {};

        for (let i = 0; i < initialQuantity; i++) {
            initialConditions[i] = "GOOD";
        }

        setSelectedDetail(detail);
        setReturnQuantity(initialQuantity);
        setReturnConditions(initialConditions);
    };

    const closeReturnModal = () => {
        if (returning) return;

        setSelectedDetail(null);
        setReturnQuantity(1);
        setReturnConditions({});
    };

    /*
     * Change the number of books being returned.
     */
    const handleReturnQuantityChange = (quantity: number) => {
        if (!selectedDetail) return;

        const remainingQuantity =
            getRemainingQuantity(selectedDetail);

        const safeQuantity = Math.min(
            Math.max(1, quantity),
            remainingQuantity
        );

        setReturnQuantity(safeQuantity);

        /*
         * Rebuild the condition list according to
         * the new return quantity.
         *
         * Existing selected conditions are preserved
         * where possible.
         */
        setReturnConditions((prev) => {
            const next: Record<number, ReturnCondition> = {};

            for (let i = 0; i < safeQuantity; i++) {
                next[i] = prev[i] ?? "GOOD";
            }

            return next;
        });
    };

    const handleConditionChange = (
        bookIndex: number,
        condition: ReturnCondition
    ) => {
        setReturnConditions((prev) => ({
            ...prev,
            [bookIndex]: condition,
        }));
    };

    /*
     * Count the conditions of the books being returned
     * in the current operation.
     */
    const getConditionCounts = () => {
        if (!selectedDetail) {
            return {
                good: 0,
                damaged: 0,
                lost: 0,
            };
        }

        let good = 0;
        let damaged = 0;
        let lost = 0;

        for (let i = 0; i < returnQuantity; i++) {
            const condition = returnConditions[i] ?? "GOOD";

            if (condition === "GOOD") {
                good++;
            }

            if (condition === "DAMAGED") {
                damaged++;
            }

            if (condition === "LOST") {
                lost++;
            }
        }

        return {
            good,
            damaged,
            lost,
        };
    };

    const conditionCounts = getConditionCounts();

    /*
     * Calculate overdue fine.
     *
     * 5,000 VND / overdue day.
     *
     * The fine is applied to the books being returned
     * in the current operation.
     */
    const calculateOverdueFine = () => {
        if (!borrowing?.dueDate) return 0;

        const dueDate = new Date(
            `${borrowing.dueDate}T23:59:59`
        );

        const today = new Date();

        if (today <= dueDate) {
            return 0;
        }

        const diffTime =
            today.getTime() - dueDate.getTime();

        const overdueDays = Math.ceil(
            diffTime / (1000 * 60 * 60 * 24)
        );

        return Math.max(0, overdueDays) * 5000;
    };

    /*
     * Damage fine:
     * 50,000 VND for each damaged book.
     */
    const calculateDamageFine = () => {
        return conditionCounts.damaged * 50000;
    };

    /*
     * Lost fine:
     * Book price × number of lost books.
     */
    const calculateLostFine = () => {
        if (!selectedDetail) return 0;

        const bookPrice = Number(
            selectedDetail.book?.price ?? 0
        );

        return conditionCounts.lost * bookPrice;
    };

    /*
     * Deposit belonging only to the books
     * being returned in this operation.
     *
     * Example:
     *
     * Book price = 250,000
     * Return quantity = 2
     *
     * Returned deposit = 500,000
     */
    const calculateReturnedDeposit = () => {
        if (!selectedDetail) return 0;

        const bookPrice = Number(
            selectedDetail.book?.price ?? 0
        );

        return bookPrice * returnQuantity;
    };

    const currentReturnedDeposit =
        calculateReturnedDeposit();

    const currentOverdueFine =
        calculateOverdueFine();

    const currentDamageFine =
        calculateDamageFine();

    const currentLostFine =
        calculateLostFine();

    /*
     * Total fine for the books being returned
     * in the current operation.
     */
    const totalCurrentFine =
        currentOverdueFine +
        currentDamageFine +
        currentLostFine;

    /*
     * Refund only the deposit of the books
     * being returned now.
     *
     * It cannot be negative.
     */
    const refundAmount = Math.max(
        0,
        currentReturnedDeposit - totalCurrentFine
    );

    /*
     * Confirm return.
     *
     * Backend receives aggregate quantities:
     *
     * {
     *   goodQuantity: 1,
     *   damagedQuantity: 1,
     *   lostQuantity: 0
     * }
     */
    const handleConfirmReturn = async () => {
        if (!selectedDetail) return;

        const remainingQuantity =
            getRemainingQuantity(selectedDetail);

        if (returnQuantity <= 0) {
            alert("Return quantity must be greater than 0.");
            return;
        }

        if (returnQuantity > remainingQuantity) {
            alert(
                `You can only return ${remainingQuantity} book(s).`
            );
            return;
        }

        const conditionCounts =
            getConditionCounts();

        const totalSelected =
            conditionCounts.good +
            conditionCounts.damaged +
            conditionCounts.lost;

        if (totalSelected !== returnQuantity) {
            alert(
                "The number of selected book conditions does not match the return quantity."
            );
            return;
        }

        try {
            setReturning(true);

            /*
             * New backend request format.
             */
            await returnBook(
                selectedDetail.id,
                {
                    goodQuantity: conditionCounts.good,
                    damagedQuantity:
                    conditionCounts.damaged,
                    lostQuantity: conditionCounts.lost,
                }
            );

            await loadData();

            setSelectedDetail(null);
            setReturnQuantity(1);
            setReturnConditions({});
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
            <div className="min-h-screen bg-white p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-5xl space-y-8">

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
                                <span
                                    className="cursor-pointer hover:text-gray-600"
                                    onClick={() =>
                                        router.push(
                                            "/borrowings"
                                        )
                                    }
                                >
                                    Borrowings
                                </span>

                                <span>/</span>

                                <span className="text-gray-600">
                                    Record #{id}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Borrowing Record #{id}
                                </h1>

                                {renderStatusBadge(
                                    borrowing?.status
                                )}
                            </div>

                            <p className="mt-1 text-sm text-gray-400">
                                View borrowing details and
                                process book returns.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            ← Back to List
                        </button>
                    </div>

                    {/* Overview */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

                        {/* Reader */}
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs text-gray-400">
                                Reader
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {borrowing?.reader
                                    ?.fullName ?? "—"}
                            </p>

                            <p className="text-xs text-gray-400">
                                {borrowing?.reader
                                    ?.readerCode ?? ""}
                            </p>
                        </div>

                        {/* Borrowed At */}
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs text-gray-400">
                                Borrowed At
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {borrowing?.borrowedAt
                                    ? new Date(
                                        borrowing.borrowedAt
                                    ).toLocaleString(
                                        "vi-VN"
                                    )
                                    : "—"}
                            </p>
                        </div>

                        {/* Due Date */}
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs text-gray-400">
                                Due Date
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {borrowing?.dueDate ?? "—"}
                            </p>
                        </div>

                        {/* Total Books */}
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs text-gray-400">
                                Total Books
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {details.reduce(
                                    (total, detail) =>
                                        total +
                                        Number(
                                            detail.quantity ??
                                            0
                                        ),
                                    0
                                )}{" "}
                                book(s)
                            </p>
                        </div>
                    </div>

                    {/* Books Table */}
                    <div className="rounded-lg border border-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-gray-800">
                                Borrowed Books
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <tr>
                                    <th className="px-5 py-3">
                                        ID
                                    </th>

                                    <th className="px-5 py-3">
                                        Book Title
                                    </th>

                                    <th className="px-5 py-3">
                                        Quantity
                                    </th>

                                    <th className="px-5 py-3">
                                        Borrowed At
                                    </th>

                                    <th className="px-5 py-3">
                                        Returned At
                                    </th>

                                    <th className="px-5 py-3">
                                        Fine
                                    </th>

                                    <th className="px-5 py-3 text-right">
                                        Action
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                {details.map((detail) => {
                                    const returnedQuantity =
                                        getReturnedQuantity(
                                            detail
                                        );

                                    const remainingQuantity =
                                        getRemainingQuantity(
                                            detail
                                        );

                                    const isReturned =
                                        remainingQuantity <= 0;

                                    const totalFine =
                                        Number(
                                            detail.fine ?? 0
                                        ) +
                                        Number(
                                            detail.damageFine ??
                                            0
                                        );

                                    return (
                                        <tr
                                            key={detail.id}
                                            className="transition hover:bg-gray-50"
                                        >
                                            {/* ID */}
                                            <td className="px-5 py-3.5 text-xs text-gray-400">
                                                #{detail.id}
                                            </td>

                                            {/* Book */}
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-gray-800">
                                                    {detail.book
                                                            ?.title ??
                                                        "—"}
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    ISBN:{" "}
                                                    {detail.book
                                                            ?.isbn ??
                                                        "—"}
                                                </p>
                                            </td>

                                            {/* Quantity */}
                                            <td className="px-5 py-3.5 text-xs text-gray-600">
                                                <div>
                                                    <span>
                                                        {detail.quantity ??
                                                            0}{" "}
                                                        total
                                                    </span>

                                                    {returnedQuantity >
                                                        0 && (
                                                            <p className="mt-0.5 text-xs text-emerald-600">
                                                                {
                                                                    returnedQuantity
                                                                }{" "}
                                                                returned
                                                                {" · "}
                                                                {
                                                                    remainingQuantity
                                                                }{" "}
                                                                remaining
                                                            </p>
                                                        )}
                                                </div>
                                            </td>

                                            {/* Borrowed At */}
                                            <td className="px-5 py-3.5 text-xs text-gray-600">
                                                {borrowing?.borrowedAt
                                                    ? new Date(
                                                        borrowing.borrowedAt
                                                    ).toLocaleString(
                                                        "vi-VN"
                                                    )
                                                    : "—"}
                                            </td>

                                            {/* Returned At */}
                                            <td className="px-5 py-3.5 text-xs text-gray-600">
                                                {isReturned ? (
                                                    detail.returnedAt
                                                        ? new Date(
                                                            detail.returnedAt
                                                        ).toLocaleString(
                                                            "vi-VN"
                                                        )
                                                        : "Returned"
                                                ) : (
                                                    <span className="text-amber-500">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>

                                            {/* Fine */}
                                            <td className="px-5 py-3.5 text-xs font-medium">
                                                <span
                                                    className={
                                                        totalFine >
                                                        0
                                                            ? "text-rose-600"
                                                            : "text-gray-400"
                                                    }
                                                >
                                                    {totalFine.toLocaleString(
                                                        "vi-VN"
                                                    )}{" "}
                                                    VND
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td className="px-5 py-3.5 text-right">
                                                {!isReturned ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openReturnModal(
                                                                detail
                                                            )
                                                        }
                                                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-700"
                                                    >
                                                        Return
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400">
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
                                            className="px-5 py-12 text-center text-sm text-gray-400"
                                        >
                                            No books found in
                                            this record.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Return Modal */}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">

                        {/* Modal Header */}
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-base font-semibold text-gray-900">
                                Return Book
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-400">
                                Select how many books to return
                                and their conditions.
                            </p>
                        </div>

                        {/* Book Information */}
                        <div className="px-5 pt-4">
                            <div className="rounded-lg bg-gray-50 px-4 py-3">
                                <p className="text-sm font-medium text-gray-800">
                                    {selectedDetail.book
                                        ?.title ?? "—"}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-400">
                                    ISBN:{" "}
                                    {selectedDetail.book
                                        ?.isbn ?? "—"}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-400">
                                    Total Quantity:{" "}
                                    {selectedDetail.quantity ??
                                        0}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-400">
                                    Already Returned:{" "}
                                    {getReturnedQuantity(
                                        selectedDetail
                                    )}
                                </p>

                                <p className="mt-0.5 text-xs font-medium text-gray-600">
                                    Remaining:{" "}
                                    {getRemainingQuantity(
                                        selectedDetail
                                    )}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-400">
                                    Borrowed At:{" "}
                                    {borrowing?.borrowedAt
                                        ? new Date(
                                            borrowing.borrowedAt
                                        ).toLocaleString(
                                            "vi-VN"
                                        )
                                        : "—"}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-400">
                                    Due Date:{" "}
                                    {borrowing?.dueDate ??
                                        "—"}
                                </p>
                            </div>
                        </div>

                        {/* Return Quantity */}
                        <div className="px-5 pt-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-700">
                                        Return Quantity
                                    </p>

                                    <p className="mt-0.5 text-xs text-gray-400">
                                        Select the number of books
                                        to return now.
                                    </p>
                                </div>

                                <select
                                    value={returnQuantity}
                                    onChange={(event) =>
                                        handleReturnQuantityChange(
                                            Number(
                                                event.target.value
                                            )
                                        )
                                    }
                                    className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-gray-400"
                                >
                                    {Array.from(
                                        {
                                            length: getRemainingQuantity(
                                                selectedDetail
                                            ),
                                        },
                                        (_, index) => {
                                            const quantity =
                                                index + 1;

                                            return (
                                                <option
                                                    key={
                                                        quantity
                                                    }
                                                    value={
                                                        quantity
                                                    }
                                                >
                                                    {quantity}
                                                </option>
                                            );
                                        }
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Individual Books */}
                        <div className="space-y-2 px-5 py-4">
                            <p className="text-xs font-semibold text-gray-700">
                                Book Condition
                            </p>

                            {Array.from(
                                {
                                    length: returnQuantity,
                                },
                                (_, index) => {
                                    const condition =
                                        returnConditions[
                                            index
                                            ] ?? "GOOD";

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5"
                                        >
                                            <span className="text-sm font-medium text-gray-700">
                                                Book{" "}
                                                {index + 1}
                                            </span>

                                            <select
                                                value={
                                                    condition
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    handleConditionChange(
                                                        index,
                                                        event
                                                            .target
                                                            .value as ReturnCondition
                                                    )
                                                }
                                                className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-gray-400"
                                            >
                                                <option value="GOOD">
                                                    Good
                                                </option>

                                                <option value="DAMAGED">
                                                    Damaged
                                                </option>

                                                <option value="LOST">
                                                    Lost
                                                </option>
                                            </select>
                                        </div>
                                    );
                                }
                            )}
                        </div>

                        {/* Financial Summary */}
                        <div className="mx-5 mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="space-y-2">

                                {/* Returned Deposit */}
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-gray-500">
                                        Security Deposit
                                    </span>

                                    <span className="text-sm font-semibold text-gray-800">
                                        {currentReturnedDeposit.toLocaleString(
                                            "vi-VN"
                                        )}{" "}
                                        VND
                                    </span>
                                </div>

                                {/* Return Quantity */}
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-gray-500">
                                        Returning
                                    </span>

                                    <span className="text-sm font-medium text-gray-700">
                                        {returnQuantity}{" "}
                                        book(s)
                                    </span>
                                </div>

                                {/* Damaged */}
                                {conditionCounts.damaged >
                                    0 && (
                                        <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs text-gray-500">
                                            Damage Fine
                                        </span>

                                            <span className="text-sm font-medium text-rose-600">
                                            -
                                                {currentDamageFine.toLocaleString(
                                                    "vi-VN"
                                                )}{" "}
                                                VND
                                        </span>
                                        </div>
                                    )}

                                {/* Lost */}
                                {conditionCounts.lost >
                                    0 && (
                                        <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs text-gray-500">
                                            Lost Fine
                                        </span>

                                            <span className="text-sm font-medium text-rose-600">
                                            -
                                                {currentLostFine.toLocaleString(
                                                    "vi-VN"
                                                )}{" "}
                                                VND
                                        </span>
                                        </div>
                                    )}

                                {/* Overdue */}
                                {currentOverdueFine >
                                    0 && (
                                        <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs text-gray-500">
                                            Overdue Fine
                                        </span>

                                            <span className="text-sm font-medium text-rose-600">
                                            -
                                                {currentOverdueFine.toLocaleString(
                                                    "vi-VN"
                                                )}{" "}
                                                VND
                                        </span>
                                        </div>
                                    )}

                                {/* Total Fine */}
                                {totalCurrentFine >
                                    0 && (
                                        <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs font-medium text-gray-600">
                                            Total Fine
                                        </span>

                                            <span className="text-sm font-semibold text-rose-600">
                                            -
                                                {totalCurrentFine.toLocaleString(
                                                    "vi-VN"
                                                )}{" "}
                                                VND
                                        </span>
                                        </div>
                                    )}

                                {/* Refund */}
                                <div className="border-t border-gray-200 pt-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm font-semibold text-gray-800">
                                            Refund Amount
                                        </span>

                                        <span
                                            className={`text-base font-bold ${
                                                refundAmount >
                                                0
                                                    ? "text-emerald-600"
                                                    : "text-rose-600"
                                            }`}
                                        >
                                            {refundAmount.toLocaleString(
                                                "vi-VN"
                                            )}{" "}
                                            VND
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
                            <button
                                type="button"
                                onClick={closeReturnModal}
                                disabled={returning}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmReturn}
                                disabled={returning}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
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