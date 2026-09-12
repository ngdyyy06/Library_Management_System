const API_URL = "http://localhost:8080/api";

export async function registerUser(data: {
    username: string;
    password: string;
    fullName: string;
    email: string;
}) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: data.username,
            password: data.password,
            fullName: data.fullName,
            email: data.email,
        }),
    });

    const text = await response.text();

    let result: {
        id?: number;
        username?: string;
        fullName?: string;
        email?: string;
        role?: string;
        status?: string;
        message?: string;
    } | null = null;

    if (text) {
        result = JSON.parse(text);
    }

    if (!response.ok) {
        throw new Error(result?.message || "Registration failed");
    }

    return result;
}

export async function loginUser(data: {
    username: string;
    password: string;
}): Promise<string> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: data.username,
            password: data.password,
        }),
    });

    const text = await response.text();

    if (!response.ok) {
        throw new Error(text || "Login failed");
    }

    return text;
}

export function getRoleFromToken(token: string): string | null {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role || null;
    } catch {
        return null;
    }
}

// lấy role trực tiếp trong token
export function getCurrentUserRole(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    return getRoleFromToken(token);
}

// xoá jwt đang lưu trong trình duyệt
export function logout() {
    localStorage.removeItem("token");
}

// gọi API đến backend lấy list users
export async function getUsers() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }

    return response.json();
}

// vô hiệu hoá tài khoản users
export async function deactivateUser(userId: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/users/${userId}/deactivate`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to deactivate user");
    }

    return response.json();
}

// kích hoạt lại tài khoản users
export async function activateUser(userId: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/users/${userId}/activate`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to activate user");
    }

    return response.json();
}

export async function updateUser(
    userId: number,
    data: {
        username: string;
        password: string;
        fullName: string;
        email: string;
        roleId: number;
    }
) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
    }

    return response.json();
}

export async function createUser(data: {
    username: string;
    password: string;
    fullName: string;
    email: string;
    roleId: number;
}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
    }

    return response.json();
}

export async function getDashboard() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/dashboard`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get dashboard");
    }

    return response.json();
}