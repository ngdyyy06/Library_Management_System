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
        try {
            const errorData = JSON.parse(text);

            throw new Error("Incorrect Username or Password");
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }

            throw new Error("Login failed");
        }
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

export async function getReaders() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/readers`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to fetch readers"
        );
    }

    return response.json();
}

export async function createReader(data: {
    readerCode: string;
    fullName: string;
    email?: string;
    phone: string;
    address?: string;
    dateOfBirth?: string;
}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/readers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to create reader"
        );
    }

    return response.json();
}

export async function updateReader(
    id: number,
    data: {
        readerCode: string;
        fullName: string;
        email?: string;
        phone: string;
        address?: string;
        dateOfBirth?: string;
    }
) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/readers/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to update reader"
        );
    }

    return response.json();
}

export async function getReaderById(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/readers/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to fetch reader"
        );
    }

    return response.json();
}

export async function activateReader(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/readers/${id}/activate`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to activate reader"
        );
    }

    return response.json();
}

export async function deactivateReader(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/readers/${id}/deactivate`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to deactivate reader"
        );
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

export async function getStaffDashboard() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/staff/dashboard`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to get staff dashboard"
        );
    }

    return response.json();
}

export async function renewBorrowing(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/borrowings/${id}/renew`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to renew borrowing");
    }

    return response.json();
}

export async function getBorrowings() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/borrowings`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get borrowings");
    }

    return response.json();
}

export async function getMyBorrowings() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/borrowings/my`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get my borrowings");
    }

    return response.json();
}

export async function getBorrowingById(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/borrowings/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get borrowing");
    }

    return response.json();
}

export async function getBorrowingDetails(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/borrowings/${id}/details`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to get borrowing details"
        );
    }

    return response.json();
}

export async function returnBook(
    detailId: number,
    condition: string
) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/borrowings/details/${detailId}/return`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                condition,
            }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to return book"
        );
    }

    return response.json();
}

export async function getBooks() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/books`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get books");
    }

    return response.json();
}

export async function getBookById(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/books/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to get book"
        );
    }

    return response.json();
}

export async function createBook(data: {
    title: string;
    isbn: string;
    publisherId?: number;
    publishYear?: number;
    description?: string;
    price?: number;
    totalQuantity: number;
    authorIds?: number[];
    authorNames?: string[];
}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to create book"
        );
    }

    return response.json();
}

export async function updateBook(
    id: number,
    data: {
        title: string;
        isbn: string;
        publisherId?: number;
        publishYear?: number;
        description?: string;
        price?: number;
        totalQuantity: number;
        authorIds?: number[];
        authorNames?: string[];
        availableQuantity: number;
    }
) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/books/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to update book"
        );
    }

    return response.json();
}

export async function deactivateBook(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/books/${id}/deactivate`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to deactivate book"
        );
    }
}

export async function activateBook(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/books/${id}/activate`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Activate book failed: HTTP ${response.status} ${
                errorText || ""
            }`
        );
    }
}

export async function getBookCopies() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/book-copies`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to get book copies"
        );
    }

    return response.json();
}

export async function createBookCopy(data: {
    barcode: string;
    bookId: number;
}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/book-copies`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to create book copy"
        );
    }

    return response.json();
}

export async function getAuthors() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/authors`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get authors");
    }

    return response.json();
}

export async function getAuthorById(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/authors/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to get author"
        );
    }

    return response.json();
}

export async function getBooksByAuthorId(authorId: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/authors/${authorId}/books`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to get books by author"
        );
    }

    return response.json();
}

export async function createAuthor(data: {
    name: string;
    biography?: string;
}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/authors`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create author");
    }

    return response.json();
}

export async function updateAuthor(
    id: number,
    data: {
        name: string;
        biography?: string;
    }
) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/authors/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update author");
    }

    return response.json();
}

export async function activateAuthor(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/authors/${id}/activate`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to activate author"
        );
    }

    return response.json();
}

export async function deactivateAuthor(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/authors/${id}/deactivate`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to deactivate author"
        );
    }

    return response.json();
}

export async function getPublishers() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/publishers`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to get publishers"
        );
    }

    return response.json();
}

export async function getPublisherById(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/publishers/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to get publisher"
        );
    }

    return response.json();
}

export async function createPublisher(data: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/publishers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to create publisher"
        );
    }

    return response.json();
}

export async function updatePublisher(
    id: number,
    data: {
        name: string;
        address?: string;
        phone?: string;
        email?: string;
    }
) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/publishers/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to update publisher"
        );
    }

    return response.json();
}

export async function activatePublisher(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/publishers/${id}/activate`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to activate publisher"
        );
    }

    return response.json();
}

export async function deactivatePublisher(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/publishers/${id}/deactivate`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to deactivate publisher"
        );
    }

    return response.json();
}

export async function restoreBookCopy(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/book-copies/${id}/restore`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to restore book copy"
        );
    }

    return response.json();
}

export async function getBookCopyById(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/book-copies/${id}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to get book copy"
        );
    }

    return response.json();
}

export async function updateBookCopy(
    id: number,
    data: {
        barcode: string;
        bookId: number;
    }
) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/book-copies/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to update book copy"
        );
    }

    return response.json();
}

export async function getCategories() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/categories`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get categories");
    }

    return response.json();
}

export async function getCategoryById(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get category");
    }

    return response.json();
}

export async function createCategory(name: string) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/categories?name=${encodeURIComponent(name)}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create category");
    }

    return response.json();
}

export async function updateCategory(id: number, name: string) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/categories/${id}?name=${encodeURIComponent(name)}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update category");
    }

    return response.json();
}

export async function activateCategory(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/categories/${id}/activate`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to activate category");
    }

    return response.json();
}

export async function deactivateCategory(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/categories/${id}/deactivate`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to deactivate category");
    }

    return response.json();
}

export async function getBooksByCategory(categoryId: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/categories/${categoryId}/books`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to get books by category"
        );
    }

    return response.json();
}

export async function getImportReceipts() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/import-receipts`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to get import receipts"
        );
    }

    return response.json();
}

export async function getImportReceiptById(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/import-receipts/${id}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to get import receipt"
        );
    }

    return response.json();
}

export async function getImportReceiptDetails(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/import-receipts/${id}/details`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message ||
            "Failed to get import receipt details"
        );
    }

    return response.json();
}

export async function createImportReceipt(data: {
    publisherId: number;
    importDate: string;
    details: {
        bookId: number;
        quantity: number;
        unitPrice: number;
    }[];
}) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/import-receipts`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message ||
            "Failed to create import receipt"
        );
    }

    return response.json();
}

export async function updateImportReceipt(
    id: number,
    data: {
        publisherId: number;
        importDate: string;
        details: {
            bookId: number;
            quantity: number;
            unitPrice: number;
        }[];
    }
) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/import-receipts/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message ||
            "Failed to update import receipt"
        );
    }

    return response.json();
}

export async function activateImportReceipt(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/import-receipts/${id}/activate`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message ||
            "Failed to activate import receipt"
        );
    }

    return response.json();
}

export async function deactivateImportReceipt(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/import-receipts/${id}/deactivate`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message ||
            "Failed to deactivate import receipt"
        );
    }

    return response.json();
}

export async function createBorrowing(data: {
    readerId: number;
    bookCopyIds: number[];
}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/borrowings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to create borrowing"
        );
    }

    return response.json();
}

export async function createBorrowRequest(
    bookId: number,
    quantity: number
) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/borrow-requests`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            bookId,
            quantity,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to create borrowing request"
        );
    }

    return response.json();
}

export async function getMyBorrowRequests() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/borrow-requests/my`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to get borrowing requests"
        );
    }

    return response.json();
}

export async function cancelBorrowRequest(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/borrow-requests/my/${id}/cancel`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to cancel borrowing request"
        );
    }

    return response.json();
}

export async function getMyBorrowRequestById(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/borrow-requests/my/${id}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message ||
            "Failed to get borrowing request"
        );
    }

    return response.json();
}

export async function getBorrowRequests() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/borrow-requests`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message ||
            "Failed to get borrowing requests"
        );
    }

    return response.json();
}

export async function getAllBorrowRequests() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/borrow-requests`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message ||
            "Failed to get all borrowing requests"
        );
    }

    return response.json();
}

export async function approveBorrowRequest(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/borrow-requests/${id}/approve`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message ||
            "Failed to approve borrowing request"
        );
    }

    return response.json();
}

export async function rejectBorrowRequest(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/borrow-requests/${id}/reject`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            errorText ||
            `Failed to reject borrowing request (${response.status})`
        );
    }

    return response.json();
}

export async function updateMyReaderProfile(data: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
}) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/readers/me`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message ||
            "Failed to update profile"
        );
    }

    return response.json();
}

export async function getUserById(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/users/${id}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message ||
            "Failed to get user"
        );
    }

    return response.json();
}

export async function getMyStaffProfile() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/staff/me`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message ||
            "Failed to get staff profile"
        );
    }

    return response.json();
}

export async function updateMyStaffProfile(data: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
}) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/staff/me`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message ||
            "Failed to update staff profile"
        );
    }

    return response.json();
}

export async function getBorrowRequestById(id: number) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/borrow-requests/${id}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const text = await response.text();

    let result: any = null;

    if (text) {
        try {
            result = JSON.parse(text);
        } catch {
            result = null;
        }
    }

    if (!response.ok) {
        throw new Error(
            result?.message ||
            text ||
            `Failed to get borrowing request (${response.status})`
        );
    }

    return result;
}