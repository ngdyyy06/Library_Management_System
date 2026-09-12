"use client";

import Link from "next/link";
import { logout } from "@/app/lib/api";

export default function AdminNavbar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-white">
            <div className="border-b px-6 py-5">
                <h1 className="text-xl font-bold text-gray-900">
                    Library
                </h1>

                <p className="text-sm text-gray-500">
                    Management System
                </p>
            </div>

            <nav className="p-4">
                <div className="space-y-1">
                    <Link
                        href="/dashboard"
                        className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/books"
                        className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
                    >
                        Books
                    </Link>

                    <Link
                        href="/book-copies"
                        className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
                    >
                        Book Copies
                    </Link>

                    <Link
                        href="/readers"
                        className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
                    >
                        Readers
                    </Link>

                    <Link
                        href="/authors"
                        className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
                    >
                        Authors
                    </Link>

                    <Link
                        href="/borrowings"
                        className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
                    >
                        Borrowings
                    </Link>

                    <Link
                        href="/users"
                        className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
                    >
                        Users
                    </Link>
                </div>

                <div className="mt-8 border-t pt-4">
                    <button
                        type="button"
                        onClick={() => {
                            logout();
                            window.location.href = "/login";
                        }}
                        className="mt-1 w-full rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-800 hover:text-white"                    >
                        Logout
                    </button>
                </div>
            </nav>
        </aside>
    );
}