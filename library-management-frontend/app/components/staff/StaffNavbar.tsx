"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/lib/api";

export default function StaffNavbar() {
    const pathname = usePathname();

    const navItems = [
        {
            name: "Home",
            href: "/staff",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
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
            name: "Readers",
            href: "/readers",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
        {
            name: "Borrowings",
            href: "/borrowings",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
        },
        {
            name: "Book Returns",
            href: "/returns",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
            ),
        },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col justify-between border-r border-slate-200/80 bg-white shadow-[4px_0_24px_-4px_rgba(0,0,0,0.08)]">

            {/* ── Brand Header ── */}
            <div className="flex min-h-0 flex-col">
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-md shadow-violet-200/60 text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[13px] font-extrabold leading-tight tracking-tight text-slate-900">
                            Library
                            <span className="text-violet-600">Management</span>
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="text-[11px] font-medium text-slate-400 leading-none">
                                Librarian Portal
                            </span>
                            <span className="inline-flex items-center rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold text-violet-600 border border-violet-100 leading-none">
                                STAFF
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Nav Links ── */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    <p className="mb-1.5 px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        Operations
                    </p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                                    isActive
                                        ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-md shadow-violet-200/70"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-violet-700"
                                }`}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-white/40" />
                                )}
                                <span className={`flex-shrink-0 transition-colors duration-150 ${
                                    isActive ? "text-white/90" : "text-slate-400 group-hover:text-violet-500"
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
                    <svg className="w-5 h-5 flex-shrink-0 text-slate-400 transition-colors duration-150 group-hover:text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}