import React, { useState, useEffect } from 'react';
import { gamificationService } from '../services/appServices';
import { Badge, UserBadge, LeaderboardEntry } from '../types';
import { Trophy, Award, Lock, CheckCircle2, Users } from 'lucide-react';

export const BadgesLeaderboardPage: React.FC = () => {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bAll, bUser, lData] = await Promise.all([
          gamificationService.getBadges(),
          gamificationService.getUserBadges(),
          gamificationService.getLeaderboard()
        ]);
        setAllBadges(bAll);
        setUserBadges(bUser);
        setLeaderboard(lData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const unlockedBadgeIds = new Set(userBadges.map((ub) => ub.badge.id));

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-500" />
          <span>Badges & Global Leaderboard</span>
        </h1>
        <p className="text-xs text-slate-600 font-medium mt-1">Track your achievements, level status, and see how you rank among sustainable farmers</p>
      </div>

      {/* Badges Showcase Grid */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 space-y-6 shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-black text-slate-900">Sustainability Badges</h2>
          </div>
          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            {unlockedBadgeIds.size} / {allBadges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allBadges.map((badge) => {
            const isUnlocked = unlockedBadgeIds.has(badge.id);

            return (
              <div
                key={badge.id}
                className={`bg-white p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-xs ${
                  isUnlocked
                    ? 'border-emerald-300 bg-gradient-to-br from-emerald-50/60 to-white shadow-soft'
                    : 'border-slate-200 opacity-70'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl border ${
                      isUnlocked ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      {isUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                    </div>
                    <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      +{badge.xp_reward} XP
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{badge.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{badge.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 text-[10px] font-bold text-slate-500">
                  {isUnlocked ? (
                    <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Unlocked & Awarded
                    </span>
                  ) : (
                    <span>Req: {badge.requirement_type.replace('_', ' ')} ({badge.requirement_value})</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Leaderboard Table */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 space-y-6 shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-black text-slate-900">Global Sustainable Farmer Rankings</h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">Ranked by Total XP & Score</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Rank</th>
                <th className="p-3.5">Farmer Display Name</th>
                <th className="p-3.5">Level</th>
                <th className="p-3.5">Total XP</th>
                <th className="p-3.5">Sustainability Score</th>
                <th className="p-3.5 rounded-r-xl">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {leaderboard.map((entry) => (
                <tr key={entry.user_id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-black">
                    {entry.rank === 1 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-black">🥇 #1</span>
                    ) : entry.rank === 2 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 border border-slate-300 font-black">🥈 #2</span>
                    ) : entry.rank === 3 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-200 text-amber-900 border border-amber-400 font-black">🥉 #3</span>
                    ) : (
                      `#${entry.rank}`
                    )}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">{entry.display_name}</td>
                  <td className="p-3.5 font-bold text-emerald-700">Level {entry.level}</td>
                  <td className="p-3.5 font-black text-amber-700">{entry.xp} XP</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold">
                      {entry.sustainability_score} / 100
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-purple-700">{entry.badges_count} Badges</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
