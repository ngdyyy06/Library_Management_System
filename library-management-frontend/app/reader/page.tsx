import RoleGuard from "@/app/components/RoleGuard";
import Link from "next/link";

export default function ReaderHomePage() {
    return (
        <RoleGuard allowedRoles={["READER"]}>
            <div className="min-h-screen bg-[#f7f8fa] p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* Header */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Reader Portal
                                    </span>
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    Welcome back!
                                </h1>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                    Discover new books, track your borrowings, and
                                    manage your reading journey in one place.
                                </p>
                            </div>

                            <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200 sm:flex">
                                <svg
                                    className="h-7 w-7"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.6}
                                        d="M5 5.5A2.5 2.5 0 017.5 3H12v17H7.5A2.5 2.5 0 015 17.5v-12zM12 3h4.5A2.5 2.5 0 0119 5.5v12a2.5 2.5 0 01-2.5 2.5H12"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                    Quick Access
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Access your library services
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                            {/* Browse Books */}
                            <Link
                                href="/reader/books"
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
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

                                    <svg
                                        className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.7}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>

                                <h3 className="mt-5 text-base font-bold text-slate-900">
                                    Browse Books
                                </h3>

                                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                                    Explore available books in the library.
                                </p>

                                <div className="mt-5 text-xs font-semibold text-slate-600 transition group-hover:text-slate-900">
                                    View Books
                                </div>
                            </Link>

                            {/* My Borrowings */}
                            <Link
                                href="/reader/borrowings"
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
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
                                    </div>

                                    <svg
                                        className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.7}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>

                                <h3 className="mt-5 text-base font-bold text-slate-900">
                                    My Borrowings
                                </h3>

                                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                                    Check your current and previous borrowings.
                                </p>

                                <div className="mt-5 text-xs font-semibold text-slate-600 transition group-hover:text-slate-900">
                                    View Borrowings
                                </div>
                            </Link>

                            {/* Borrowing Requests */}
                            <Link
                                href="/reader/borrowings/request"
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
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
                                                d="M12 5v14M5 12h14"
                                            />
                                        </svg>
                                    </div>

                                    <svg
                                        className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.7}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>

                                <h3 className="mt-5 text-base font-bold text-slate-900">
                                    Borrowing Requests
                                </h3>

                                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                                    Request books and track your borrowing requests.
                                </p>

                                <div className="mt-5 text-xs font-semibold text-slate-600 transition group-hover:text-slate-900">
                                    View Requests
                                </div>
                            </Link>

                            {/* My Profile */}
                            <Link
                                href="/reader/profile"
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
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
                                    </div>

                                    <svg
                                        className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.7}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>

                                <h3 className="mt-5 text-base font-bold text-slate-900">
                                    My Profile
                                </h3>

                                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                                    View and manage your account information.
                                </p>

                                <div className="mt-5 text-xs font-semibold text-slate-600 transition group-hover:text-slate-900">
                                    View Profile
                                </div>
                            </Link>

                        </div>
                    </div>

                </div>
            </div>
        </RoleGuard>
    );
}