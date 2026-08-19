import React from 'react';

export default function Sidebar({ currentPage, onNavigate, open, onClose, user, onLogout }) {
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
        { id: "books", label: "Books", icon: "fas fa-book" },
        { id: "backup-restore", label: "Backup & Restore", icon: "fas fa-database" },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-sidebar text-white z-50 transform transition-transform duration-300 ${
                    open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                            <i className="fas fa-book-open text-lg"></i>
                        </div>
                        <div>
                            <div className="font-bold text-lg leading-tight">BookStore</div>
                            <div className="text-xs text-gray-400">Admin Panel</div>
                        </div>
                    </div>
                    <button className="md:hidden text-gray-400 hover:text-white" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Menu */}
                <nav className="px-4 py-4 space-y-1">
                    <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                        Main Menu
                    </div>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === item.id
                                    ? "bg-primary-600 text-white"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            }`}
                        >
                            <i className={`${item.icon} w-5 text-center`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User section */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-user"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                                {user?.username || "Admin"}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                                {user?.email || "admin@bookstore.com"}
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}