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
        event: React.FormEvent<HTMLFormElement>
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                        <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Library Management</h1>
                    <p className="mt-1 text-sm text-gray-400">Sign in to your account</p>
                </div>

                {/* Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.06.18.06.374 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 5.08A10.8 10.8 0 0112 4.88c5.25 0 9.75 7.12 9.75 7.12a18.3 18.3 0 01-3.02 3.72M6.61 6.61C3.93 8.36 2.25 12 2.25 12s3.5 6 9.75 6c1.38 0 2.65-.3 3.8-.79" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 active:bg-gray-800"
                        >
                            Sign In
                        </button>
                    </form>
                </div>

                {/* Register link */}
                <p className="mt-4 text-center text-sm text-gray-400">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900">
                        Register here
                    </Link>
                </p>

            </div>
        </div>
    );
}