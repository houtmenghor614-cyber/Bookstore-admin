import React, { useState, useEffect } from 'react';
import { AdminApi } from '../api';
import { formatPrice, showToast } from '../utils';

// ========== MODAL (module level - prevents remounting on every keystroke) ==========
function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
                    <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// ========== BOOK FORM (module level - prevents input focus loss) ==========
function BookForm({
    form,
    editingBook,
    selectedFiles,
    submitting,
    onInputChange,
    onFileChange,
    onSubmit,
    submitLabel,
    onClose,
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={onInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                />
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <input
                        type="text"
                        name="category"
                        value={form.category}
                        onChange={onInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                        placeholder="e.g. Fiction"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={onInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                        required
                    />
                </div>
            </div>

            {/* Discount */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
                <input
                    type="number"
                    name="discount_price"
                    value={form.discount_price}
                    onChange={onInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={onInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
            </div>

            {/* Images - only for new books */}
            {!editingBook && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Book Images (multiple)</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    {selectedFiles.length > 0 && (
                        <div className="mt-2 text-sm text-gray-500">
                            Selected: {selectedFiles.map(f => f.name).join(", ")}
                        </div>
                    )}
                </div>
            )}

            {/* Current images - for editing */}
            {editingBook && editingBook.images && editingBook.images.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                    <div className="flex gap-2 flex-wrap">
                        {editingBook.images.map(img => (
                            <img
                                key={img.id}
                                src={AdminApi.getImageUrl(img.image_url)}
                                alt=""
                                className="w-16 h-20 object-cover rounded"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-primary-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-check"></i>
                            <span>{submitLabel}</span>
                        </>
                    )}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

// ========== BOOKS PAGE ==========
export default function BooksPage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const [form, setForm] = useState({
        title: "",
        category: "",
        description: "",
        price: "",
        discount_price: "",
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const data = await AdminApi.getAllBooks();
            setBooks(data);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const categories = [...new Set(books.map(b => b.category))];

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (book.description || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "All" || book.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const resetForm = () => {
        setForm({
            title: "",
            category: "",
            description: "",
            price: "",
            discount_price: "",
        });
        setSelectedFiles([]);
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        if (!form.title || !form.category || !form.price) {
            showToast("Please fill in required fields", "error");
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("category", form.category);
            formData.append("description", form.description || "");
            formData.append("price", form.price);
            if (form.discount_price) {
                formData.append("discount_price", form.discount_price);
            }
            selectedFiles.forEach(file => {
                formData.append("images", file);
            });

            await AdminApi.createBook(formData);
            showToast("Book added successfully!", "success");
            setShowAddModal(false);
            resetForm();
            fetchBooks();
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditBook = async (e) => {
        e.preventDefault();
        if (!editingBook) return;

        try {
            setSubmitting(true);
            const bookData = {
                title: form.title,
                category: form.category,
                description: form.description,
                price: parseFloat(form.price),
                discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
            };
            await AdminApi.updateBook(editingBook.id, bookData);
            showToast("Book updated successfully!", "success");
            setShowEditModal(false);
            fetchBooks();
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (book) => {
        if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) return;

        try {
            await AdminApi.deleteBook(book.id);
            showToast("Book deleted successfully", "success");
            fetchBooks();
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const openEditModal = (book) => {
        setEditingBook(book);
        setForm({
            title: book.title,
            category: book.category,
            description: book.description || "",
            price: book.price,
            discount_price: book.discount_price || "",
        });
        setSelectedFiles([]);
        setShowEditModal(true);
    };

    const formProps = {
        form,
        editingBook,
        selectedFiles,
        submitting,
        onInputChange: handleInputChange,
        onFileChange: handleFileChange,
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="flex-1 flex gap-3">
                    <div className="relative flex-1 sm:max-w-xs">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search books..."
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                        />
                        <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setEditingBook(null);
                        setShowAddModal(true);
                    }}
                    className="bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                    <i className="fas fa-plus"></i>
                    <span>Add Book</span>
                </button>
            </div>

            {/* Books Table */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <i className="fas fa-spinner fa-spin text-3xl text-primary-600"></i>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Book</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Images</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredBooks.map(book => (
                                    <tr key={book.id} className="hover:bg-gray-50">
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
                                                <span className="text-emerald-600 font-medium">
                                                    {formatPrice(book.discount_price)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <i className="fas fa-image text-gray-400 mr-1"></i>
                                            {book.images?.length || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(book)}
                                                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"
                                                    title="Edit"
                                                >
                                                    <i className="fas fa-edit text-sm"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(book)}
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash-alt text-sm"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBooks.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <i className="fas fa-book-open text-3xl text-gray-300 mb-3"></i>
                                            <p className="text-gray-500">No books found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Book Modal */}
            {showAddModal && (
                <Modal title="Add New Book" onClose={() => setShowAddModal(false)}>
                    <BookForm
                        {...formProps}
                        onSubmit={handleAddBook}
                        submitLabel="Add Book"
                        onClose={() => setShowAddModal(false)}
                    />
                </Modal>
            )}

            {/* Edit Book Modal */}
            {showEditModal && (
                <Modal title="Edit Book" onClose={() => setShowEditModal(false)}>
                    <BookForm
                        {...formProps}
                        onSubmit={handleEditBook}
                        submitLabel="Update Book"
                        onClose={() => setShowEditModal(false)}
                    />
                </Modal>
            )}
        </div>
    );
}