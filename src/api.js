import { API_URL, ADMIN_TOKEN_KEY, ADMIN_USER_KEY } from './config';

export const AdminApi = {
    // ---------- AUTH ----------
    async login(username, password) {
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Login failed");
        }

        localStorage.setItem(ADMIN_TOKEN_KEY, data.access_token);
        const user = await this.getCurrentUser(data.access_token);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
        return { token: data.access_token, user };
    },

    async getCurrentUser(token) {
        const authToken = token || localStorage.getItem(ADMIN_TOKEN_KEY);
        if (!authToken) return null;

        const response = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        const data = await response.json();
        if (!response.ok) {
            this.logout();
            return null;
        }
        return data;
    },

    logout() {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
    },

    getStoredUser() {
        const user = localStorage.getItem(ADMIN_USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem(ADMIN_TOKEN_KEY);
    },

    getAuthHeaders() {
        const token = localStorage.getItem(ADMIN_TOKEN_KEY);
        return token ? { "Authorization": `Bearer ${token}` } : {};
    },

    // ---------- DASHBOARD ----------
    async getStats() {
        const response = await fetch(`${API_URL}/admin/stats`, {
            method: "GET",
            headers: this.getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error("Failed to fetch stats");
        }
        return await response.json();
    },

    async getUsers() {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            headers: this.getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }
        return await response.json();
    },

    // ---------- BOOKS ----------
    async getAllBooks() {
        const response = await fetch(`${API_URL}/books`);
        if (!response.ok) {
            throw new Error("Failed to fetch books");
        }
        return await response.json();
    },

    async createBook(formData) {
        const response = await fetch(`${API_URL}/books`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: formData
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Failed to create book");
        }
        return data;
    },

    async updateBook(bookId, bookData) {
        const response = await fetch(`${API_URL}/books/${bookId}`, {
            method: "PUT",
            headers: {
                ...this.getAuthHeaders(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookData)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Failed to update book");
        }
        return data;
    },

    async deleteBook(bookId) {
        const response = await fetch(`${API_URL}/books/${bookId}`, {
            method: "DELETE",
            headers: this.getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error("Failed to delete book");
        }
        return true;
    },

    getImageUrl(path) {
        if (!path) return "https://via.placeholder.com/200x250?text=No+Image";
        if (path.startsWith("http")) return path;
        return `${API_URL}${path}`;
    },

    // ---------- BACKUP ----------
    async createBackup() {
        const response = await fetch(`${API_URL}/admin/backup`, {
            method: "GET",
            headers: this.getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Backup failed");
        }
        return data;
    },

    async listBackups() {
        const response = await fetch(`${API_URL}/admin/backups`, {
            method: "GET",
            headers: this.getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error("Failed to list backups");
        }
        const data = await response.json();
        return data.backups;
    },

    async downloadBackup(filename) {
        const response = await fetch(`${API_URL}/admin/download-backup/${filename}`, {
            method: "GET",
            headers: this.getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error("Failed to download backup");
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    },

    async importDatabase(file) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/admin/import`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: formData
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Import failed");
        }
        return data;
    }
};