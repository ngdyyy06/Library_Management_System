import RoleGuard from "@/app/components/RoleGuard";

export default function StaffHomePage() {
    return (
        <RoleGuard allowedRoles={["LIBRARIAN"]}>
            <div className="min-h-screen bg-slate-50 p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-7xl space-y-8">

                    {/* ── Page Header ── */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-lg shadow-violet-200/60 text-white">
                        {/* Decorative background glow circles */}
                        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute -bottom-10 right-1/3 h-40 w-40 rounded-full bg-white/10 blur-xl" />

                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Daily Operations
                                    </span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                    Librarian Dashboard
                                </h1>
                                <p className="mt-1 text-sm sm:text-base text-violet-100/90">
                                    Manage books circulation, process returns, and assist readers efficiently.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur-md border border-white/20">
                                <svg className="h-5 w-5 text-violet-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-medium tracking-wide">
                                    Active Workshift
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── 4 Stats Cards ── */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        {/* 1. Books Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-violet-200">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Books
                                </p>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 border border-violet-100 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    --
                                </p>
                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    Manage library books
                                </p>
                            </div>
                        </div>

                        {/* 2. Readers Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-sky-200">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Readers
                                </p>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    --
                                </p>
                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    Manage readers
                                </p>
                            </div>
                        </div>

                        {/* 3. Borrowings Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-amber-200">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Borrowings
                                </p>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    --
                                </p>
                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    Manage borrowing records
                                </p>
                            </div>
                        </div>

                        {/* 4. Returns Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-emerald-200">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Returns
                                </p>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    --
                                </p>
                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    Process book returns
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* ── Quick Actions Section ── */}
                    <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-sm border border-slate-200/80">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                    Quick Actions
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Common daily administrative tasks
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                            {/* Action 1 */}
                            <button
                                type="button"
                                className="group flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50/40 hover:shadow-md hover:shadow-violet-100/50 active:translate-y-0"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-slate-800 group-hover:text-violet-900">
                                            Create Borrowing
                                        </span>
                                        <span className="block text-xs text-slate-500">
                                            Issue books to readers
                                        </span>
                                    </div>
                                </div>
                                <svg className="h-5 w-5 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Action 2 */}
                            <button
                                type="button"
                                className="group flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-md hover:shadow-emerald-100/50 active:translate-y-0"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-slate-800 group-hover:text-emerald-900">
                                            Process Return
                                        </span>
                                        <span className="block text-xs text-slate-500">
                                            Receive returned items
                                        </span>
                                    </div>
                                </div>
                                <svg className="h-5 w-5 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Action 3 */}
                            <button
                                type="button"
                                className="group flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-md hover:shadow-sky-100/50 active:translate-y-0"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-slate-800 group-hover:text-sky-900">
                                            View Readers
                                        </span>
                                        <span className="block text-xs text-slate-500">
                                            Manage borrower directory
                                        </span>
                                    </div>
                                </div>
                                <svg className="h-5 w-5 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </RoleGuard>
    );
}