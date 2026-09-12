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