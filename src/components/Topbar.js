import React from 'react';

const pageTitles = {
    "dashboard": "Dashboard",
    "books": "Books Management",
    "backup-restore": "Backup & Restore"
};

export default function Topbar({ onMenuClick, user, currentPage }) {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                {/* Left: Menu + Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="md:hidden text-gray-600 hover:text-gray-900"
                    >
                        <i className="fas fa-bars text-xl"></i>
                    </button>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                            {pageTitles[currentPage] || "Dashboard"}
                        </h1>
                        <p className="text-xs text-gray-500 hidden sm:block">
                            Book Store Admin Panel
                        </p>
                    </div>
                </div>

                {/* Right: User info */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
                            <i className="fas fa-user text-sm"></i>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">
                                {user?.username || "Admin"}
                            </div>
                            <div className="text-xs text-gray-500">
                                {user?.email || "admin@bookstore.com"}
                            </div>
                        </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        <i className="fas fa-bell"></i>
                    </button>
                </div>
            </div>
        </header>
    );
}