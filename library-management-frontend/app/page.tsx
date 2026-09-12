import RoleGuard from "@/app/components/RoleGuard";

export default function Home() {
  return (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div className="min-h-screen bg-gray-100 p-8">
        <main className="ml-64 min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold text-gray-900">
              Library Management System
            </h1>

            <p className="mt-2 text-gray-600">
              Library management dashboard
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900">Books</h2>
                <p className="mt-2 text-gray-500">
                  Manage books
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900">Readers</h2>
                <p className="mt-2 text-gray-500">
                  Manage readers
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900">Authors</h2>
                <p className="mt-2 text-gray-500">
                  Manage authors
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900">Borrowings</h2>
                <p className="mt-2 text-gray-500">
                  Manage borrowings
                </p>
              </div>
            </div>
          </div>
        </main>
        </div>
      </RoleGuard>
  );
}