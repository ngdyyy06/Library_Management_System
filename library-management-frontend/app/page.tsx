"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import { getDashboard } from "@/app/lib/api";

export default function Home() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    getDashboard()
        .then((data) => {
          setDashboard(data);
        })
        .catch((error) => {
          console.error("Failed to load dashboard:", error);
        });
  }, []);

  return (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div className="min-h-screen bg-[#f7f8fa] p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-7xl space-y-6">

            {/* ── Page Header ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Dashboard
                  </h1>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Live System
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Real-time operational metrics and circulation overview of your library.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm sm:self-auto">
                <svg
                    className="h-4 w-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.7}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>

                <span>Library Management Hub</span>
              </div>
            </div>

            {/* ── Main Statistics ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Books */}
              <button
                  type="button"
                  onClick={() => router.push("/books")}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Books
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalBooks ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Titles in catalog
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.6}
                          d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v17H6.5A2.5 2.5 0 014 16.5v-12A2.5 2.5 0 016.5 2z"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Returns Today */}
              <button
                  type="button"
                  onClick={() => router.push("/borrowings")}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Returns Today
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.todayReturns ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Books returned today
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.6}
                          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414A1 1 0 0120 8v7a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Active Borrowings */}
              <button
                  type="button"
                  onClick={() => router.push("/borrowings")}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Active Borrowings
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.activeBorrowings ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Current borrowing records
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.6}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a2 2 0 01.707.293l5.121 5.121A2 2 0 0118 9.121V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Borrowings */}
              <button
                  type="button"
                  onClick={() => router.push("/borrowings")}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Borrowings
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalBorrowings ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Borrowing records
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.6}
                          d="M9 12h6m-6 4h4m5 5H6a2 2 0 01-2-2V6a2 2 0 012-2h8l4 4v11a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </button>

            </div>

            {/* ── Revenue ── */}
            <div className="grid gap-4 lg:grid-cols-2">

              {/* Today's Revenue */}
              <button
                  type="button"
                  onClick={() => router.push("/borrowings")}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Today&apos;s Revenue
                      </p>
                    </div>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold tracking-tight text-slate-900">
                        {(dashboard?.todayRevenue ?? 0).toLocaleString("vi-VN")}
                      </span>

                      <span className="text-sm font-semibold text-slate-500">
                        VND
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-400">
                      Total revenue collected today
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-600">
                    ₫
                  </div>
                </div>
              </button>

              {/* This Month's Revenue */}
              <button
                  type="button"
                  onClick={() => router.push("/borrowings")}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />

                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        This Month&apos;s Revenue
                      </p>
                    </div>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold tracking-tight text-slate-900">
                        {(dashboard?.monthlyRevenue ?? 0).toLocaleString("vi-VN")}
                      </span>

                      <span className="text-sm font-semibold text-slate-500">
                        VND
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-400">
                      Total revenue collected this month
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-lg font-bold text-sky-600">
                    ₫
                  </div>
                </div>
              </button>

            </div>

          </div>
        </div>
      </RoleGuard>
  );
}