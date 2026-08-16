import React, { useState, useEffect } from 'react';
import { rewardService } from '../services/appServices';
import { RewardItem, UserRewardRedemption } from '../types';
import { Gift, Award, CheckCircle2, ShieldAlert, Tag, Sparkles, Filter, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RewardsMarketplacePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<UserRewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [claimedCode, setClaimedCode] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [rList, mList] = await Promise.all([
        rewardService.getRewards(),
        rewardService.getMyRedemptions()
      ]);
      setRewards(rList);
      setMyRedemptions(mList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRedeem = async (reward: RewardItem) => {
    setSuccessMsg('');
    setErrorMsg('');
    setClaimedCode(null);

    try {
      const res = await rewardService.redeemReward(reward.id);
      setSuccessMsg(res.message);
      setClaimedCode(res.voucher_code);
      if (refreshUser) refreshUser();
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Redemption failed.');
    }
  };

  const filteredRewards = rewards.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Gift className="w-8 h-8 text-amber-500 animate-bounce" />
          <span>Rewards & Prize Redemption Marketplace</span>
        </h1>
        <p className="text-xs text-slate-600 font-bold mt-1">Redeem your earned eco-farming XP points for real-world agricultural vouchers, free soil tests, and seed subsidies</p>
      </div>

      {/* Points Balance Glass Banner */}
      <div className="glass-panel-premium p-6 lg:p-8 rounded-3xl border border-white/80 bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-emerald-500/15 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Your Rewards Points Balance</h3>
            <p className="text-xs text-slate-600 font-medium">Earn more points by completing sustainable quests, diagnosing crop health, and contributing to the community!</p>
          </div>
        </div>

        <div className="flex items-baseline space-x-2 bg-white/90 text-amber-950 px-6 py-3 rounded-2xl border border-amber-300 shadow-md">
          <span className="text-3xl font-black">{user?.xp || 450}</span>
          <span className="text-xs font-black text-amber-700 uppercase">Points</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs font-bold space-y-2 shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          {claimedCode && (
            <div className="bg-white p-3 rounded-xl border border-emerald-300 font-mono text-sm font-black text-emerald-900 text-center tracking-widest">
              VOUCHER CODE: {claimedCode}
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-100/90 border border-rose-300 text-rose-950 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Category Filter Glass Pills */}
      <div className="flex flex-wrap items-center gap-2 glass-panel-premium p-2 rounded-2xl border border-white/80 w-fit shadow-sm">
        <Filter className="w-4 h-4 text-slate-500 ml-2" />
        <span className="text-xs font-black text-slate-700">Filter Category:</span>
        {['all', 'Seeds & Inputs', 'Services', 'Equipment', 'Training'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black capitalize transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prize Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => {
            const canAfford = (user?.xp || 450) >= reward.points_cost;

            return (
              <div key={reward.id} className="glass-card-interactive p-6 rounded-3xl border border-white/90 space-y-4 flex flex-col justify-between shadow-md">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {reward.category}
                    </span>
                    <span className="text-xs font-black text-amber-700 bg-white px-3 py-1 rounded-full border border-amber-200 shadow-xs">
                      {reward.points_cost} Points
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">{reward.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{reward.description}</p>

                  <div className="glass-panel p-3 rounded-xl border border-white/80 text-[11px] font-bold text-slate-500 flex justify-between">
                    <span>Sponsor: {reward.sponsor_agency}</span>
                    <span>Stock: {reward.inventory_count} Available</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canAfford || reward.inventory_count <= 0}
                  className="w-full py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-md shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 hover:scale-[1.01]"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{canAfford ? 'Redeem Prize Voucher' : `Need ${reward.points_cost - (user?.xp || 450)} More Points`}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Claimed Vouchers Drawer */}
      {myRedemptions.length > 0 && (
        <div className="glass-panel-premium p-6 rounded-3xl border border-white/80 space-y-4 shadow-lg">
          <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-3">
            <Ticket className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-black text-slate-900">Your Redeemed Prize Vouchers</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRedemptions.map((red) => (
              <div key={red.id} className="glass-card p-4 rounded-2xl border border-emerald-300 space-y-2 shadow-xs">
                <span className="text-xs font-black text-slate-900 block">{red.reward_title}</span>
                <div className="bg-slate-900 text-white p-2 rounded-xl text-center font-mono font-black text-xs tracking-wider">
                  {red.voucher_code}
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1">
                  <span>Spent: {red.points_spent} Points</span>
                  <span className="text-emerald-700 font-black">Status: {red.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
