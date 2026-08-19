import React, { useState, useEffect } from 'react';
import { AdminApi } from '../api';
import { formatPrice, showToast } from '../utils';

export default function DashboardPage({ onNavigate }) {
    const [stats, setStats] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsData, booksData] = await Promise.all([
                AdminApi.getStats(),
                AdminApi.getAllBooks()
            ]);
            setStats(statsData);
            setBooks(booksData);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Users",
            value: stats?.users_count || 0,
            icon: "fas fa-users",
            color: "bg-blue-500",
            page: "users"
        },
        {
            title: "Total Books",
            value: stats?.books_count || 0,
            icon: "fas fa-book",
            color: "bg-emerald-500",
            page: "books"
        },
        {
            title: "Book Images",
            value: stats?.images_count || 0,
            icon: "fas fa-images",
            color: "bg-purple-500",
            page: "books"
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, idx) => (
                    <button
                        key={idx}
                        onClick={() => onNavigate(card.page)}
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${card.color} text-white rounded-lg flex items-center justify-center`}>
                                <i className={`${card.icon} text-lg`}></i>
                            </div>
                            <i className="fas fa-arrow-right text-gray-300"></i>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                        <div className="text-sm text-gray-500 mt-1">{card.title}</div>
                    </button>
                ))}
            </div>

            {/* Categories */}
            {stats?.categories && stats.categories.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="font-bold text-gray-900 mb-4">Books by Category</h2>
                    <div className="space-y-3">
                        {stats.categories.map(cat => {
                            const maxCount = Math.max(...stats.categories.map(c => c.count));
                            const percentage = (cat.count / maxCount) * 100;
                            return (
                                <div key={cat.category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{cat.category}</span>
                                        <span className="text-gray-500">{cat.count} books</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-600 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent Books */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Recent Books</h2>
                    <button
                        onClick={() => onNavigate("books")}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        View All <i className="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Book</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {books.slice(0, 5).map(book => (
                                <tr key={book.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={AdminApi.getImageUrl(book.images && book.images.length > 0 ? book.images[0].image_url : null)}
                                                alt={book.title}
                                                className="w-10 h-14 object-cover rounded"
                                            />
                                            <span className="font-medium text-gray-900">{book.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium">
                                            {book.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(book.price)}</td>
                                    <td className="px-6 py-4">
                                        {book.discount_price ? (
                                            <span className="text-emerald-600 font-medium">{formatPrice(book.discount_price)}</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {books.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        <i className="fas fa-book-open text-2xl text-gray-300 mb-2"></i>
                                        <p>No books yet. Add your first book!</p>
                                        <button
                                            onClick={() => onNavigate("books")}
                                            className="mt-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                                        >
                                            Go to Books Management
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}