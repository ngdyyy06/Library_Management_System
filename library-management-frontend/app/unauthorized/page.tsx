"use client"

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
                <h1 className="text-3xl font-bold text-gray-900">
                    Access Denied
                </h1>

                <p className="mt-3 text-gray-600">
                    You do not have permission to access this page.
                </p>

                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="mt-6 rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}