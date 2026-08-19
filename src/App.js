import React, { useState } from 'react';
import { AdminApi } from './api';
import { showToast } from './utils';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import BackupRestorePage from './pages/BackupRestorePage';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(AdminApi.isAuthenticated());
    const [user, setUser] = useState(AdminApi.getStoredUser());
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLoginSuccess = async () => {
        const storedUser = AdminApi.getStoredUser();
        if (!storedUser) {
            const token = localStorage.getItem('bookstore_admin_token');
            if (token) {
                const fetchedUser = await AdminApi.getCurrentUser(token);
                if (fetchedUser) {
                    localStorage.setItem('bookstore_admin_user', JSON.stringify(fetchedUser));
                    setUser(fetchedUser);
                }
            }
        } else {
            setUser(storedUser);
        }
        setIsAuthenticated(true);
        setCurrentPage("dashboard");
        showToast("Welcome to Admin Panel!", "success");
    };

    const handleLogout = () => {
        AdminApi.logout();
        setIsAuthenticated(false);
        setUser(null);
        setCurrentPage("dashboard");
        showToast("Logged out successfully", "info");
    };

    const handleNavigate = (page) => {
        setCurrentPage(page);
        setSidebarOpen(false);
    };

    // If not authenticated, show login
    if (!isAuthenticated) {
        return (
            <div>
                <div id="toast-container" className="fixed top-4 right-4 z-[100] space-y-2"></div>
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }

    const renderPage = () => {
        switch (currentPage) {
            case "dashboard":
                return <DashboardPage onNavigate={handleNavigate} />;
            case "books":
                return <BooksPage />;
            case "backup-restore":
                return <BackupRestorePage />;
            default:
                return <DashboardPage onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div id="toast-container" className="fixed top-4 right-4 z-[100] space-y-2"></div>

            {/* Sidebar */}
            <Sidebar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:ml-64">
                <Topbar
                    onMenuClick={() => setSidebarOpen(true)}
                    user={user}
                    currentPage={currentPage}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}

export default App;