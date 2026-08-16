import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/appServices';
import { VerificationRecord } from '../../types';
import { ShieldCheck, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export const AdminVerificationsPage: React.FC = () => {
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerif, setSelectedVerif] = useState<VerificationRecord | null>(null);

  const fetchData = async () => {
    try {
      const data = await adminService.getVerifications();
      setVerifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReview = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await adminService.reviewVerification(id, status, `Reviewed as ${status} by admin.`);
      setSelectedVerif(null);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-purple-600" />
          <span>Computer Vision Image Verifications Review</span>
        </h1>
        <p className="text-xs text-slate-600 font-medium mt-1">Review AI-analyzed farmer image submissions and verify practice completions</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-soft overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600" />
          </div>
        ) : verifications.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No verifications submitted yet.</p>
        ) : (
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Farmer ID</th>
                <th className="p-3">Mission ID</th>
                <th className="p-3">Detected Practice</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-xl text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {verifications.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">User #{v.user_id}</td>
                  <td className="p-3">Mission #{v.mission_id}</td>
                  <td className="p-3 font-bold text-emerald-700">{v.detected_practice || 'Pending AI'}</td>
                  <td className="p-3 font-black text-slate-800">
                    {v.confidence_score ? `${Math.round(v.confidence_score * 100)}%` : 'N/A'}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      v.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : v.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedVerif(v)}
                      className="px-3 py-1 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Verification Inspection Modal */}
      {selectedVerif && (
        <Modal isOpen={!!selectedVerif} onClose={() => setSelectedVerif(null)} title={`Verification Inspection #${selectedVerif.id}`}>
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <img
                src={`http://localhost:8000${selectedVerif.image_url}`}
                alt="Verification Proof"
                className="w-full h-56 object-cover"
                onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a26?w=600&auto=format&fit=crop&q=80'; }}
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <p><strong>Detected Practice:</strong> {selectedVerif.detected_practice}</p>
              <p><strong>AI Confidence Score:</strong> {selectedVerif.confidence_score ? `${Math.round(selectedVerif.confidence_score * 100)}%` : 'N/A'}</p>
              <p><strong>Status:</strong> {selectedVerif.status}</p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => handleReview(selectedVerif.id, 'rejected')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" /> Reject Submission
              </button>
              <button
                onClick={() => handleReview(selectedVerif.id, 'approved')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Award XP
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
