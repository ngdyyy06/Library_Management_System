"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/lib/api";

export default function ReaderNavbar() {
    const pathname = usePathname();

    const navItems = [
        {
            name: "Home",
            href: "/reader",
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
        {
            name: "Books Catalog",
            href: "/reader/books",
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
                        d="M5 5.5A2.5 2.5 0 017.5 3H12v17H7.5A2.5 2.5 0 015 17.5v-12zM12 3h4.5A2.5 2.5 0 0119 5.5v12a2.5 2.5 0 01-2.5 2.5H12"
                    />
                </svg>
            ),
        },
        {
            name: "Borrowing Requests",
            href: "/reader/borrowings/request",
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
                        d="M8 5h8a2 2 0 012 2v13H6V7a2 2 0 012-2zM9 5a3 3 0 016 0M9 11h6M9 15h4"
                    />
                </svg>
            ),
        },
        {
            name: "My Borrowings",
            href: "/reader/borrowings",
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
                        d="M8 5h8a2 2 0 012 2v13H6V7a2 2 0 012-2zM9 5a3 3 0 016 0M9 11h6M9 15h4"
                    />
                </svg>
            ),
        },
        {
            name: "My Profile",
            href: "/reader/profile",
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            ),
        },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">

            {/* Brand Header */}
            <div className="border-b border-slate-200 px-5 py-5">
                <div className="flex items-center gap-3">

                    {/* Logo */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 shadow-sm">
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
                                d="M5 5.5A2.5 2.5 0 017.5 3H12v17H7.5A2.5 2.5 0 015 17.5v-12zM12 3h4.5A2.5 2.5 0 0119 5.5v12a2.5 2.5 0 01-2.5 2.5H12"
                            />
                        </svg>
                    </div>

                    {/* Brand */}
                    <div className="min-w-0">
                        <p className="text-sm font-bold tracking-tight text-slate-900">
                            Library Management
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11px] font-medium text-slate-400">
                                Reader Portal
                            </span>

                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold tracking-wide text-slate-600">
                                READER
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-5">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Navigation
                </p>

                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

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

                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}