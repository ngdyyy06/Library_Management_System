"use client";

import Link from "next/link";
import { logout} from "@/app/lib/api";

export default function StaffNavbar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white">
            <div className="p-6">
                <h1 className="text-xl font-bold">
                    Library Management
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                    Librarian
                </p>
            </div>

            <nav className="px-4">
                <Link
                    href="/staff"
                    className="block rounded-lg px-4 py-3 hover:bg-gray-800"
                >
                    Home
                </Link>

                <Link
                    href="/books"
                    className="mt-1 block rounded-lg px-4 py-3 hover:bg-gray-800"
                >
                    Books
                </Link>

                <Link
                    href="/readers"
                    className="mt-1 block rounded-lg px-4 py-3 hover:bg-gray-800"
                >
                    Readers
                </Link>

                <Link
                    href="/borrowings"
                    className="mt-1 block rounded-lg px-4 py-3 hover:bg-gray-800"
                >
                    Borrowings
                </Link>

                <Link
                    href="/returns"
                    className="mt-1 block rounded-lg px-4 py-3 hover:bg-gray-800"
                >
                    Book Returns
                </Link>

                <button
                    type="button"
                    onClick={() => {
                        logout();
                        window.location.href = "/login";
                    }}
                    className="mt-1 w-full rounded-lg px-4 py-3 text-left hover:bg-gray-800"
                >
                    Logout
                </button>
            </nav>
        </aside>
    );
}