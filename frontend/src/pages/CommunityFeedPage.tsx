import React, { useState, useEffect } from 'react';
import { communityService } from '../services/appServices';
import { CommunityPost } from '../types';
import { Users, ThumbsUp, MessageSquare, Plus, Award } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const CommunityFeedPage: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Water Conservation'
  });

  const fetchPosts = async () => {
    try {
      const data = await communityService.getPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communityService.createPost(formData);
      setModalOpen(false);
      setFormData({ title: '', content: '', category: 'Water Conservation' });
      await fetchPosts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create post.');
    }
  };

  const handleUpvote = async (id: number) => {
    try {
      await communityService.upvotePost(id);
      await fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600 animate-pulse" />
            <span>Community Knowledge Exchange</span>
          </h1>
          <p className="text-xs text-slate-600 font-bold mt-1">Connect with fellow farmers, share verified sustainable practices, and earn +25 XP per post</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-md shadow-emerald-600/25 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Share Sustainable Tip (+25 XP)</span>
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="glass-card-interactive p-6 rounded-3xl border border-white/90 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black flex items-center justify-center text-sm shadow-md">
                    {post.author_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{post.author_name}</h4>
                    <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      Level {post.author_level} Farmer
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {post.category}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 leading-snug">{post.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{post.content}</p>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-slate-500">
                <span>Posted on {post.created_at}</span>
                <button
                  onClick={() => handleUpvote(post.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 font-black"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{post.upvotes} Upvotes</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Share Sustainable Practice Post">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Post Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. How organic mulching saved 40% water"
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
              <option value="Water Conservation">Water Conservation</option>
              <option value="Soil Health">Soil Health</option>
              <option value="Organic Farming">Organic Farming</option>
              <option value="Crop Diversity">Crop Diversity</option>
              <option value="Pest Management">Pest Management</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Content / Eco Tip</label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your practical experience, organic recipe, or sustainable farming lesson..."
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
              Publish Post & Earn +25 XP
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
