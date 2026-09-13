"use client"

export default function UnauthorizedPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-6 overflow-hidden">
            {/* Background subtle decorative blobs */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-rose-100/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />

            <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
                {/* Shield / Lock Graphic */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500/10 via-amber-500/10 to-rose-500/20 border border-rose-200/60 shadow-inner">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 text-white shadow-md shadow-rose-200">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-rose-500 ring-2 ring-white" />
                        </span>
                    </div>
                </div>

                {/* Error Code Pill */}
                <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-600 border border-rose-100">
                    403 Error
                </span>

                {/* Title & Description */}
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    Access Denied
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    You do not have permission to access this page. Please contact your system administrator if you believe this is a mistake.
                </p>

                {/* Back Action Button */}
                <div className="mt-8">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:translate-y-0 active:scale-[0.99]"
                    >
                        <svg
                            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Go Back</span>
                    </button>
                </div>
            </div>
        </div>
    );
}