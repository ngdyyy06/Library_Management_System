import RoleGuard from "@/app/components/RoleGuard";

export default function StaffHomePage() {
    return (
        <RoleGuard allowedRoles={["LIBRARIAN"]}>
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-7xl">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Librarian Dashboard
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Manage daily library operations
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <p className="text-sm font-medium text-gray-500">
                                Books
                            </p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                --
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                Manage library books
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <p className="text-sm font-medium text-gray-500">
                                Readers
                            </p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                --
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                Manage readers
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <p className="text-sm font-medium text-gray-500">
                                Borrowings
                            </p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                --
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                Manage borrowing records
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <p className="text-sm font-medium text-gray-500">
                                Returns
                            </p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                --
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                Process book returns
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Quick Actions
                        </h2>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <button
                                type="button"
                                className="rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
                            >
                                Create Borrowing
                            </button>

                            <button
                                type="button"
                                className="rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
                            >
                                Process Return
                            </button>

                            <button
                                type="button"
                                className="rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
                            >
                                View Readers
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}