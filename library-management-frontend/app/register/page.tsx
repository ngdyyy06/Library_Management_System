"use client"

import { useState } from "react";
import { registerUser } from "@/app/lib/api";
import Link from "next/link";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!username.trim()) { setError("Username is required"); return; }
        if (!fullName.trim()) { setError("Full name is required"); return; }
        if (!email.trim()) { setError("Email is required"); return; }
        if (!password) { setError("Password is required"); return; }
        if (password !== confirmPassword) { setError("Passwords do not match"); return; }

        try {
            await registerUser({ username, password, fullName, email });
            setUsername(""); setFullName(""); setEmail("");
            setPassword(""); setConfirmPassword("");
            alert("Registration successful!");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Registration failed");
        }
    };

    const EyeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-[18px] w-[18px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.06.18.06.374 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );

    const EyeOffIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-[18px] w-[18px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.08A10.8 10.8 0 0 1 12 4.88c5.25 0 9.75 7.12 9.75 7.12a18.3 18.3 0 0 1-3.02 3.72M6.61 6.61C3.93 8.36 2.25 12 2.25 12s3.5 6 9.75 6c1.38 0 2.65-.3 3.8-.79" />
        </svg>
    );

    return (
        <div className="flex min-h-screen bg-slate-50">

            {/* ── Left Panel — Brand ── */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] relative flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-500 p-12">
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5" />
                <div className="absolute top-1/2 -right-32 h-[28rem] w-[28rem] rounded-full bg-white/5" />
                <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-white/5" />

                {/* Logo */}
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
                        <p className="text-xs text-indigo-200">Digital Library System</p>
                    </div>
                </div>

                {/* Hero */}
                <div className="relative space-y-8">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 border border-white/20 text-white shadow-2xl backdrop-blur-sm">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
                            Join our<br />
                            <span className="text-sky-200">Library Community</span>
                        </h2>
                        <p className="max-w-sm text-base leading-relaxed text-indigo-100/80">
                            Create your account in seconds and start exploring thousands of books available at your fingertips.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            { icon: "✅", text: "Free reader account" },
                            { icon: "🔍", text: "Search & reserve books online" },
                            { icon: "📅", text: "Track due dates & borrowing history" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-sm border border-white/10">
                                    {item.icon}
                                </span>
                                <span className="text-sm font-medium text-indigo-100">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer quote */}
                <div className="relative">
                    <blockquote className="border-l-2 border-sky-300/50 pl-4">
                        <p className="text-sm italic text-indigo-100/70">
                            "The more that you read, the more things you will know."
                        </p>
                        <footer className="mt-1 text-xs font-medium text-sky-300">— Dr. Seuss</footer>
                    </blockquote>
                </div>
            </div>

            {/* ── Right Panel — Form ── */}
            <div className="flex w-full lg:w-1/2 xl:w-[55%] flex-col items-center justify-center px-6 py-10 sm:px-12">

                {/* Mobile logo */}
                <div className="mb-6 flex items-center gap-3 lg:hidden">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-md">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                        Library<span className="text-indigo-600">Management</span>
                    </p>
                </div>

                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-7">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Create your account
                        </h1>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Fill in the details below to get started
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-sm font-medium text-rose-700">{error}</p>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>

                        {/* Username */}
                        <div className="space-y-1.5">
                            <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
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
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15"
                                />
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Enter full name"
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                                Email
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15"
                                />
                            </div>
                        </div>

                        {/* Password + Confirm — 2 columns */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
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
                                        placeholder="Password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700"
                                    >
                                        {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                                    Confirm
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700"
                                    >
                                        {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="group mt-1 relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300/60 active:translate-y-0"
                        >
                            <span className="relative flex items-center justify-center gap-2">
                                Create Account
                                <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>

                        {/* Login link */}
                        <p className="text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-indigo-600 transition-colors hover:text-indigo-800 hover:underline underline-offset-2"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}