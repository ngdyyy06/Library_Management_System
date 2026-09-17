"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/app/components/RoleGuard";
import { getDashboard } from "@/app/lib/api";

export default function Home() {
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {/* Books */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
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
              </div>

              {/* Book Copies */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Book Copies
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalBookCopies ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Physical copies
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
              </div>

              {/* Authors */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Authors
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalAuthors ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Cataloged authors
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Readers */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Readers
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalReaders ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Registered readers
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Publishers */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Publishers
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalPublishers ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Publishing partners
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
                          d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4V3h6v2h4a2 2 0 012 2v12a2 2 0 01-2 2zM9 21V9h6v12M7 9h10"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Categories
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalCategories ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Book categories
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
                          d="M7 7h.01M7 3h10a2 2 0 012 2v2l-8 8-4-4 8-8H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Import Receipts */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Import Receipts
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalImportReceipts ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Book receiving records
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
                          d="M12 4v10m0 0l-4-4m4 4l4-4M5 20h14a2 2 0 002-2v-3a2 2 0 00-2-2h-2m-10 0H5a2 2 0 00-2 2v3a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Borrowings */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.121 5.121A2 2 0 0118 9.121V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Revenue Section ── */}
            <div className="grid gap-4 lg:grid-cols-2">

              {/* Today Revenue */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Today&apos;s Fine Revenue
                      </p>
                    </div>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold tracking-tight text-slate-900">
                        {(dashboard?.todayFineRevenue ?? 0).toLocaleString("vi-VN")}
                      </span>

                      <span className="text-sm font-semibold text-slate-500">
                        VND
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-400">
                      Fine revenue collected today
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-600">
                    ₫
                  </div>
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />

                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        This Month&apos;s Fine Revenue
                      </p>
                    </div>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold tracking-tight text-slate-900">
                        {(dashboard?.monthlyFineRevenue ?? 0).toLocaleString("vi-VN")}
                      </span>

                      <span className="text-sm font-semibold text-slate-500">
                        VND
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-400">
                      Fine revenue collected this month
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-lg font-bold text-sky-600">
                    ₫
                  </div>
                </div>
              </div>
            </div>

            {/* ── User Overview Section ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    User Overview
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Current status of system user accounts
                  </p>
                </div>

                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Accounts
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">

                {/* Total Users */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Users
                    </p>

                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  </div>

                  <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {dashboard?.totalUsers ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    All registered roles
                  </p>
                </div>

                {/* Active Users */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      Active Users
                    </p>

                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  </div>

                  <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-900 sm:text-3xl">
                    {dashboard?.activeUsers ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-emerald-600/80">
                    Normal operations
                  </p>
                </div>

                {/* Inactive Users */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                      Inactive Users
                    </p>

                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  </div>

                  <p className="mt-3 text-2xl font-bold tracking-tight text-rose-900 sm:text-3xl">
                    {dashboard?.inactiveUsers ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-rose-600/80">
                    Disabled / Suspended
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </RoleGuard>
  );
}