import React, { useState } from 'react';
import { PeriodStats, User } from '../types';
import { hapticSelection } from '../telegram';

interface StatsOverviewProps {
  stats: {
    week: PeriodStats;
    month: PeriodStats;
    year: PeriodStats;
  };
  currentUser: User;
  user1: User;
  user2: User | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  currentUser: _currentUser,
  user1,
  user2
}) => {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'year'>('week');
  const currentPeriod = stats[activeTab];

  const u1Name = user1.username === 'znkssmt' ? 'Даня' : (user1.first_name || 'Даня');
  const u2Name = user2 ? (user2.username === 'hansahools' ? 'Миша' : (user2.first_name || 'Миша')) : 'Миша';

  // Determine leader badge
  let leaderText = 'Ещё нет отметок';
  let leaderSubtext = 'Отмечайте дни в календаре';

  if (currentPeriod.winner === 'user1') {
    leaderText = `💪 Лидер: ${u1Name}`;
    leaderSubtext = `${currentPeriod.user1_pakhan_count} против ${currentPeriod.user2_pakhan_count} дн.`;
  } else if (currentPeriod.winner === 'user2') {
    leaderText = `💪 Лидер: ${u2Name}`;
    leaderSubtext = `${currentPeriod.user2_pakhan_count} против ${currentPeriod.user1_pakhan_count} дн.`;
  } else if (currentPeriod.winner === 'tie_pakhan') {
    leaderText = `💪 Ничья Паханов!`;
    leaderSubtext = `Оба красавчики по ${currentPeriod.user1_pakhan_count} дн.`;
  } else if (currentPeriod.winner === 'tie_maloy') {
    leaderText = `🍼 Оба Малые`;
    leaderSubtext = `Оба разленились, срочно исправиться!`;
  }

  const total = currentPeriod.user1_pakhan_count + currentPeriod.user2_pakhan_count;
  const u1Percent = total > 0 ? (currentPeriod.user1_pakhan_count / total) * 100 : 50;
  const u2Percent = total > 0 ? (currentPeriod.user2_pakhan_count / total) * 100 : 50;

  return (
    <div className="px-4 py-2">
      {/* Period Tabs (Monochrome Minimalist) */}
      <div className="flex bg-dark-900 p-1 rounded-xl border border-white/10 mb-2.5">
        {(['week', 'month', 'year'] as const).map((tab) => {
          const titles = { week: 'Неделя', month: 'Месяц', year: 'Год' };
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                hapticSelection();
                setActiveTab(tab);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                active
                  ? 'bg-white text-black shadow-md font-display'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {titles[tab]}
            </button>
          );
        })}
      </div>

      {/* Main Leaderboard Card */}
      <div className="glass-panel rounded-2xl p-4 relative overflow-hidden border-white/10 bg-dark-900/90 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-base">
              💪
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-display">
                {currentPeriod.title}
              </span>
              <span className="text-sm font-extrabold text-white font-display">
                {leaderText}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-zinc-300 block">
              {leaderSubtext}
            </span>
          </div>
        </div>

        {/* Progress Battle Bar (Lime D vs Sky M) */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] font-bold mb-1.5">
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              <span>{u1Name} (Д): {currentPeriod.user1_pakhan_count}</span>
            </span>
            <span className="text-sky-400 flex items-center space-x-1">
              <span>{u2Name} (М): {currentPeriod.user2_pakhan_count}</span>
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span>
            </span>
          </div>
          <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden flex p-0.5 border border-white/10">
            <div
              style={{ width: `${u1Percent}%` }}
              className="h-full bg-emerald-500 rounded-l-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
            />
            <div
              style={{ width: `${u2Percent}%` }}
              className="h-full bg-sky-400 rounded-r-full transition-all duration-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
            />
          </div>
        </div>

        {/* Mini stats badges */}
        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/10 text-center">
          <div className="bg-zinc-950/60 rounded-xl p-2 border border-white/5">
            <div className="flex items-center justify-center space-x-1 text-white text-xs font-bold">
              <span>💪 Оба Паханы:</span>
              <span className="text-emerald-400 font-extrabold">{currentPeriod.both_pakhan_count}</span>
            </div>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wide">дни мощи</span>
          </div>

          <div className="bg-zinc-950/60 rounded-xl p-2 border border-white/5">
            <div className="flex items-center justify-center space-x-1 text-zinc-400 text-xs font-bold">
              <span>🍼 Оба Малые:</span>
              <span className="text-rose-400 font-extrabold">{currentPeriod.both_maloy_count}</span>
            </div>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wide">дни лени</span>
          </div>
        </div>
      </div>
    </div>
  );
};
