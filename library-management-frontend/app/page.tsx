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
        <div className="min-h-screen bg-slate-50 p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-7xl space-y-8">

            {/* ── Page Header ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    Dashboard
                  </h1>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Live System
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Real-time operational metrics and circulation overview of your library.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm sm:self-auto">
                <svg
                    className="h-4 w-4 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>

                <span>Library Management Hub</span>
              </div>
            </div>

            {/* ── Main Statistics ── */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {/* 1. Books */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Books
                    </p>

                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalBooks ?? 0}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Titles in catalog
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 2. Book Copies */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Book Copies
                    </p>

                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalBookCopies ?? 0}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Physical copies
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a2 2 0 01.707.293l4.414 4.414a2 2 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 3. Authors */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Authors
                    </p>

                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalAuthors ?? 0}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Cataloged authors
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 4. Readers */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Readers
                    </p>

                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalReaders ?? 0}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Registered readers
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 5. Publishers */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Publishers
                    </p>

                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalPublishers ?? 0}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Publishing partners
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4V3h6v2h4a2 2 0 012 2v12a2 2 0 01-2 2zM9 21V9h6v12M7 9h10"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 6. Categories */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-100/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Categories
                    </p>

                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalCategories ?? 0}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Book categories
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-pink-100 bg-pink-50 text-pink-600 transition-colors group-hover:bg-pink-600 group-hover:text-white">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h10a2 2 0 012 2v2l-8 8-4-4 8-8H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 7. Import Receipts */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-100/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Import Receipts
                    </p>

                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                      0
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Book receiving records
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v10m0 0l-4-4m4 4l4-4M5 20h14a2 2 0 002-2v-3a2 2 0 00-2-2h-2m-10 0H5a2 2 0 00-2 2v3a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 7. Borrowings */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Borrowings
                    </p>

                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                      {dashboard?.totalBorrowings ?? 0}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Borrowing records
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.121 5.121A2 2 0 0118 9.121V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Revenue Section ── */}
            <div className="grid gap-5 lg:grid-cols-2">

              {/* Today Revenue */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-emerald-50/20 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />

                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Today&apos;s Fine Revenue
                      </p>
                    </div>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {(dashboard?.todayFineRevenue ?? 0).toLocaleString("vi-VN")}
                      </span>

                      <span className="text-sm font-bold text-emerald-600">
                        VND
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-400">
                      Fine revenue collected today
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/70 text-xl font-bold text-emerald-700 shadow-sm">
                    ₫
                  </div>
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-sky-50/20 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />

                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        This Month&apos;s Fine Revenue
                      </p>
                    </div>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {(dashboard?.monthlyFineRevenue ?? 0).toLocaleString("vi-VN")}
                      </span>

                      <span className="text-sm font-bold text-sky-600">
                        VND
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-400">
                      Fine revenue collected this month
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100/70 text-xl font-bold text-sky-700 shadow-sm">
                    ₫
                  </div>
                </div>
              </div>

            </div>

            {/* ── User Overview Section ── */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    User Overview
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Current status of system user accounts
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Accounts
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">

                {/* Total Users */}
                <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-5 transition-all hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Users
                    </p>

                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  </div>

                  <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {dashboard?.totalUsers ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    All registered roles
                  </p>
                </div>

                {/* Active Users */}
                <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-5 transition-all hover:bg-emerald-50/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      Active Users
                    </p>

                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  </div>

                  <p className="mt-3 text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
                    {dashboard?.activeUsers ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-emerald-600/80">
                    Normal operations
                  </p>
                </div>

                {/* Inactive Users */}
                <div className="rounded-xl border border-rose-200/60 bg-rose-50/30 p-5 transition-all hover:bg-rose-50/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                      Inactive Users
                    </p>

                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                  </div>

                  <p className="mt-3 text-2xl font-extrabold tracking-tight text-rose-950 sm:text-3xl">
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