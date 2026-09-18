"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/app/components/RoleGuard";
import { updateMyReaderProfile } from "@/app/lib/api";

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    username: string;
    fullName: string;
    email: string;
    role: Role;
    status: string;
}

interface Reader {
    id: number;
    readerCode: string;
    fullName: string;
    email: string;
    phone: string;
    address: string | null;
    dateOfBirth: string | null;
    status: string;
    createdAt: string;
    user: User | null;
}

export default function ProfilePage() {
    const router = useRouter();

    const [reader, setReader] = useState<Reader | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editing, setEditing] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch(
                "http://localhost:8080/api/readers/me",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    errorData?.message ||
                    "Failed to load profile"
                );
            }

            const data: Reader = await response.json();

            setReader(data);

            setForm({
                fullName: data.fullName || "",
                email: data.email || "",
                phone: data.phone === "N/A"
                    ? ""
                    : data.phone || "",
                address: data.address || "",
                dateOfBirth: data.dateOfBirth || "",
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load profile"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        field: keyof typeof form,
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleEdit = () => {
        setSuccess("");
        setError("");
        setEditing(true);
    };

    const handleCancel = () => {
        if (!reader) return;

        setForm({
            fullName: reader.fullName || "",
            email: reader.email || "",
            phone:
                reader.phone === "N/A"
                    ? ""
                    : reader.phone || "",
            address: reader.address || "",
            dateOfBirth: reader.dateOfBirth || "",
        });

        setError("");
        setSuccess("");
        setEditing(false);
    };

    const handleSave = async () => {
        if (!form.fullName.trim()) {
            setError("Full name is required");
            return;
        }

        if (!form.email.trim()) {
            setError("Email is required");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const updatedReader =
                await updateMyReaderProfile({
                    fullName: form.fullName.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    address: form.address.trim(),
                    dateOfBirth: form.dateOfBirth,
                });

            setReader(updatedReader);

            setForm({
                fullName: updatedReader.fullName || "",
                email: updatedReader.email || "",
                phone:
                    updatedReader.phone === "N/A"
                        ? ""
                        : updatedReader.phone || "",
                address:
                    updatedReader.address || "",
                dateOfBirth:
                    updatedReader.dateOfBirth || "",
            });

            setEditing(false);
            setSuccess("Profile updated successfully.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update profile"
            );
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return "Not updated";

        const parts = date.split("-");

        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        return date;
    };

    const formatCreatedAt = (date: string) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-GB"
        );
    };

    if (loading) {
        return (
            <RoleGuard allowedRoles={["READER"]}>
                <main className="min-h-screen bg-gray-50 px-4 py-8">
                    <div className="mx-auto max-w-5xl">
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <p className="text-gray-500">
                                Loading profile...
                            </p>
                        </div>
                    </div>
                </main>
            </RoleGuard>
        );
    }

    if (!reader) {
        return (
            <RoleGuard allowedRoles={["READER"]}>
                <main className="min-h-screen bg-gray-50 px-4 py-8">
                    <div className="mx-auto max-w-5xl">
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <p className="text-red-500">
                                {error || "Profile not found."}
                            </p>
                        </div>
                    </div>
                </main>
            </RoleGuard>
        );
    }

    return (
        <RoleGuard allowedRoles={["READER"]}>
            <main className="min-h-screen bg-gray-50 px-4 py-8">
                <div className="mx-auto max-w-5xl">

                    {/* Page header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            My Profile
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Manage your personal information and
                            account details.
                        </p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                            {success}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                        {/* Profile header */}
                        <div className="border-b border-gray-200 px-6 py-7 sm:px-8">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-center gap-4">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-black text-3xl font-bold text-white">
                                        {reader.fullName
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {reader.fullName}
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            @{reader.user?.username}
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                                {reader.readerCode}
                                            </span>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    reader.status ===
                                                    "ACTIVE"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {reader.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {!editing && (
                                    <button
                                        onClick={handleEdit}
                                        className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Account information */}
                        <div className="border-b border-gray-200 px-6 py-7 sm:px-8">
                            <div className="mb-5">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Account Information
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Basic information associated with
                                    your library account.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-600">
                                        Username
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            reader.user?.username ||
                                            ""
                                        }
                                        disabled
                                        className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-600">
                                        Reader Code
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            reader.readerCode
                                        }
                                        disabled
                                        className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Personal information */}
                        <div className="px-6 py-7 sm:px-8">
                            <div className="mb-5">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Personal Information
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Update the information used for
                                    your library account.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                {/* Full name */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        value={form.fullName}
                                        disabled={!editing}
                                        onChange={(e) =>
                                            handleChange(
                                                "fullName",
                                                e.target.value
                                            )
                                        }
                                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                                            editing
                                                ? "border-gray-300 bg-white text-gray-900 focus:border-black"
                                                : "border-gray-200 bg-gray-50 text-gray-700"
                                        }`}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={form.email}
                                        disabled={!editing}
                                        onChange={(e) =>
                                            handleChange(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                                            editing
                                                ? "border-gray-300 bg-white text-gray-900 focus:border-black"
                                                : "border-gray-200 bg-gray-50 text-gray-700"
                                        }`}
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Phone
                                    </label>

                                    <input
                                        type="tel"
                                        value={form.phone}
                                        disabled={!editing}
                                        onChange={(e) =>
                                            handleChange(
                                                "phone",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter phone number"
                                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                                            editing
                                                ? "border-gray-300 bg-white text-gray-900 focus:border-black"
                                                : "border-gray-200 bg-gray-50 text-gray-700"
                                        }`}
                                    />
                                </div>

                                {/* Date of birth */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Date of Birth
                                    </label>

                                    <input
                                        type="date"
                                        value={form.dateOfBirth}
                                        disabled={!editing}
                                        onChange={(e) =>
                                            handleChange(
                                                "dateOfBirth",
                                                e.target.value
                                            )
                                        }
                                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                                            editing
                                                ? "border-gray-300 bg-white text-gray-900 focus:border-black"
                                                : "border-gray-200 bg-gray-50 text-gray-700"
                                        }`}
                                    />
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Address
                                    </label>

                                    <textarea
                                        value={form.address}
                                        disabled={!editing}
                                        onChange={(e) =>
                                            handleChange(
                                                "address",
                                                e.target.value
                                            )
                                        }
                                        rows={3}
                                        placeholder="Enter your address"
                                        className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition ${
                                            editing
                                                ? "border-gray-300 bg-white text-gray-900 focus:border-black"
                                                : "border-gray-200 bg-gray-50 text-gray-700"
                                        }`}
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Edit actions */}
                        {editing && (
                            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-6 py-4 sm:px-8">
                            <p className="text-xs text-gray-400">
                                Member since{" "}
                                {formatCreatedAt(
                                    reader.createdAt
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </RoleGuard>
    );
}