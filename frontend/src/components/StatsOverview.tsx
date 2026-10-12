import React, { useState } from 'react';
import { PeriodStats, User } from '../types';
import { Flame, Skull, Trophy } from 'lucide-react';
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

  const u1Name = user1.first_name;
  const u2Name = user2 ? user2.first_name : 'Кореш';

  // Determine leader badge
  let leaderText = 'Ещё нет отметок';
  let leaderSubtext = 'Заполняйте дни в календаре';

  if (currentPeriod.winner === 'user1') {
    leaderText = `👑 Пахан: ${u1Name}`;
    leaderSubtext = `${currentPeriod.user1_pakhan_count} против ${currentPeriod.user2_pakhan_count} дней`;
  } else if (currentPeriod.winner === 'user2') {
    leaderText = `👑 Пахан: ${u2Name}`;
    leaderSubtext = `${currentPeriod.user2_pakhan_count} против ${currentPeriod.user1_pakhan_count} дней`;
  } else if (currentPeriod.winner === 'tie_pakhan') {
    leaderText = `🤝 Ничья на максималках!`;
    leaderSubtext = `Оба красавчики по ${currentPeriod.user1_pakhan_count} раз`;
  } else if (currentPeriod.winner === 'tie_maloy') {
    leaderText = `🍼 Оба Малые (Позор)`;
    leaderSubtext = `Оба разленились, срочно исправляйтесь!`;
  }

  const total = currentPeriod.user1_pakhan_count + currentPeriod.user2_pakhan_count;
  const u1Percent = total > 0 ? (currentPeriod.user1_pakhan_count / total) * 100 : 50;
  const u2Percent = total > 0 ? (currentPeriod.user2_pakhan_count / total) * 100 : 50;

  return (
    <div className="px-4 py-3">
      {/* Period Tabs */}
      <div className="flex bg-dark-800 p-1 rounded-xl border border-white/5 mb-3">
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
                  ? 'bg-amber-500 text-black shadow-md font-display'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {titles[tab]}
            </button>
          );
        })}
      </div>

      {/* Main Leaderboard Card */}
      <div className="glass-panel rounded-2xl p-4 relative overflow-hidden border-amber-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                {currentPeriod.title}
              </span>
              <span className="text-sm font-extrabold text-white font-display">
                {leaderText}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-amber-400 block">
              {leaderSubtext}
            </span>
          </div>
        </div>

        {/* Progress Battle Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] font-bold mb-1">
            <span className="text-amber-400 truncate max-w-[130px]">
              {u1Name}: {currentPeriod.user1_pakhan_count}
            </span>
            <span className="text-indigo-400 truncate max-w-[130px]">
              {u2Name}: {currentPeriod.user2_pakhan_count}
            </span>
          </div>
          <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden flex p-0.5 border border-white/5">
            <div
              style={{ width: `${u1Percent}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-l-full transition-all duration-500"
            />
            <div
              style={{ width: `${u2Percent}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-r-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Mini stats badges */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-center">
          <div className="bg-zinc-900/60 rounded-xl p-2 border border-white/5">
            <div className="flex items-center justify-center space-x-1 text-emerald-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>Оба Паханы: {currentPeriod.both_pakhan_count}</span>
            </div>
            <span className="text-[9px] text-zinc-500">дни гордости</span>
          </div>

          <div className="bg-zinc-900/60 rounded-xl p-2 border border-white/5">
            <div className="flex items-center justify-center space-x-1 text-rose-400 text-xs font-bold">
              <Skull className="w-3.5 h-3.5" />
              <span>Оба Малые: {currentPeriod.both_maloy_count}</span>
            </div>
            <span className="text-[9px] text-zinc-500">дни лени</span>
          </div>
        </div>
      </div>
    </div>
  );
};
