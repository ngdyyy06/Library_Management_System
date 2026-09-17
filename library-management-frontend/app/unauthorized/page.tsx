"use client"

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">

                {/* Icon */}
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                    <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                {/* Badge */}
                <span className="inline-block rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                    403 Forbidden
                </span>

                {/* Text */}
                <h1 className="mt-3 text-xl font-bold text-gray-900">Access Denied</h1>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                    You do not have permission to view this page. Contact your administrator if you think this is a mistake.
                </p>

                {/* Button */}
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="mt-6 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 active:bg-gray-800"
                >
                    ← Go Back
                </button>

            </div>
        </div>
    );
}