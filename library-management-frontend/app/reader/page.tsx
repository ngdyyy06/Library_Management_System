import RoleGuard from "@/app/components/RoleGuard";
import Link from "next/link";

export default function ReaderHomePage() {
    return (
        <RoleGuard allowedRoles={["READER"]}>
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-7xl">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Library
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Find books and manage your borrowings
                        </p>
                    </div>

                    <div className="mt-8">
                        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Find a Book
                            </h2>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                <input
                                    type="text"
                                    placeholder="Search by title, ISBN or author..."
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900"
                                />

                                <button
                                    type="button"
                                    className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-800"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <h3 className="font-semibold text-gray-900">
                                Browse Books
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                Explore available books in the library.
                            </p>

                            <Link
                                href="/books"
                                className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
                            >
                                View Books →
                            </Link>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <h3 className="font-semibold text-gray-900">
                                My Borrowings
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                Check your current and previous borrowings.
                            </p>

                            <Link
                                href="/borrowings"
                                className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
                            >
                                View Borrowings →
                            </Link>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <h3 className="font-semibold text-gray-900">
                                My Profile
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                View and manage your account information.
                            </p>

                            <Link
                                href="/profile"
                                className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
                            >
                                View Profile →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}