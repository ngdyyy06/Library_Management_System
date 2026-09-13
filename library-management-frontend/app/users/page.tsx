"use client"

import RoleGuard from "@/app/components/RoleGuard";
import { useEffect, useState } from "react";
import { getUsers, deactivateUser, activateUser, updateUser, createUser } from "@/app/lib/api";

export default function UsersPage() {

    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [editUsername, setEditUsername] = useState("");
    const [editFullName, setEditFullName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editRoleId, setEditRoleId] = useState(3);

    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newFullName, setNewFullName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newRoleId, setNewRoleId] = useState(3);

    // search and filter
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole =
            roleFilter === "ALL" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    // tính tổng số users
    const totalUsers = users.length;

    const activeUsers = users.filter(
        (user) => user.status === "ACTIVE"
    ).length;

    const inactiveUsers = users.filter(
        (user) => user.status !== "ACTIVE"
    ).length;

    useEffect(() => {
        async function loadUsers() {
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (error) {
                console.error(error);
            }
        }

        loadUsers();
    }, []);

    // Helper render role badge
    const getRoleBadge = (role: string) => {
        switch (role) {
            case "ADMIN":
                return (
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/80">
                        ADMIN
                    </span>
                );
            case "LIBRARIAN":
                return (
                    <span className="inline-flex items-center rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200/80">
                        LIBRARIAN
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 border border-sky-200/80">
                        READER
                    </span>
                );
        }
    };

    return (
        <RoleGuard allowedRoles={["ADMIN"]}>
            <div className="min-h-screen bg-slate-50 p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-7xl space-y-8">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                    Users Management
                                </h1>
                                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 border border-indigo-100">
                                    Admin
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                                Manage user accounts, roles and permission status across the system.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setIsAddUserOpen(true);
                                setNewUsername("");
                                setNewFullName("");
                                setNewEmail("");
                                setNewUserPassword("");
                                setNewRoleId(3);
                            }}
                            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300/60 active:translate-y-0"
                        >
                            <svg className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add User</span>
                        </button>
                    </div>

                    {/* ── Statistics Cards ── */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

                        {/* Total Users */}
                        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-indigo-200">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Total Users
                                </p>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    {totalUsers}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Registered system accounts
                                </p>
                            </div>
                        </div>

                        {/* Active Users */}
                        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-emerald-200">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Active Users
                                </p>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    {activeUsers}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Normal operation status
                                </p>
                            </div>
                        </div>

                        {/* Inactive Users */}
                        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-rose-200">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Inactive Users
                                </p>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 transition-colors group-hover:bg-rose-600 group-hover:text-white">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    {inactiveUsers}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Disabled or suspended
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* ── Table Card ── */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

                        {/* Table Header / Subtitle */}
                        <div className="border-b border-slate-100 px-6 py-5">
                            <h2 className="text-base font-bold text-slate-900">
                                User Accounts Directory
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-400">
                                Showing {filteredUsers.length} of {totalUsers} accounts
                            </p>
                        </div>

                        {/* Search & Filter bar */}
                        <div className="flex flex-col gap-3.5 border-b border-slate-100 bg-slate-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1 sm:max-w-md">
                                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.15 6.15a7.5 7.5 0 0 0 10.5 10.5z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by username, full name, or email..."
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 outline-none transition-all duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="ALL">All Roles</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="LIBRARIAN">Librarian</option>
                                    <option value="READER">Reader</option>
                                </select>
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">ID</th>
                                    <th className="px-6 py-3.5">User</th>
                                    <th className="px-6 py-3.5">Full Name</th>
                                    <th className="px-6 py-3.5">Email</th>
                                    <th className="px-6 py-3.5">Role</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <p className="mt-3 text-sm font-semibold text-slate-700">No users found</p>
                                            <p className="mt-1 text-xs text-slate-400">Try adjusting your search or role filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const firstLetter = (user.fullName || user.username || "U").charAt(0).toUpperCase();
                                        const isActive = user.status === "ACTIVE";

                                        return (
                                            <tr key={user.id} className="transition-colors duration-150 hover:bg-slate-50/70">
                                                <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                                    #{user.id}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-xs font-bold text-white shadow-sm">
                                                            {firstLetter}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900 leading-tight">
                                                                {user.username}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 font-medium text-slate-700">
                                                    {user.fullName}
                                                </td>

                                                <td className="px-6 py-4 text-slate-500">
                                                    {user.email || <span className="text-slate-300">-</span>}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {getRoleBadge(user.role)}
                                                </td>

                                                <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            isActive
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                                                                : "bg-slate-100 text-slate-600 border border-slate-200"
                                                        }`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                                                            {user.status}
                                                        </span>
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingUser(user);
                                                                setNewPassword("");
                                                                setConfirmPassword("");

                                                                setEditUsername(user.username);
                                                                setEditFullName(user.fullName);
                                                                setEditEmail(user.email || "");

                                                                setEditRoleId(
                                                                    user.role === "ADMIN"
                                                                        ? 1
                                                                        : user.role === "LIBRARIAN"
                                                                            ? 2
                                                                            : 3
                                                                );
                                                            }}
                                                            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                                        >
                                                            Edit
                                                        </button>

                                                        {isActive ? (
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    const confirm = window.confirm(
                                                                        `Are you sure you want to deactivate user "${user.username}"?`
                                                                    );

                                                                    if (!confirm) {
                                                                        return;
                                                                    }

                                                                    try {
                                                                        await deactivateUser(user.id);

                                                                        const data = await getUsers();
                                                                        setUsers(data);
                                                                    } catch (error) {
                                                                        console.error(error);
                                                                    }
                                                                }}
                                                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                                                            >
                                                                Deactivate
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    const confirm = window.confirm(
                                                                        `Are you sure you want to activate user "${user.username}"?`
                                                                    );

                                                                    if (!confirm) {
                                                                        return;
                                                                    }

                                                                    try {
                                                                        await activateUser(user.id);

                                                                        const data = await getUsers();
                                                                        setUsers(data);
                                                                    } catch (error) {
                                                                        console.error(error);
                                                                    }
                                                                }}
                                                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                                                            >
                                                                Activate
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>

                    </div>

                </div>
            </div>

            {/* ── Edit User Modal ── */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Edit User Account
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Update details for @{editingUser.username}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={editFullName}
                                    onChange={(e) => setEditFullName(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Leave blank to keep current"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Account Role
                                </label>
                                <select
                                    value={editRoleId}
                                    onChange={(e) => setEditRoleId(Number(e.target.value))}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                >
                                    <option value={1}>Admin</option>
                                    <option value={2}>Librarian</option>
                                    <option value={3}>Reader</option>
                                </select>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    if (!editingUser) return;

                                    if (!editUsername.trim()) {
                                        window.alert("Username is required.");
                                        return;
                                    }

                                    if (!editFullName.trim()) {
                                        window.alert("Full Name is required.");
                                        return;
                                    }

                                    if (newPassword && newPassword !== confirmPassword) {
                                        window.alert("Passwords do not match.");
                                        return;
                                    }

                                    try {
                                        await updateUser(editingUser.id, {
                                            username: editUsername,
                                            password: newPassword,
                                            fullName: editFullName,
                                            email: editEmail,
                                            roleId: editRoleId,
                                        });

                                        const data = await getUsers();
                                        setUsers(data);

                                        setEditingUser(null);
                                        setNewPassword("");
                                        setConfirmPassword("");

                                        window.alert("User updated successfully.");
                                    } catch (error) {
                                        console.error(error);

                                        if (error instanceof Error) {
                                            window.alert(error.message);
                                        } else {
                                            window.alert("Failed to update user.");
                                        }
                                    }
                                }}
                                className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-200/60 transition-all hover:shadow-lg active:scale-95"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add User Modal ── */}
            {isAddUserOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Create New User
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Add a new account to LibraryManagement
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsAddUserOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Username <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="e.g. john_doe"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newFullName}
                                    onChange={(e) => setNewFullName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="e.g. john@example.com"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Password <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    placeholder="Enter initial password"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Role
                                </label>
                                <select
                                    value={newRoleId}
                                    onChange={(e) => setNewRoleId(Number(e.target.value))}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                                >
                                    <option value={1}>Admin</option>
                                    <option value={2}>Librarian</option>
                                    <option value={3}>Reader</option>
                                </select>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setIsAddUserOpen(false)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    if (!newUsername.trim()) {
                                        window.alert("Username is required.");
                                        return;
                                    }

                                    if (!newFullName.trim()) {
                                        window.alert("Full Name is required.");
                                        return;
                                    }

                                    if (!newUserPassword.trim()) {
                                        window.alert("Password is required.");
                                        return;
                                    }

                                    try {
                                        await createUser({
                                            username: newUsername,
                                            password: newUserPassword,
                                            fullName: newFullName,
                                            email: newEmail,
                                            roleId: newRoleId,
                                        });

                                        const data = await getUsers();
                                        setUsers(data);

                                        setIsAddUserOpen(false);

                                        setNewUsername("");
                                        setNewFullName("");
                                        setNewEmail("");
                                        setNewUserPassword("");
                                        setNewRoleId(3);

                                        window.alert("User created successfully.");
                                    } catch (error) {
                                        console.error(error);

                                        if (error instanceof Error) {
                                            window.alert(error.message);
                                        } else {
                                            window.alert("Failed to create user.");
                                        }
                                    }
                                }}
                                className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-200/60 transition-all hover:shadow-lg active:scale-95"
                            >
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </RoleGuard>
    );
}