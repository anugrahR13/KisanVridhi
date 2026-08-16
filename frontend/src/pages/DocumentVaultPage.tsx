import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Download, Eye, ShieldCheck, Filter, AlertCircle } from 'lucide-react';
import { documentService } from '../services/appServices';
import { FarmDocument } from '../types';

export const DocumentVaultPage: React.FC = () => {
  const [documents, setDocuments] = useState<FarmDocument[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Soil Report');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await documentService.getDocuments(categoryFilter === 'All' ? undefined : categoryFilter);
      setDocuments(docs);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [categoryFilter]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedFile) return;
    try {
      await documentService.uploadDocument(title, category, selectedFile);
      setShowUploadForm(false);
      setTitle('');
      setSelectedFile(null);
      loadDocuments();
    } catch (err) {
      console.error('Error uploading document:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await documentService.deleteDocument(id);
      loadDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-700" /> Secure Farm Document Vault
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Store, view, and manage your official land records, soil lab reports, equipment bills, certificates, and insurance documents.
          </p>
        </div>

        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Document
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <form onSubmit={handleUpload} className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase">Upload Secure Document to Vault</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Document Title</label>
              <input
                type="text"
                placeholder="e.g. KVK Soil Health Card 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-slate-300 p-2 rounded bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 p-2 rounded bg-white"
              >
                <option value="Soil Report">Soil Report</option>
                <option value="Bill/Receipt">Bill / Receipt</option>
                <option value="Insurance">Insurance</option>
                <option value="Certificate">Certificate</option>
                <option value="Scheme Doc">Scheme Application</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select File (PDF, Image, Doc)</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                required
                className="w-full border border-slate-300 p-1.5 rounded bg-white text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-green-700 hover:bg-green-800 text-white rounded shadow-xs"
            >
              Upload to Vault
            </button>
          </div>
        </form>
      )}

      {/* Filter Category */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <label className="text-slate-600">Filter Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-300 rounded-md p-1.5 bg-white text-xs font-medium"
          >
            <option value="All">All Document Categories</option>
            <option value="Soil Report">Soil Reports</option>
            <option value="Bill/Receipt">Bills & Receipts</option>
            <option value="Insurance">Insurance Policies</option>
            <option value="Certificate">Certificates</option>
            <option value="Scheme Doc">Scheme Applications</option>
          </select>
        </div>
        <span className="text-xs text-slate-500">{documents.length} Files Stored</span>
      </div>

      {/* Document List Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            <tr>
              <th className="p-3.5">Document Title</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">File Type</th>
              <th className="p-3.5">Uploaded Date</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No documents stored in vault for the selected category.
                </td>
              </tr>
            ) : (
              documents.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-700 shrink-0" />
                    <span>{doc.title}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">
                      {doc.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 uppercase text-[11px]">{doc.file_type.split('/')[1] || 'FILE'}</td>
                  <td className="p-3.5 text-slate-600">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                  <td className="p-3.5 text-right space-x-2">
                    <a
                      href={`http://localhost:8000${doc.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
