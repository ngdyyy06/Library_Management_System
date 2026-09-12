"use client"

import RoleGuard from "@/app/components/RoleGuard";
import { useEffect, useState} from "react";
import {getUsers, deactivateUser, activateUser, updateUser, createUser} from "@/app/lib/api";

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

    return (
        <RoleGuard allowedRoles={["ADMIN"]}>
            <div className="min-h-screen bg-gray-50 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Users Management
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Manage user accounts, roles and account status.
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
                        className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        + Add User
                    </button>
                </div>

                {/* Statistics */}
                <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm font-medium text-gray-500">
                            Total Users
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {totalUsers}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm font-medium text-gray-500">
                            Active Users
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {activeUsers}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm font-medium text-gray-500">
                            Inactive Users
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {inactiveUsers}
                        </p>
                    </div>
                </div>

                {/* Users table */}
                <div className="mt-8 rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                    <div className="border-b border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            User Accounts
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            View and manage registered users.
                        </p>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col gap-4 border-b border-gray-200 p-6 md:flex-row md:items-center md:justify-between">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 md:max-w-md"
                        />

                        <select
                            className="rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-900"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="ALL">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="LIBRARIAN">Librarian</option>
                            <option value="READER">Reader</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Full Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">
                                    Actions
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {users.length === 0 ? (
                                <tr className="border-t border-gray-200">
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-t border-gray-200 hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-gray-700">
                                            {user.id}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {user.username}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {user.fullName}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {user.email || "-"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {user.role}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    user.status === "ACTIVE"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-3">
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
                                                    className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900"
                                                >
                                                    Edit
                                                </button>

                                                {user.status === "ACTIVE" ? (
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
                                                        className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700"
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
                                                        className="cursor-pointer text-sm font-medium text-green-600 hover:text-green-700"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Edit User
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Update user account information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="text-2xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Username
                                </label>

                                <input
                                    type="text"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={editFullName}
                                    onChange={(e) => setEditFullName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>

                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Role
                                </label>

                                <select
                                    value={editRoleId}
                                    onChange={(e) => setEditRoleId(Number(e.target.value))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:border-gray-900"
                                >
                                    <option value={1}>Admin</option>
                                    <option value={2}>Librarian</option>
                                    <option value={3}>Reader</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
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
                                className="cursor-pointer rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAddUserOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Add User
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Create a new user account.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsAddUserOpen(false)}
                                className="cursor-pointer text-2xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Username
                                </label>

                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={newFullName}
                                    onChange={(e) => setNewFullName(e.target.value)}
                                    placeholder="Enter full name"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="Enter email"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Role
                                </label>

                                <select
                                    value={newRoleId}
                                    onChange={(e) => setNewRoleId(Number(e.target.value))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:border-gray-900"
                                >
                                    <option value={1}>Admin</option>
                                    <option value={2}>Librarian</option>
                                    <option value={3}>Reader</option>
                                </select>
                            </div>

                        </div>

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() => setIsAddUserOpen(false)}
                                className="cursor-pointer rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
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
                                className="cursor-pointer rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
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