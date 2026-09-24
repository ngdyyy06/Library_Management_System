"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/lib/api";

export default function AdminNavbar() {
    const pathname = usePathname();

    const navSections = [
        {
            title: "MAIN",
            items: [
                {
                    name: "Dashboard",
                    href: "/",
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M3 11.5L12 4l9 7.5M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9M9 20v-5a3 3 0 016 0v5"
                            />
                        </svg>
                    ),
                },
            ],
        },
        {
            title: "CATALOG",
            items: [
                {
                    name: "Books",
                    href: "/books",
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M4 5.5A2.5 2.5 0 016.5 3H20v17H6.5A2.5 2.5 0 014 17.5v-12zM8 7h8M8 11h8M8 15h5"
                            />
                        </svg>
                    ),
                },
                {
                    name: "Authors",
                    href: "/authors",
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M15 5l4 4M17 3a2 2 0 013 3L7 19H3v-4L17 3z"
                            />
                        </svg>
                    ),
                },
                {
                    name: "Publishers",
                    href: "/publishers",
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M4 21h16M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16M9 7h2M9 11h2M9 15h2M14 7h2M14 11h2M14 15h2"
                            />
                        </svg>
                    ),
                },
                {
                    name: "Categories",
                    href: "/categories",
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zM8 8h8M8 12h8M8 16h5"
                            />
                        </svg>
                    ),
                },
            ],
        },
        {
            title: "CIRCULATION",
            items: [
                {
                    name: "Borrowings",
                    href: "/borrowings",
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M7 7h13M7 7l4-4M7 7l4 4M17 17H4M17 17l-4-4M17 17l-4 4"
                            />
                        </svg>
                    ),
                },
                {
                    name: "Import Receipts",
                    href: "/import-receipts",
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"
                            />
                        </svg>
                    ),
                },
            ],
        },
        {
            title: "SYSTEM",
            items: [
                {
                    name: "Users",
                    href: "/users",
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M16 19a4 4 0 00-8 0M12 15a3 3 0 100-6 3 3 0 000 6zM19 19a3 3 0 00-2.5-2.96M17 9a3 3 0 012.5 4.96"
                            />
                        </svg>
                    ),
                },
                {
                    name: "Readers",
                    href: "/staff/readers",
                    icon: (
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M16 19a4 4 0 00-8 0M12 15a3 3 0 100-6 3 3 0 000 6zM19 19a3 3 0 00-2.5-2.96M17 9a3 3 0 012.5 4.96"
                            />
                        </svg>
                    ),
                },
            ],
        },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">

            {/* Brand Header */}
            <div className="border-b border-slate-200 px-5 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.7}
                                d="M5 5h14v14H5zM8 8h8M8 12h5M8 16h8"
                            />
                        </svg>
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-bold tracking-tight text-slate-900">
                            Library Management
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11px] font-medium text-slate-400">
                                Admin Portal
                            </span>

                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold tracking-wide text-slate-600">
                                ADMIN
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-5">
                <div className="space-y-6">
                    {navSections.map((section, idx) => (
                        <div key={idx}>
                            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                {section.title}
                            </p>

                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive =
                                        pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                                                isActive
                                                    ? "bg-black text-white shadow-sm"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                        >
                                            <span
                                                className={`shrink-0 transition-colors ${
                                                    isActive
                                                        ? "text-white"
                                                        : "text-slate-400 group-hover:text-slate-700"
                                                }`}
                                            >
                                                {item.icon}
                                            </span>

                                            <span className="flex-1">
                                                {item.name}
                                            </span>

                                            {isActive && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>

            {/* Logout */}
            <div className="border-t border-slate-200 bg-white p-3">
                <button
                    type="button"
                    onClick={() => {
                        logout();
                        window.location.href = "/login";
                    }}
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98]"
                >
                    <svg
                        className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-rose-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.7}
                            d="M14 8l4 4m0 0l-4 4m4-4H6m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h2a3 3 0 013 3v1"
                        />
                    </svg>

                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}