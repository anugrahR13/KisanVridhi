import React, { useState, useEffect } from 'react';
import { missionService, verificationService, farmService } from '../services/appServices';
import { Mission, MissionProgress, Farm } from '../types';
import { Target, Upload, CheckCircle2, Play, Award, ShieldCheck, Clock } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const MissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [progresses, setProgresses] = useState<MissionProgress[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  // Modal State for Image Verification Upload
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cvResult, setCvResult] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [mList, pList, fList] = await Promise.all([
        missionService.getMissions(),
        missionService.getMyProgress(),
        farmService.getFarms()
      ]);
      setMissions(mList);
      setProgresses(pList);
      setFarms(fList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProgressForMission = (missionId: number) => {
    return progresses.find((p) => p.mission_id === missionId);
  };

  const handleStartMission = async (missionId: number) => {
    try {
      await missionService.startMission(missionId, farms[0]?.id);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Could not start mission.');
    }
  };

  const handleCompleteMissionDirect = async (missionId: number) => {
    try {
      const res = await missionService.completeMission(missionId);
      alert(res.message);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Could not complete mission.');
    }
  };

  const openUploadModal = (mission: Mission) => {
    setSelectedMission(mission);
    setUploadFile(null);
    setCvResult(null);
    setUploadModalOpen(true);
  };

  const handleUploadVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMission || !uploadFile) return;
    setUploading(true);
    setCvResult(null);

    try {
      const res = await verificationService.uploadImage(selectedMission.id, uploadFile);
      setCvResult(res);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Verification image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-amber-600" />
            <span>Sustainable Farming Missions</span>
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">Complete eco-challenges to earn XP, level up, unlock badges, and improve your Sustainability Score</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Missions
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({progresses.filter(p => p.status === 'started' || p.status === 'pending_verification').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'completed' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({progresses.filter(p => p.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions
          .filter((m) => {
            const prog = getProgressForMission(m.id);
            if (activeTab === 'active') return prog && (prog.status === 'started' || prog.status === 'pending_verification');
            if (activeTab === 'completed') return prog && prog.status === 'completed';
            return true;
          })
          .map((mission) => {
            const progress = getProgressForMission(mission.id);
            const isCompleted = progress?.status === 'completed';
            const isPendingVerif = progress?.status === 'pending_verification';
            const isStarted = progress?.status === 'started';

            return (
              <div
                key={mission.id}
                className={`glass-panel p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 shadow-soft hover:shadow-soft-lg ${
                  isCompleted
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : isStarted
                    ? 'border-amber-300 bg-amber-50/50'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      {mission.category?.name || 'Sustainable Practice'}
                    </span>
                    <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200">
                      +{mission.xp_reward} XP
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">{mission.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{mission.description}</p>

                  <div className="flex items-center space-x-4 text-[11px] text-slate-500 font-bold pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {mission.duration_days} Days
                    </span>
                    <span>Difficulty: {mission.difficulty}</span>
                    {mission.requires_image && (
                      <span className="text-purple-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Image Proof Req
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  {isCompleted ? (
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Completed & Awarded</span>
                    </div>
                  ) : isPendingVerif ? (
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Pending Verification Review</span>
                    </div>
                  ) : isStarted ? (
                    <div className="space-y-2">
                      {mission.requires_image ? (
                        <button
                          onClick={() => openUploadModal(mission)}
                          className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload Image Proof (AI Verifier)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCompleteMissionDirect(mission.id)}
                          className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit & Claim Reward</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartMission(mission.id)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-emerald-700 shadow-sm flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Mission</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Image Proof Upload & Computer Vision Verification Modal */}
      {selectedMission && (
        <Modal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title={`Verify Practice: ${selectedMission.title}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Upload a photo of your <strong className="text-slate-900">{selectedMission.expected_practice_label || 'sustainable setup'}</strong> for AI Computer Vision verification.
            </p>

            <form onSubmit={handleUploadVerification} className="space-y-4">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                required
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
              />

              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-farm-500 hover:from-emerald-700 hover:to-farm-600 shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{uploading ? 'Analyzing Image with AI...' : 'Run Computer Vision Verification'}</span>
              </button>
            </form>

            {/* Computer Vision Result Box */}
            {cvResult && (
              <div className={`p-4 rounded-2xl border space-y-2 ${
                cvResult.verification_status === 'approved' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <div className="flex items-center justify-between font-extrabold text-xs">
                  <span>Detected Practice: {cvResult.detected_practice}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px]">
                    Confidence: {Math.round(cvResult.confidence_score * 100)}%
                  </span>
                </div>
                <p className="text-xs font-medium">{cvResult.message}</p>

                {cvResult.verification_status === 'approved' && (
                  <div className="pt-2 text-xs font-extrabold text-emerald-800 flex items-center gap-1">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Practice Verified! Mission Completed & XP Awarded!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
