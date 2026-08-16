import React, { useState, useEffect } from 'react';
import { adminService, missionService } from '../../services/appServices';
import { Mission, PracticeCategory } from '../../types';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export const AdminMissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [categories, setCategories] = useState<PracticeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: 1,
    xp_reward: 100,
    difficulty: 'Medium',
    duration_days: 7,
    requires_image: false,
    expected_practice_label: 'composting'
  });

  const fetchData = async () => {
    try {
      const [mList, cList] = await Promise.all([
        missionService.getMissions(),
        adminService.getCategories()
      ]);
      setMissions(mList);
      setCategories(cList);
      if (cList.length > 0) {
        setFormData((prev) => ({ ...prev, category_id: cList[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createMission(formData);
      setModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category_id: categories[0]?.id || 1,
        xp_reward: 100,
        difficulty: 'Medium',
        duration_days: 7,
        requires_image: false,
        expected_practice_label: 'composting'
      });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create mission.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this mission?')) return;
    try {
      await adminService.deleteMission(id);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-purple-600" />
            <span>Mission & Challenge Management</span>
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">Create, edit, and configure sustainable farming missions and XP rewards</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md flex items-center space-x-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Mission</span>
        </button>
      </div>

      {/* Missions Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-soft overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="p-3 rounded-l-xl">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">XP</th>
              <th className="p-3">Difficulty</th>
              <th className="p-3">Requires Proof</th>
              <th className="p-3 rounded-r-xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {missions.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-bold text-slate-900">{m.title}</td>
                <td className="p-3 text-slate-600">{m.category?.name}</td>
                <td className="p-3 font-black text-amber-700">+{m.xp_reward} XP</td>
                <td className="p-3 text-slate-600">{m.difficulty}</td>
                <td className="p-3">{m.requires_image ? 'Yes (CV Image)' : 'No'}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Sustainable Practice Mission">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">XP Reward</label>
              <input
                type="number"
                value={formData.xp_reward}
                onChange={(e) => setFormData({ ...formData, xp_reward: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="requires_image"
              checked={formData.requires_image}
              onChange={(e) => setFormData({ ...formData, requires_image: e.target.checked })}
              className="rounded text-purple-600"
            />
            <label htmlFor="requires_image" className="text-xs font-bold text-slate-700">Requires Image Upload Verification</label>
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
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700"
            >
              Create Mission
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
