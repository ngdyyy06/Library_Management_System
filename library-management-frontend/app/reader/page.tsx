import RoleGuard from "@/app/components/RoleGuard";
import Link from "next/link";

export default function ReaderHomePage() {
    return (
        <RoleGuard allowedRoles={["READER"]}>
            <div className="min-h-screen bg-slate-50 p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-5xl space-y-8">

                    {/* ── Hero Header ── */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 px-8 py-10 shadow-lg shadow-sky-200/60">
                        {/* Decorative blobs */}
                        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10" />
                        <div className="absolute -bottom-10 left-1/2 h-40 w-40 rounded-full bg-white/10" />

                        <div className="relative">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                    Reader Portal
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                Welcome back! 👋
                            </h1>
                            <p className="mt-2 max-w-lg text-base text-white/80">
                                Discover new books, track your borrowings, and manage your reading journey — all in one place.
                            </p>
                        </div>
                    </div>

                    {/* ── Search Section ── */}
                    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.15 6.15a7.5 7.5 0 0 0 10.5 10.5z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-semibold text-slate-800">
                                Find a Book
                            </h2>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.15 6.15a7.5 7.5 0 0 0 10.5 10.5z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by title, ISBN or author..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-sky-400 focus:bg-white focus:ring-3 focus:ring-sky-400/15"
                                />
                            </div>

                            <button
                                type="button"
                                className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-300/50 active:translate-y-0"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.15 6.15a7.5 7.5 0 0 0 10.5 10.5z" />
                                </svg>
                                Search
                            </button>
                        </div>
                    </div>

                    {/* ── Quick Access Cards ── */}
                    <div>
                        <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            Quick Access
                        </p>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                            {/* Card 1 — Browse Books */}
                            <Link
                                href="/books"
                                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/80"
                            >
                                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-sky-50 transition-transform duration-300 group-hover:scale-150" />

                                <div className="relative">
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-500">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900">
                                        Browse Books
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                                        Explore available books in the library.
                                    </p>

                                    <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-sky-600 transition-all duration-200 group-hover:gap-2">
                                        View Books
                                        <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>

                            {/* Card 2 — My Borrowings */}
                            <Link
                                href="/borrowings"
                                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/80"
                            >
                                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-violet-50 transition-transform duration-300 group-hover:scale-150" />

                                <div className="relative">
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 border border-violet-100 text-violet-500">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900">
                                        My Borrowings
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                                        Check your current and previous borrowings.
                                    </p>

                                    <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-violet-600 transition-all duration-200 group-hover:gap-2">
                                        View Borrowings
                                        <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>

                            {/* Card 3 — My Profile */}
                            <Link
                                href="/profile"
                                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/80"
                            >
                                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-50 transition-transform duration-300 group-hover:scale-150" />

                                <div className="relative">
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900">
                                        My Profile
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                                        View and manage your account information.
                                    </p>

                                    <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-emerald-600 transition-all duration-200 group-hover:gap-2">
                                        View Profile
                                        <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>

                        </div>
                    </div>

                </div>
            </div>
        </RoleGuard>
    );
}