import React from 'react';
import { PeriodStats, User } from '../types';


interface LastWeekChampionProps {
  lastWeekStats?: PeriodStats;
  currentWeekStats?: PeriodStats;
  user1: User;
  user2: User | null;
}

export const LastWeekChampion: React.FC<LastWeekChampionProps> = ({
  lastWeekStats,
  currentWeekStats,
  user1,
  user2
}) => {
  // Determine champion
  // Check if last week had a decided winner; if not, check current week leader
  let champName = 'Даня';
  let champInitial = 'Д';
  let champPhoto = '/assets/danya_pakhan.jpg';
  let isDanya = true;
  let isTie = false;
  let statusBadge = 'ПАХАН ПРОШЛОЙ НЕДЕЛИ';
  let phrase = 'Я иду забирать следующую! 💪';

  if (lastWeekStats && lastWeekStats.winner !== 'undecided') {
    statusBadge = 'ПАХАН ПРОШЛОЙ НЕДЕЛИ';
    if (lastWeekStats.winner === 'user1') {
      champName = user1.first_name || 'Даня';
      champInitial = 'Д';
      champPhoto = '/assets/danya_pakhan.jpg';
      isDanya = true;
      phrase = 'Я иду забирать следующую! 💪';
    } else if (lastWeekStats.winner === 'user2') {
      champName = user2 ? user2.first_name : 'Миша';
      champInitial = 'М';
      champPhoto = '/assets/misha_pakhan.jpg';
      isDanya = false;
      phrase = 'Я иду забирать следующую! 💪';
    } else if (lastWeekStats.winner === 'tie_pakhan') {
      isTie = true;
      champName = 'Даня & Миша';
      champPhoto = '/assets/both_pakhan.jpg';
      phrase = 'СПАРТАНЦЫ НЕ ОТСТУПАЮТ, НЕ КАПИТУЛИРУЮТ! 💪💪';
    }
  } else if (currentWeekStats && currentWeekStats.winner !== 'undecided') {
    // Current week leader preview
    statusBadge = 'ЛИДЕР НЕДЕЛИ';
    if (currentWeekStats.winner === 'user1') {
      champName = user1.first_name || 'Даня';
      champInitial = 'Д';
      champPhoto = '/assets/danya_pakhan.jpg';
      isDanya = true;
      phrase = 'Я иду забирать следующую! 💪';
    } else if (currentWeekStats.winner === 'user2') {
      champName = user2 ? user2.first_name : 'Миша';
      champInitial = 'М';
      champPhoto = '/assets/misha_pakhan.jpg';
      isDanya = false;
      phrase = 'Я иду забирать следующую! 💪';
    } else if (currentWeekStats.winner === 'tie_pakhan') {
      isTie = true;
      champName = 'Даня & Миша';
      champPhoto = '/assets/both_pakhan.jpg';
      phrase = 'Идём вровень, на следующей выясним! ⚡️';
    }
  } else {
    // Default preview: Danya as Pakhan
    statusBadge = 'ПАХАН ПРОШЛОЙ НЕДЕЛИ';
    champName = user1.first_name || 'Даня';
    champInitial = 'Д';
    champPhoto = '/assets/danya_pakhan.jpg';
    isDanya = true;
    phrase = 'Я иду забирать следующую! 💪';
  }

  const borderGlow = isTie
    ? 'border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
    : isDanya
    ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
    : 'border-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.2)]';

  const textColor = isTie
    ? 'text-white'
    : isDanya
    ? 'text-emerald-400'
    : 'text-sky-400';

  const badgeBg = isTie
    ? 'bg-white/10 text-white border-white/20'
    : isDanya
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : 'bg-sky-500/20 text-sky-400 border-sky-500/30';

  return (
    <div className="px-4 py-2">
      <div className={`glass-panel rounded-2xl p-3.5 border ${borderGlow} bg-dark-900/90 relative overflow-hidden transition-all shadow-xl`}>
        {/* Subtle background gradient */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isDanya ? 'bg-emerald-500' : 'bg-sky-400'
        }`} />

        <div className="flex items-center space-x-3.5 relative z-10">
          {/* Champion Photo */}
          <div className="relative flex-shrink-0">
            <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 p-0.5 shadow-md ${
              isTie ? 'border-white/40' : isDanya ? 'border-emerald-400' : 'border-sky-400'
            }`}>
              <img
                src={champPhoto}
                alt={champName}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            {/* Small initial badge on photo */}
            {!isTie && (
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-black font-display shadow ${
                isDanya ? 'bg-emerald-400' : 'bg-sky-400'
              }`}>
                {champInitial}
              </span>
            )}
          </div>

          {/* Champion Info & Phrase */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border font-display ${badgeBg}`}>
                🏆 {statusBadge}
              </span>
            </div>

            <h3 className={`text-sm font-black truncate font-display mb-0.5 ${textColor}`}>
              {champName}
            </h3>

            {/* The phrase */}
            <p className="text-xs text-zinc-200 font-extrabold italic leading-tight">
              «{phrase}»
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
