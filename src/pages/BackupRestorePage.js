import React, { useState, useEffect, useRef } from 'react';
import { AdminApi } from '../api';
import { formatDateTime, showToast } from '../utils';

export default function BackupRestorePage() {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [backingUp, setBackingUp] = useState(false);
    const [importing, setImporting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadBackups();
    }, []);

    const loadBackups = async () => {
        try {
            setLoading(true);
            const data = await AdminApi.listBackups();
            setBackups(data);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        try {
            setBackingUp(true);
            const result = await AdminApi.createBackup();
            showToast(`Backup created: ${result.filename}`, "success");
            loadBackups();
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setBackingUp(false);
        }
    };

    const handleDownload = async (filename) => {
        try {
            await AdminApi.downloadBackup(filename);
            showToast(`Downloading ${filename}`, "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const handleFileSelect = (e) => {
        setSelectedFile(e.target.files[0] || null);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            showToast("Please select a backup file first", "warning");
            return;
        }

        if (!window.confirm(`Are you sure you want to import data from "${selectedFile.name}"? This will add new records to the database.`)) return;

        try {
            setImporting(true);
            const result = await AdminApi.importDatabase(selectedFile);
            showToast(
                `Import complete! +${result.imported_users} users, +${result.imported_books} books, +${result.imported_images} images`,
                "success"
            );
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Warning banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <i className="fas fa-exclamation-triangle text-amber-500 mt-1"></i>
                <div>
                    <p className="font-semibold text-amber-800 mb-1">Database Management</p>
                    <p className="text-sm text-amber-700">
                        Use backup to save your database data to a JSON file. Use import to restore data from a backup file.
                        Import will skip records that already exist (matched by email for users, title+category for books).
                    </p>
                </div>
            </div>

            {/* Backup Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-gray-900 text-lg">Database Backup</h2>
                        <p className="text-sm text-gray-500">Create a backup of all users, books, and images</p>
                    </div>
                    <button
                        onClick={handleCreateBackup}
                        disabled={backingUp}
                        className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {backingUp ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                <span>Backing up...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-database"></i>
                                <span>Backup Database</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Backup History */}
                <div className="p-6">
                    <h3 className="font-semibold text-gray-700 mb-3">Backup History</h3>
                    {loading ? (
                        <div className="text-center py-8">
                            <i className="fas fa-spinner fa-spin text-2xl text-primary-600"></i>
                        </div>
                    ) : backups.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <i className="fas fa-database text-3xl text-gray-300 mb-3"></i>
                            <p className="text-gray-500">No backups found yet. Create your first backup!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Filename</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {backups.map(backup => (
                                        <tr key={backup.filename} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <i className="fas fa-file-json text-gray-400"></i>
                                                    <span className="text-sm font-medium text-gray-900 font-mono">{backup.filename}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{backup.size_kb} KB</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(backup.created_at)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDownload(backup.filename)}
                                                    className="inline-flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium"
                                                >
                                                    <i className="fas fa-download"></i>
                                                    Download
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Import Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900 text-lg">Import Database</h2>
                    <p className="text-sm text-gray-500">Import data from a JSON backup file</p>
                </div>
                <div className="p-6">
                    <div className="max-w-xl">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json,application/json"
                            onChange={handleFileSelect}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                        />
                        {selectedFile && (
                            <div className="mt-3 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-file-check text-emerald-600"></i>
                                    <span className="text-sm font-medium text-emerald-800">{selectedFile.name}</span>
                                    <span className="text-xs text-emerald-600">({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="text-emerald-600 hover:text-emerald-800"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        )}
                        <button
                            onClick={handleImport}
                            disabled={importing || !selectedFile}
                            className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {importing ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>Importing...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-upload"></i>
                                    <span>Import Database</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}