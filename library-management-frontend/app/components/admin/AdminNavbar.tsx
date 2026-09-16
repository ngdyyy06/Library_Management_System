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
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    ),
                },
                {
                    name: "Book Copies",
                    href: "/book-copies",
                    icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                    ),
                },
                {
                    name: "Authors",
                    href: "/authors",
                    icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    ),
                },

                {
                    name: "Publishers",
                    href: "/publishers",
                    icon: (
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 7h2m-2 4h2m-2 4h2m4-8h2m-2 4h2m-2 4h2"
                            />
                        </svg>
                    ),
                },
                {
                    name: "Categories",
                    href: "/categories",
                    icon: (
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm4 3h8m-8 4h8m-8 4h5"
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
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    ),
                },

                {
                    name: "Import Receipts",
                    href: "/import-receipts",
                    icon: (
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4h16v16H4zM8 8h8m-8 4h8m-8 4h5"
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
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    ),
                },
            ],
        },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col justify-between border-r border-slate-200/80 bg-white shadow-[4px_0_24px_-4px_rgba(0,0,0,0.08)]">

            {/* ── Brand Header ── */}
            <div className="flex min-h-0 flex-col">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                    {/* Logo icon */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 shadow-md shadow-indigo-200/60 text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>

                    {/* Brand text */}
                    <div className="min-w-0">
                        <p className="text-[13px] font-extrabold leading-tight tracking-tight text-slate-900">
                            Library
                            <span className="text-indigo-600">Management</span>
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="text-[11px] font-medium text-slate-400 leading-none">
                                Admin Portal
                            </span>
                            <span className="inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 border border-indigo-100 leading-none">
                                ADMIN
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-5">
                    {navSections.map((section, idx) => (
                        <div key={idx} className="space-y-0.5">
                            {/* Section label */}
                            <p className="mb-1.5 px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                {section.title}
                            </p>
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                                            isActive
                                                ? "bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-200/70"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-700"
                                        }`}
                                    >
                                        {/* Active left accent bar */}
                                        {isActive && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-white/40" />
                                        )}

                                        <span className={`flex-shrink-0 transition-colors duration-150 ${
                                            isActive
                                                ? "text-white/90"
                                                : "text-slate-400 group-hover:text-indigo-500"
                                        }`}>
                                            {item.icon}
                                        </span>

                                        <span className="flex-1">{item.name}</span>

                                        {isActive && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>
            </div>

            {/* ── Footer / Logout ── */}
            <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-3">
                <button
                    type="button"
                    onClick={() => {
                        logout();
                        window.location.href = "/login";
                    }}
                    className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-slate-500 transition-all duration-150 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98]"
                >
                    <svg
                        className="w-5 h-5 flex-shrink-0 text-slate-400 transition-colors duration-150 group-hover:text-rose-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}