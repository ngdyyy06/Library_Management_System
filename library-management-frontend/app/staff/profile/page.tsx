"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/app/components/RoleGuard";
import {
    getMyStaffProfile,
    updateMyStaffProfile,
} from "@/app/lib/api";

interface User {
    id: number;
    username: string;
    fullName: string;
    email: string | null;
    role: {
        id: number;
        name: string;
    };
    status: string;
}

interface Staff {
    id: number;
    user: User;
    phone: string | null;
    address: string | null;
    dateOfBirth: string | null;
}

export default function StaffProfilePage() {

    const [staff, setStaff] = useState<Staff | null>(null);

    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [successMessage, setSuccessMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            setLoading(true);
            setErrorMessage("");

            const data = await getMyStaffProfile();

            setStaff(data);

            setForm({
                fullName: data.user?.fullName || "",
                email: data.user?.email || "",
                phone: data.phone || "",
                address: data.address || "",
                dateOfBirth: data.dateOfBirth || "",
            });

        } catch (error) {
            console.error(error);

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to load profile"
            );
        } finally {
            setLoading(false);
        }
    }

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleCancel() {
        if (!staff) return;

        setForm({
            fullName: staff.user?.fullName || "",
            email: staff.user?.email || "",
            phone: staff.phone || "",
            address: staff.address || "",
            dateOfBirth: staff.dateOfBirth || "",
        });

        setEditing(false);
        setErrorMessage("");
        setSuccessMessage("");
    }

    async function handleSave() {
        try {
            setSaving(true);
            setErrorMessage("");
            setSuccessMessage("");

            const updated =
                await updateMyStaffProfile(form);

            setStaff(updated);

            setForm({
                fullName:
                    updated.user?.fullName || "",
                email:
                    updated.user?.email || "",
                phone:
                    updated.phone || "",
                address:
                    updated.address || "",
                dateOfBirth:
                    updated.dateOfBirth || "",
            });

            setEditing(false);
            setSuccessMessage(
                "Profile updated successfully."
            );

        } catch (error) {
            console.error(error);

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to update profile"
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <RoleGuard allowedRoles={["LIBRARIAN"]}>
                <div className="min-h-screen bg-white p-6 sm:p-8 lg:p-10">
                    <div className="mx-auto max-w-5xl">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-400">
                            Loading profile...
                        </div>
                    </div>
                </div>
            </RoleGuard>
        );
    }

    if (errorMessage && !staff) {
        return (
            <RoleGuard allowedRoles={["LIBRARIAN"]}>
                <div className="min-h-screen bg-white p-6 sm:p-8 lg:p-10">
                    <div className="mx-auto max-w-5xl">
                        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
                            {errorMessage}
                        </div>
                    </div>
                </div>
            </RoleGuard>
        );
    }

    if (!staff) {
        return null;
    }

    return (
        <RoleGuard allowedRoles={["LIBRARIAN"]}>
            <div className="min-h-screen bg-white p-6 sm:p-8 lg:p-10">

                <div className="mx-auto max-w-5xl">

                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                My Profile
                            </h1>

                            <p className="mt-1 text-sm text-gray-400">
                                View and update your personal information.
                            </p>
                        </div>

                        {!editing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(true);
                                    setSuccessMessage("");
                                    setErrorMessage("");
                                }}
                                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Messages */}
                    {successMessage && (
                        <div className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mb-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {errorMessage}
                        </div>
                    )}

                    <div className="space-y-6">

                        {/* Account Information */}
                        <div className="overflow-hidden rounded-xl border border-gray-200">

                            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Account Information
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-400">
                                    Basic information of your staff account.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2">

                                {/* Username */}
                                <div>
                                    <p className="text-xs font-medium text-gray-400">
                                        Username
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        {staff.user.username}
                                    </p>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <p className="text-xs font-medium text-gray-400">
                                        Full Name
                                    </p>

                                    {editing ? (
                                        <input
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-800">
                                            {staff.user.fullName || "—"}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <p className="text-xs font-medium text-gray-400">
                                        Email
                                    </p>

                                    {editing ? (
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-800">
                                            {staff.user.email || "—"}
                                        </p>
                                    )}
                                </div>

                                {/* Role */}
                                <div>
                                    <p className="text-xs font-medium text-gray-400">
                                        Role
                                    </p>

                                    <span className="mt-1 inline-flex rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                                        {staff.user.role?.name || "LIBRARIAN"}
                                    </span>
                                </div>

                                {/* Status */}
                                <div>
                                    <p className="text-xs font-medium text-gray-400">
                                        Status
                                    </p>

                                    <p className="mt-1">
                                        <span
                                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                                staff.user.status === "ACTIVE"
                                                    ? "text-emerald-600"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    staff.user.status === "ACTIVE"
                                                        ? "bg-emerald-500"
                                                        : "bg-gray-300"
                                                }`}
                                            />

                                            {staff.user.status}
                                        </span>
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="overflow-hidden rounded-xl border border-gray-200">

                            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Personal Information
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-400">
                                    Personal information associated with your staff profile.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2">

                                {/* Phone */}
                                <div>
                                    <p className="text-xs font-medium text-gray-400">
                                        Phone
                                    </p>

                                    {editing ? (
                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-800">
                                            {staff.phone || "—"}
                                        </p>
                                    )}
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <p className="text-xs font-medium text-gray-400">
                                        Date of Birth
                                    </p>

                                    {editing ? (
                                        <input
                                            name="dateOfBirth"
                                            type="date"
                                            value={form.dateOfBirth}
                                            onChange={handleChange}
                                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-800">
                                            {staff.dateOfBirth || "—"}
                                        </p>
                                    )}
                                </div>

                                {/* Address */}
                                <div className="sm:col-span-2">
                                    <p className="text-xs font-medium text-gray-400">
                                        Address
                                    </p>

                                    {editing ? (
                                        <textarea
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            rows={3}
                                            className="mt-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-800">
                                            {staff.address || "—"}
                                        </p>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Action Buttons */}
                        {editing && (
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                            </div>
                        )}

                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}