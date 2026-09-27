"use client";

type BorrowingPrintSlipProps = {
    borrowing: any;
    details: any[];
};

export default function BorrowingPrintSlip({
                                               borrowing,
                                               details,
                                           }: BorrowingPrintSlipProps) {
    const formatDateTime = (value?: string | null) => {
        if (!value) return "—";

        return new Date(value).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatMoney = (value: number) => {
        return `${value.toLocaleString("vi-VN")} VND`;
    };

    /*
     * Calculate total number of borrowed books.
     */
    const getTotalBooks = () => {
        return details.reduce(
            (total, detail) =>
                total + Number(detail.quantity ?? 0),
            0
        );
    };

    /*
     * Security deposit for one borrowing detail:
     *
     * Book Price × Quantity
     */
    const getDeposit = (detail: any) => {
        const price = Number(detail.book?.price ?? 0);
        const quantity = Number(detail.quantity ?? 0);

        return price * quantity;
    };

    /*
     * Total security deposit for the whole borrowing record.
     */
    const getTotalDeposit = () => {
        return details.reduce(
            (total, detail) =>
                total + getDeposit(detail),
            0
        );
    };

    const totalBooks = getTotalBooks();
    const totalDeposit = getTotalDeposit();

    return (
        <div className="borrowing-print-slip hidden print:block">
            <style jsx global>{`
                @page {
                    size: A4;
                    margin: 10mm;
                }

                @media print {
                    html,
                    body {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background: white !important;
                    }

                    body * {
                        visibility: hidden;
                    }

                    .borrowing-print-slip,
                    .borrowing-print-slip * {
                        visibility: visible;
                    }

                    .borrowing-print-slip {
                        display: block !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        min-height: 100%;
                        background: white;
                        color: #111827;
                    }

                    .print-no-break {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                }
            `}</style>

            <div
                style={{
                    width: "100%",
                    background: "#ffffff",
                    color: "#111827",
                    fontFamily:
                        "Arial, Helvetica, sans-serif",
                    fontSize: "12px",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        borderBottom:
                            "2px solid #1e3a5f",
                        paddingBottom: "14px",
                        marginBottom: "18px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "flex-start",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: "10px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "38px",
                                        height: "38px",
                                        border:
                                            "2px solid #1e3a5f",
                                        borderRadius:
                                            "6px",
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        color:
                                            "#1e3a5f",
                                        fontSize:
                                            "20px",
                                        fontWeight: 700,
                                    }}
                                >
                                    DN
                                </div>

                                <div>
                                    <div
                                        style={{
                                            fontSize:
                                                "18px",
                                            fontWeight:
                                                700,
                                            letterSpacing:
                                                "0.5px",
                                            color:
                                                "#1e3a5f",
                                        }}
                                    >
                                        LIBRARY
                                        MANAGEMENT
                                        SYSTEM
                                    </div>

                                    <div
                                        style={{
                                            marginTop:
                                                "3px",
                                            fontSize:
                                                "11px",
                                            color:
                                                "#6b7280",
                                        }}
                                    >
                                        Read · Learn ·
                                        Grow
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                textAlign: "right",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    color:
                                        "#1e3a5f",
                                }}
                            >
                                Library
                            </div>

                            <div
                                style={{
                                    marginTop: "4px",
                                    fontSize: "10px",
                                    color:
                                        "#6b7280",
                                }}
                            >
                                Knowledge for a
                                better tomorrow
                            </div>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "22px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "28px",
                            fontWeight: 800,
                            letterSpacing:
                                "1px",
                            color: "#173b63",
                        }}
                    >
                        BORROWING SLIP
                    </div>

                    <div
                        style={{
                            marginTop: "4px",
                            fontSize: "15px",
                            color: "#365b82",
                        }}
                    >
                        Book loan slip
                    </div>
                </div>

                {/* Borrowing Information */}
                <div
                    className="print-no-break"
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "1fr 1fr",
                        gap: "0",
                        border:
                            "1px solid #dbe3ec",
                        borderRadius: "8px",
                        background:
                            "#f8fafc",
                        marginBottom: "22px",
                        overflow: "hidden",
                    }}
                >
                    {/* Left */}
                    <div
                        style={{
                            padding:
                                "15px 18px",
                            borderRight:
                                "1px solid #dbe3ec",
                        }}
                    >
                        <InfoRow
                            label="Borrowing ID"
                            value={
                                borrowing?.id
                                    ? `#${borrowing.id}`
                                    : "—"
                            }
                        />

                        <InfoRow
                            label="Reader Code"
                            value={
                                borrowing
                                    ?.reader
                                    ?.readerCode ??
                                "—"
                            }
                        />

                        <InfoRow
                            label="Reader Name"
                            value={
                                borrowing
                                    ?.reader
                                    ?.fullName ??
                                "—"
                            }
                        />

                        <InfoRow
                            label="Borrowed At"
                            value={formatDateTime(
                                borrowing
                                    ?.borrowedAt
                            )}
                        />
                    </div>

                    {/* Right */}
                    <div
                        style={{
                            padding:
                                "15px 18px",
                        }}
                    >
                        <InfoRow
                            label="Due Date"
                            value={
                                borrowing
                                    ?.dueDate ??
                                "—"
                            }
                        />

                        <InfoRow
                            label="Total Books"
                            value={`${totalBooks} book(s)`}
                        />

                        <InfoRow
                            label="Status"
                            value={
                                borrowing
                                    ?.status ??
                                "BORROWED"
                            }
                        />
                    </div>
                </div>

                {/* Books title */}
                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center",
                        marginBottom: "9px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#173b63",
                        }}
                    >
                        Borrowed Books
                    </div>

                    <div
                        style={{
                            fontSize: "11px",
                            color: "#6b7280",
                        }}
                    >
                        List of borrowed books
                    </div>
                </div>

                {/* Books table */}
                <table
                    className="print-no-break"
                    style={{
                        width: "100%",
                        borderCollapse:
                            "collapse",
                        marginBottom: "18px",
                        border:
                            "1px solid #cbd5e1",
                    }}
                >
                    <thead>
                    <tr
                        style={{
                            background:
                                "#27496d",
                            color:
                                "#ffffff",
                        }}
                    >
                        <th
                            style={{
                                padding:
                                    "10px 7px",
                                border:
                                    "1px solid #cbd5e1",
                                width: "6%",
                                textAlign:
                                    "center",
                            }}
                        >
                            No.
                        </th>

                        <th
                            style={{
                                padding:
                                    "10px 9px",
                                border:
                                    "1px solid #cbd5e1",
                                width: "29%",
                                textAlign:
                                    "left",
                            }}
                        >
                            Book Title
                        </th>

                        <th
                            style={{
                                padding:
                                    "10px 7px",
                                border:
                                    "1px solid #cbd5e1",
                                width: "20%",
                                textAlign:
                                    "left",
                            }}
                        >
                            ISBN
                        </th>

                        <th
                            style={{
                                padding:
                                    "10px 7px",
                                border:
                                    "1px solid #cbd5e1",
                                width: "9%",
                                textAlign:
                                    "center",
                            }}
                        >
                            Qty
                        </th>

                        <th
                            style={{
                                padding:
                                    "10px 7px",
                                border:
                                    "1px solid #cbd5e1",
                                width: "18%",
                                textAlign:
                                    "right",
                            }}
                        >
                            Unit Price
                            <br />
                            (VND)
                        </th>

                        <th
                            style={{
                                padding:
                                    "10px 7px",
                                border:
                                    "1px solid #cbd5e1",
                                width: "18%",
                                textAlign:
                                    "right",
                            }}
                        >
                            Deposit
                            <br />
                            (VND)
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {details.map(
                        (
                            detail,
                            index
                        ) => {
                            const price =
                                Number(
                                    detail
                                        .book
                                        ?.price ??
                                    0
                                );

                            const quantity =
                                Number(
                                    detail
                                        .quantity ??
                                    0
                                );

                            const deposit =
                                price *
                                quantity;

                            return (
                                <tr
                                    key={
                                        detail.id ??
                                        index
                                    }
                                >
                                    <td
                                        style={{
                                            padding:
                                                "10px 7px",
                                            border:
                                                "1px solid #cbd5e1",
                                            textAlign:
                                                "center",
                                            verticalAlign:
                                                "top",
                                        }}
                                    >
                                        {index +
                                            1}
                                    </td>

                                    <td
                                        style={{
                                            padding:
                                                "10px 9px",
                                            border:
                                                "1px solid #cbd5e1",
                                            verticalAlign:
                                                "top",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontWeight:
                                                    700,
                                                color:
                                                    "#1f2937",
                                            }}
                                        >
                                            {detail
                                                    .book
                                                    ?.title ??
                                                "—"}
                                        </div>
                                    </td>

                                    <td
                                        style={{
                                            padding:
                                                "10px 7px",
                                            border:
                                                "1px solid #cbd5e1",
                                            verticalAlign:
                                                "top",
                                            color:
                                                "#4b5563",
                                            fontSize:
                                                "11px",
                                        }}
                                    >
                                        {detail
                                                .book
                                                ?.isbn ??
                                            "—"}
                                    </td>

                                    <td
                                        style={{
                                            padding:
                                                "10px 7px",
                                            border:
                                                "1px solid #cbd5e1",
                                            textAlign:
                                                "center",
                                            verticalAlign:
                                                "top",
                                            fontWeight:
                                                600,
                                        }}
                                    >
                                        {quantity}
                                    </td>

                                    <td
                                        style={{
                                            padding:
                                                "10px 7px",
                                            border:
                                                "1px solid #cbd5e1",
                                            textAlign:
                                                "right",
                                            verticalAlign:
                                                "top",
                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        {formatMoney(
                                            price
                                        )}
                                    </td>

                                    <td
                                        style={{
                                            padding:
                                                "10px 7px",
                                            border:
                                                "1px solid #cbd5e1",
                                            textAlign:
                                                "right",
                                            verticalAlign:
                                                "top",
                                            whiteSpace:
                                                "nowrap",
                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        {formatMoney(
                                            deposit
                                        )}
                                    </td>
                                </tr>
                            );
                        }
                    )}

                    {details.length ===
                        0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    style={{
                                        padding:
                                            "25px",
                                        textAlign:
                                            "center",
                                        border:
                                            "1px solid #cbd5e1",
                                        color:
                                            "#9ca3af",
                                    }}
                                >
                                    No books
                                    found.
                                </td>
                            </tr>
                        )}

                    {/* Total */}
                    <tr
                        style={{
                            background:
                                "#f1f6fb",
                        }}
                    >
                        <td
                            colSpan={3}
                            style={{
                                padding:
                                    "10px 9px",
                                border:
                                    "1px solid #cbd5e1",
                            }}
                        />

                        <td
                            style={{
                                padding:
                                    "10px 7px",
                                border:
                                    "1px solid #cbd5e1",
                                textAlign:
                                    "center",
                                fontWeight:
                                    700,
                                color:
                                    "#173b63",
                            }}
                        >
                            {totalBooks}
                        </td>

                        <td
                            style={{
                                padding:
                                    "10px 7px",
                                border:
                                    "1px solid #cbd5e1",
                                textAlign:
                                    "right",
                                fontWeight:
                                    700,
                                color:
                                    "#173b63",
                            }}
                        >
                            Total
                        </td>

                        <td
                            style={{
                                padding:
                                    "10px 7px",
                                border:
                                    "1px solid #cbd5e1",
                                textAlign:
                                    "right",
                                fontWeight:
                                    800,
                                color:
                                    "#173b63",
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            {formatMoney(
                                totalDeposit
                            )}
                        </td>
                    </tr>
                    </tbody>
                </table>

                {/* Bottom information */}
                <div
                    className="print-no-break"
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "0.9fr 1.1fr",
                        gap: "14px",
                        marginBottom: "24px",
                    }}
                >
                    {/* Deposit Summary */}
                    <div
                        style={{
                            border:
                                "1px solid #dbe3ec",
                            borderRadius: "8px",
                            padding: "15px",
                        }}
                    >
                        <div
                            style={{
                                fontSize:
                                    "14px",
                                fontWeight: 700,
                                color:
                                    "#173b63",
                                marginBottom:
                                    "16px",
                            }}
                        >
                            Deposit Summary
                        </div>

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "space-between",
                                gap: "12px",
                                fontSize:
                                    "11px",
                            }}
                        >
                            <span
                                style={{
                                    color:
                                        "#4b5563",
                                }}
                            >
                                Security Deposit
                            </span>

                            <strong
                                style={{
                                    color:
                                        "#111827",
                                    whiteSpace:
                                        "nowrap",
                                }}
                            >
                                {formatMoney(
                                    totalDeposit
                                )}
                            </strong>
                        </div>

                        <div
                            style={{
                                marginTop:
                                    "4px",
                                fontSize:
                                    "9px",
                                color:
                                    "#9ca3af",
                            }}
                        >
                            Book Price × Quantity
                        </div>

                        <div
                            style={{
                                borderTop:
                                    "1px solid #e5e7eb",
                                marginTop:
                                    "14px",
                                paddingTop:
                                    "12px",
                                fontSize:
                                    "10px",
                                lineHeight:
                                    1.5,
                                color:
                                    "#6b7280",
                            }}
                        >
                            <strong
                                style={{
                                    color:
                                        "#374151",
                                }}
                            >
                                Deposit Note
                            </strong>

                            <br />

                            The security deposit
                            is based on the
                            value of the
                            borrowed books.

                            <br />

                            It may be used to
                            cover applicable
                            charges when the
                            books are returned.
                        </div>
                    </div>

                    {/* Rules */}
                    <div
                        style={{
                            border:
                                "1px solid #cbddec",
                            borderRadius:
                                "8px",
                            padding:
                                "15px",
                            background:
                                "#f7fbff",
                        }}
                    >
                        <div
                            style={{
                                fontSize:
                                    "14px",
                                fontWeight: 700,
                                color:
                                    "#173b63",
                                marginBottom:
                                    "12px",
                            }}
                        >
                            Library Rules
                        </div>

                        <RuleRow
                            title="Lost book"
                            text="Fine = book price."
                        />

                        <RuleRow
                            title="Overdue"
                            text="5,000 VND per book per day."
                        />

                        <RuleRow
                            title="Damaged book"
                            text="50,000 VND per book."
                        />

                        <RuleRow
                            title="Returned on time and in good condition"
                            text="No additional fee."
                        />

                        <RuleRow
                            title="Security deposit"
                            text="May be used to cover applicable charges."
                            last
                        />
                    </div>
                </div>

                {/* Signatures */}
                <div
                    className="print-no-break"
                    style={{
                        borderTop:
                            "1px solid #9ca3af",
                        paddingTop:
                            "20px",
                        display: "grid",
                        gridTemplateColumns:
                            "1fr 1fr",
                        gap: "70px",
                    }}
                >
                    <Signature
                        title="Reader Signature"
                        subtitle="Ký tên người mượn"
                    />

                    <Signature
                        title="Staff Signature"
                        subtitle="Ký tên nhân viên thư viện"
                    />
                </div>

                {/* Footer */}
                <div
                    style={{
                        textAlign:
                            "center",
                        marginTop:
                            "24px",
                        paddingTop:
                            "12px",
                        borderTop:
                            "1px solid #dbe3ec",
                        fontSize:
                            "10px",
                        color:
                            "#6b7280",
                    }}
                >
                    Thank you for supporting our
                    library.
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------
 * Small reusable pieces
 * --------------------------------------------- */

function InfoRow({
                     label,
                     value,
                 }: {
    label: string;
    value: string;
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns:
                    "105px 1fr",
                gap: "10px",
                marginBottom: "9px",
            }}
        >
            <span
                style={{
                    color: "#6b7280",
                    fontSize: "10px",
                }}
            >
                {label}
            </span>

            <strong
                style={{
                    color: "#1f2937",
                    fontSize: "11px",
                }}
            >
                {value}
            </strong>
        </div>
    );
}

function RuleRow({
                     title,
                     text,
                     last = false,
                 }: {
    title: string;
    text: string;
    last?: boolean;
}) {
    return (
        <div
            style={{
                paddingBottom:
                    last ? "0" : "8px",
                marginBottom:
                    last ? "0" : "8px",
                borderBottom: last
                    ? "none"
                    : "1px solid #e5edf5",
            }}
        >
            <div
                style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#374151",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    marginTop: "2px",
                    fontSize: "10px",
                    color: "#6b7280",
                    lineHeight: 1.4,
                }}
            >
                {text}
            </div>
        </div>
    );
}

function Signature({
                       title,
                       subtitle,
                   }: {
    title: string;
    subtitle: string;
}) {
    return (
        <div
            style={{
                textAlign: "center",
            }}
        >
            <div
                style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#1f2937",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    marginTop: "3px",
                    fontSize: "9px",
                    color: "#6b7280",
                }}
            >
                {subtitle}
            </div>

            <div
                style={{
                    height: "45px",
                    borderBottom:
                        "1px solid #6b7280",
                    margin: "0 auto",
                    maxWidth: "220px",
                }}
            />
        </div>
    );
}