"use client"

import { useState } from "react";
import { loginUser } from "@/app/lib/api";
import { getCurrentUserRole } from "@/app/lib/api";
import Link from "next/link";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        event: React.SubmitEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");

        if (!username.trim()) {
            setError("Username is required");
            return;
        }

        if (!password) {
            setError("Password is required");
            return;
        }

        try {
            const token = await loginUser({ username, password });
            localStorage.setItem("token", token);

            const role = getCurrentUserRole();
            console.log("Current role:", role);

            if (role === "ADMIN") {
                window.location.href = "/";
            } else if (role === "LIBRARIAN") {
                window.location.href = "/staff";
            } else if (role === "READER") {
                window.location.href = "/reader";
            }
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Login failed"
            );
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">

            {/* ── Left Panel — Brand Showcase ── */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-500 p-12">

                {/* Background decorative circles */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5" />
                <div className="absolute top-1/2 -right-32 h-[28rem] w-[28rem] rounded-full bg-white/5" />
                <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-white/5" />

                {/* Top — Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 text-white shadow-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-base font-bold text-white leading-tight">
                            Library<span className="text-sky-200">Management</span>
                        </p>
                        <p className="text-xs text-indigo-200">
                            Digital Library System
                        </p>
                    </div>
                </div>

                {/* Center — Hero content */}
                <div className="relative space-y-8">
                    {/* Large decorative icon */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 border border-white/20 text-white shadow-2xl backdrop-blur-sm">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
                            Welcome to my<br />
                            <span className="text-sky-200">Digital Library</span>
                        </h2>
                        <p className="max-w-sm text-base leading-relaxed text-indigo-100/80">
                            Manage books, readers, borrowings and returns — all in one place, beautifully organized.
                        </p>
                    </div>

                    {/* Feature highlights */}
                    <div className="space-y-3">
                        {[
                            { icon: "📚", text: "Complete book catalog management" },
                            { icon: "👥", text: "Reader & borrowing tracking" },
                            { icon: "📊", text: "Real-time dashboard insights" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-sm border border-white/10">
                                    {item.icon}
                                </span>
                                <span className="text-sm font-medium text-indigo-100">
                                    {item.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom — Quote */}
                <div className="relative">
                    <blockquote className="border-l-2 border-sky-300/50 pl-4">
                        <p className="text-sm italic text-indigo-100/70">
                            "A library is not a luxury but one of the necessities of life."
                        </p>
                        <footer className="mt-1 text-xs font-medium text-sky-300">
                            — Henry Ward Beecher
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* ── Right Panel — Login Form ── */}
            <div className="flex w-full lg:w-1/2 xl:w-[45%] flex-col items-center justify-center px-6 py-12 sm:px-12">

                {/* Mobile logo — only shown on small screens */}
                <div className="mb-8 flex items-center gap-3 lg:hidden">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-md">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                        Library<span className="text-indigo-600">Management</span>
                    </p>
                </div>

                <div className="w-full max-w-sm">
                    {/* Form Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Sign in to your account
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Enter your credentials to access the system
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Username */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="username"
                                className="block text-sm font-semibold text-slate-700"
                            >
                                Username
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-slate-700"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-colors hover:text-slate-700"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4.5 w-4.5 h-[18px] w-[18px]">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.06.18.06.374 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-[18px] w-[18px]">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.08A10.8 10.8 0 0 1 12 4.88c5.25 0 9.75 7.12 9.75 7.12a18.3 18.3 0 0 1-3.02 3.72M6.61 6.61C3.93 8.36 2.25 12 2.25 12s3.5 6 9.75 6c1.38 0 2.65-.3 3.8-.79" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-sm font-medium text-rose-700">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200/60 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-300/60 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                        >
                            <span className="relative flex items-center justify-center gap-2">
                                Sign In
                                <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>

                        {/* Register link */}
                        <p className="text-center text-sm text-slate-500">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="font-semibold text-indigo-600 transition-colors hover:text-indigo-800 hover:underline underline-offset-2"
                            >
                                Register here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}