import React, { useState, useEffect } from 'react';
import { helpDeskService } from '../services/appServices';
import { HelpDeskTicket } from '../types';
import { HelpCircle, Plus, CheckCircle2, MessageSquare } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const HelpDeskPage: React.FC = () => {
  const [tickets, setTickets] = useState<HelpDeskTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Soil Advisory',
    description: ''
  });

  const fetchTickets = async () => {
    try {
      const data = await helpDeskService.getTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await helpDeskService.createTicket(formData);
      setModalOpen(false);
      setFormData({ subject: '', category: 'Soil Advisory', description: '' });
      await fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create ticket.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-emerald-600 animate-pulse" />
            <span>Farmer Advisory & Support Help Desk</span>
          </h1>
          <p className="text-xs text-slate-600 font-bold mt-1">Submit support tickets for KVK agronomist advisory, scheme guidance, and soil card assistance</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-md shadow-emerald-600/25 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Advisory Ticket</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600" />
        </div>
      ) : (
        <div className="glass-panel-premium p-6 rounded-3xl border border-white/80 shadow-lg overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 uppercase font-black text-[10px] tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Ticket No</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-xl">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-black text-slate-900">{t.ticket_no}</td>
                  <td className="p-3 font-bold text-slate-800">{t.subject}</td>
                  <td className="p-3 text-slate-600">{t.category}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                      t.status.includes('Resolved') ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-bold">{t.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Agronomist Advisory Ticket">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Soil testing lab location inquiry"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
            >
              <option value="Soil Advisory">Soil Advisory</option>
              <option value="Government Schemes">Government Schemes</option>
              <option value="Organic Certification">Organic Certification</option>
              <option value="Pest Control">Pest Control</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about your query..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
