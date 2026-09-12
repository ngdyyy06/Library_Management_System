"use client"

import { useState} from "react";
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
            const token = await loginUser({
                username,
                password,
            });

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
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
                <h1 className="text-2xl font-bold text-gray-900">
                    Login
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Sign in to Library Management System
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-5"
                >
                    <div>
                        <label
                            htmlFor="username"
                            className="mb-2 block text-sm font-medium text-gray-800"
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            placeholder="Enter username"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-800">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                            >
                                {showPassword ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="h-5 w-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.06.18.06.374 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="h-5 w-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 3l18 18"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M10.58 10.58a2 2 0 0 0 2.83 2.83"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9.88 5.08A10.8 10.8 0 0 1 12 4.88c5.25 0 9.75 7.12 9.75 7.12a18.3 18.3 0 0 1-3.02 3.72M6.61 6.61C3.93 8.36 2.25 12 2.25 12s3.5 6 9.75 6c1.38 0 2.65-.3 3.8-.79"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800"
                    >
                        Login
                    </button>

                    <div className="mt-5 text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-gray-900 hover:underline"
                        >
                            Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}