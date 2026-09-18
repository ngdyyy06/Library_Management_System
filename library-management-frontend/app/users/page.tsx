"use client";

import RoleGuard from "@/app/components/RoleGuard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getUsers,
    deactivateUser,
    activateUser,
    updateUser,
    createUser,
} from "@/app/lib/api";

export default function UsersPage() {

    const router = useRouter();

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

    const filteredUsers = users.filter((user) => {

        const matchesSearch =
            user.username
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            user.fullName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (user.email || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesRole =
            roleFilter === "ALL" ||
            user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const totalUsers = users.length;

    const activeUsers = users.filter(
        (u) => u.status === "ACTIVE"
    ).length;

    const inactiveUsers = users.filter(
        (u) => u.status !== "ACTIVE"
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

    const getRoleBadge = (role: string) => {

        switch (role) {

            case "ADMIN":

                return (
                    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                        ADMIN
                    </span>
                );

            case "LIBRARIAN":

                return (
                    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                        LIBRARIAN
                    </span>
                );

            default:

                return (
                    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                        READER
                    </span>
                );
        }
    };

    const inputCls =
        "w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200";

    return (
        <RoleGuard allowedRoles={["ADMIN"]}>

            <div className="min-h-screen bg-white p-6 sm:p-8 lg:p-10">

                <div className="mx-auto max-w-7xl space-y-8">

                    {/* Header */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h1 className="text-2xl font-bold text-gray-900">
                                Users Management
                            </h1>

                            <p className="mt-1 text-sm text-gray-400">
                                Manage user accounts, roles and permission status.
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
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
                        >
                            + Add User
                        </button>

                    </div>

                    {/* Stat Cards */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">

                            <p className="text-xs text-gray-400">
                                Total Users
                            </p>

                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {totalUsers}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                                Registered accounts
                            </p>

                        </div>

                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">

                            <p className="text-xs text-gray-400">
                                Active Users
                            </p>

                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {activeUsers}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                                Normal operation
                            </p>

                        </div>

                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">

                            <p className="text-xs text-gray-400">
                                Inactive Users
                            </p>

                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {inactiveUsers}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                                Disabled or suspended
                            </p>

                        </div>

                    </div>

                    {/* Table Card */}

                    <div className="overflow-hidden rounded-lg border border-gray-200">

                        {/* Search & Filter */}

                        <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center">

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                                placeholder="Search by username, name or email..."
                                className="flex-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 sm:max-w-sm"
                            />

                            <select
                                value={roleFilter}
                                onChange={(e) =>
                                    setRoleFilter(e.target.value)
                                }
                                className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                            >

                                <option value="ALL">
                                    All Roles
                                </option>

                                <option value="ADMIN">
                                    Admin
                                </option>

                                <option value="LIBRARIAN">
                                    Librarian
                                </option>

                                <option value="READER">
                                    Reader
                                </option>

                            </select>

                        </div>

                        {/* Table */}

                        <div className="overflow-x-auto">

                            <table className="w-full text-left text-sm">

                                <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-400">

                                <tr>

                                    <th className="px-5 py-3">
                                        ID
                                    </th>

                                    <th className="px-5 py-3">
                                        Username
                                    </th>

                                    <th className="px-5 py-3">
                                        Full Name
                                    </th>

                                    <th className="px-5 py-3">
                                        Email
                                    </th>

                                    <th className="px-5 py-3">
                                        Role
                                    </th>

                                    <th className="px-5 py-3">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-right">
                                        Actions
                                    </th>

                                </tr>

                                </thead>

                                <tbody className="divide-y divide-gray-100">

                                {filteredUsers.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={7}
                                            className="px-5 py-12 text-center text-sm text-gray-400"
                                        >
                                            No users found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredUsers.map((user) => {

                                        const isActive =
                                            user.status === "ACTIVE";

                                        return (

                                            <tr
                                                key={user.id}
                                                className="transition hover:bg-gray-50"
                                            >

                                                <td className="px-5 py-3.5 font-mono text-xs text-gray-400">
                                                    #{user.id}
                                                </td>

                                                <td className="px-5 py-3.5 font-medium text-gray-800">
                                                    {user.username}
                                                </td>

                                                <td className="px-5 py-3.5 text-gray-600">
                                                    {user.fullName}
                                                </td>

                                                <td className="px-5 py-3.5 text-gray-500">

                                                    {user.email || (

                                                        <span className="text-gray-300">
                                                            —
                                                        </span>

                                                    )}

                                                </td>

                                                <td className="px-5 py-3.5">
                                                    {getRoleBadge(user.role)}
                                                </td>

                                                <td className="px-5 py-3.5">

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                                            isActive
                                                                ? "text-emerald-600"
                                                                : "text-gray-400"
                                                        }`}
                                                    >

                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                isActive
                                                                    ? "bg-emerald-500"
                                                                    : "bg-gray-300"
                                                            }`}
                                                        />

                                                        {user.status}

                                                    </span>

                                                </td>

                                                <td className="px-5 py-3.5 text-right">

                                                    <div className="flex items-center justify-end gap-1">

                                                        {/* View */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/users/${user.id}`
                                                                )
                                                            }
                                                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                                                        >
                                                            View
                                                        </button>

                                                        {/* Edit */}

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                setEditingUser(user);

                                                                setNewPassword("");
                                                                setConfirmPassword("");

                                                                setEditUsername(
                                                                    user.username
                                                                );

                                                                setEditFullName(
                                                                    user.fullName
                                                                );

                                                                setEditEmail(
                                                                    user.email || ""
                                                                );

                                                                setEditRoleId(
                                                                    user.role === "ADMIN"
                                                                        ? 1
                                                                        : user.role === "LIBRARIAN"
                                                                            ? 2
                                                                            : 3
                                                                );

                                                            }}
                                                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                                                        >
                                                            Edit
                                                        </button>

                                                        {/* Activate / Deactivate */}

                                                        {isActive ? (

                                                            <button
                                                                type="button"
                                                                onClick={async () => {

                                                                    if (
                                                                        !window.confirm(
                                                                            `Deactivate "${user.username}"?`
                                                                        )
                                                                    ) {
                                                                        return;
                                                                    }

                                                                    try {

                                                                        await deactivateUser(
                                                                            user.id
                                                                        );

                                                                        setUsers(
                                                                            await getUsers()
                                                                        );

                                                                    } catch (e) {

                                                                        console.error(e);

                                                                    }

                                                                }}
                                                                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                            >
                                                                Deactivate
                                                            </button>

                                                        ) : (

                                                            <button
                                                                type="button"
                                                                onClick={async () => {

                                                                    if (
                                                                        !window.confirm(
                                                                            `Activate "${user.username}"?`
                                                                        )
                                                                    ) {
                                                                        return;
                                                                    }

                                                                    try {

                                                                        await activateUser(
                                                                            user.id
                                                                        );

                                                                        setUsers(
                                                                            await getUsers()
                                                                        );

                                                                    } catch (e) {

                                                                        console.error(e);

                                                                    }

                                                                }}
                                                                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
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

            {/* ========================================================= */}
            {/* Edit User Modal */}
            {/* ========================================================= */}

            {editingUser && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">

                    <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                            <div>

                                <h2 className="text-base font-semibold text-gray-900">
                                    Edit User
                                </h2>

                                <p className="text-xs text-gray-400">
                                    @{editingUser.username}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setEditingUser(null)
                                }
                                className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            >

                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />

                                </svg>

                            </button>

                        </div>

                        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                    Username
                                </label>

                                <input
                                    type="text"
                                    value={editUsername}
                                    onChange={(e) =>
                                        setEditUsername(e.target.value)
                                    }
                                    className={inputCls}
                                />

                            </div>

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={editFullName}
                                    onChange={(e) =>
                                        setEditFullName(e.target.value)
                                    }
                                    className={inputCls}
                                />

                            </div>

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) =>
                                        setEditEmail(e.target.value)
                                    }
                                    className={inputCls}
                                />

                            </div>

                            <div className="grid grid-cols-2 gap-3">

                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        placeholder="Leave blank to keep"
                                        className={inputCls}
                                    />

                                </div>

                                <div>

                                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        placeholder="Confirm"
                                        className={inputCls}
                                    />

                                </div>

                            </div>

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                    Role
                                </label>

                                <select
                                    value={editRoleId}
                                    onChange={(e) =>
                                        setEditRoleId(
                                            Number(e.target.value)
                                        )
                                    }
                                    className={inputCls}
                                >

                                    <option value={1}>
                                        Admin
                                    </option>

                                    <option value={2}>
                                        Librarian
                                    </option>

                                    <option value={3}>
                                        Reader
                                    </option>

                                </select>

                            </div>

                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setEditingUser(null)
                                }
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={async () => {

                                    if (!editingUser) return;

                                    if (!editUsername.trim()) {

                                        window.alert(
                                            "Username is required."
                                        );

                                        return;
                                    }

                                    if (!editFullName.trim()) {

                                        window.alert(
                                            "Full Name is required."
                                        );

                                        return;
                                    }

                                    if (
                                        newPassword &&
                                        newPassword !== confirmPassword
                                    ) {

                                        window.alert(
                                            "Passwords do not match."
                                        );

                                        return;
                                    }

                                    try {

                                        await updateUser(
                                            editingUser.id,
                                            {
                                                username: editUsername,
                                                password: newPassword,
                                                fullName: editFullName,
                                                email: editEmail,
                                                roleId: editRoleId
                                            }
                                        );

                                        setUsers(
                                            await getUsers()
                                        );

                                        setEditingUser(null);

                                        setNewPassword("");
                                        setConfirmPassword("");

                                        window.alert(
                                            "User updated successfully."
                                        );

                                    } catch (error) {

                                        window.alert(
                                            error instanceof Error
                                                ? error.message
                                                : "Failed to update user."
                                        );
                                    }

                                }}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                            >
                                Save Changes
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* ========================================================= */}
            {/* Add User Modal */}
            {/* ========================================================= */}

            {isAddUserOpen && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">

                    <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                            <div>

                                <h2 className="text-base font-semibold text-gray-900">
                                    Create New User
                                </h2>

                                <p className="text-xs text-gray-400">
                                    Add a new account to the system
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsAddUserOpen(false)
                                }
                                className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            >

                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />

                                </svg>

                            </button>

                        </div>

                        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                    Username{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) =>
                                        setNewUsername(e.target.value)
                                    }
                                    placeholder="e.g. john_doe"
                                    className={inputCls}
                                />

                            </div>

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                    Full Name{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={newFullName}
                                    onChange={(e) =>
                                        setNewFullName(e.target.value)
                                    }
                                    placeholder="e.g. John Doe"
                                    className={inputCls}
                                />

                            </div>

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) =>
                                        setNewEmail(e.target.value)
                                    }
                                    placeholder="e.g. john@example.com"
                                    className={inputCls}
                                />

                            </div>

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                    Password{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="password"
                                    value={newUserPassword}
                                    onChange={(e) =>
                                        setNewUserPassword(e.target.value)
                                    }
                                    placeholder="Enter initial password"
                                    className={inputCls}
                                />

                            </div>

                            <div>

                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                    Role
                                </label>

                                <select
                                    value={newRoleId}
                                    onChange={(e) =>
                                        setNewRoleId(
                                            Number(e.target.value)
                                        )
                                    }
                                    className={inputCls}
                                >

                                    <option value={1}>
                                        Admin
                                    </option>

                                    <option value={2}>
                                        Librarian
                                    </option>

                                    <option value={3}>
                                        Reader
                                    </option>

                                </select>

                            </div>

                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setIsAddUserOpen(false)
                                }
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={async () => {

                                    if (!newUsername.trim()) {

                                        window.alert(
                                            "Username is required."
                                        );

                                        return;
                                    }

                                    if (!newFullName.trim()) {

                                        window.alert(
                                            "Full Name is required."
                                        );

                                        return;
                                    }

                                    if (!newUserPassword.trim()) {

                                        window.alert(
                                            "Password is required."
                                        );

                                        return;
                                    }

                                    try {

                                        await createUser({
                                            username: newUsername,
                                            password: newUserPassword,
                                            fullName: newFullName,
                                            email: newEmail,
                                            roleId: newRoleId
                                        });

                                        setUsers(
                                            await getUsers()
                                        );

                                        setIsAddUserOpen(false);

                                        setNewUsername("");
                                        setNewFullName("");
                                        setNewEmail("");
                                        setNewUserPassword("");
                                        setNewRoleId(3);

                                        window.alert(
                                            "User created successfully."
                                        );

                                    } catch (error) {

                                        window.alert(
                                            error instanceof Error
                                                ? error.message
                                                : "Failed to create user."
                                        );
                                    }

                                }}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
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