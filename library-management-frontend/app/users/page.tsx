"use client"

import RoleGuard from "@/app/components/RoleGuard";
import { useEffect, useState} from "react";
import {getUsers} from "@/app/lib/api";

export default function UsersPage() {

    const [users, setUsers] = useState<any[]>([]);

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
                            0
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm font-medium text-gray-500">
                            Active Users
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            0
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm font-medium text-gray-500">
                            Inactive Users
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            0
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
                            placeholder="Search users..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 md:max-w-md"
                        />

                        <select
                            className="rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-900"
                            defaultValue="ALL"
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
                                <th className="px-6 py-4 text-right">
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
                                users.map((user) => (
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

                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                className="text-sm font-medium text-gray-700 hover:text-gray-900"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}