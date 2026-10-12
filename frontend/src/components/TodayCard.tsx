import React, { useState } from 'react';
import { PlayerStatus, User } from '../types';
import { Bell, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { hapticImpact, hapticNotification } from '../telegram';

interface TodayCardProps {
  todayStr?: string;
  myStatus: PlayerStatus;
  buddyStatus: PlayerStatus;
  buddy: User | null;
  onSetStatus: (status: PlayerStatus) => Promise<void>;
  onNudgeBuddy: () => Promise<void>;
}

export const TodayCard: React.FC<TodayCardProps> = ({
  myStatus,
  buddyStatus,
  buddy,
  onSetStatus,
  onNudgeBuddy
}) => {
  const [loading, setLoading] = useState(false);
  const [nudged, setNudged] = useState(false);

  const handleSelect = async (status: PlayerStatus) => {
    try {
      setLoading(true);
      hapticImpact('heavy');
      if (status === 'PAKHAN') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
        hapticNotification('success');
      } else {
        hapticNotification('warning');
      }
      await onSetStatus(status);
    } finally {
      setLoading(false);
    }
  };

  const handleNudge = async () => {
    hapticImpact('medium');
    setNudged(true);
    await onNudgeBuddy();
    setTimeout(() => setNudged(false), 3000);
  };

  const todayDateFormatted = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short'
  });

  return (
    <div className="px-4 py-2">
      <div className="glass-panel rounded-2xl p-4 border-amber-500/30 relative overflow-hidden bg-gradient-to-b from-dark-800 to-dark-900">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Главная битва дня</span>
            </span>
            <h2 className="text-base font-extrabold text-white capitalize font-display">
              {todayDateFormatted}
            </h2>
          </div>

          {/* Outcome Badge if both marked */}
          {myStatus !== 'NONE' && buddyStatus !== 'NONE' && (
            <div className="px-2.5 py-1 rounded-full bg-zinc-800 border border-white/10 text-xs font-bold">
              {myStatus === 'PAKHAN' && buddyStatus === 'PAKHAN' && '👑👑 Два Пахана'}
              {myStatus === 'MALOY' && buddyStatus === 'MALOY' && '🍼🍼 Два Малых'}
              {myStatus === 'PAKHAN' && buddyStatus === 'MALOY' && '👑 Ты забрал день!'}
              {myStatus === 'MALOY' && buddyStatus === 'PAKHAN' && '🍼 Кореш забрал день'}
            </div>
          )}
        </div>

        {/* My status selector */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-zinc-400 mb-2">
            Твой статус на сегодня:
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              disabled={loading}
              onClick={() => handleSelect('PAKHAN')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all active:scale-95 ${
                myStatus === 'PAKHAN'
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 text-black shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-zinc-800/80 border-white/5 text-zinc-300 hover:border-amber-500/40'
              }`}
            >
              <span className="text-2xl mb-1">👑</span>
              <span className={`text-xs font-black uppercase font-display ${myStatus === 'PAKHAN' ? 'text-black' : 'text-amber-400'}`}>
                Я Пахан
              </span>
              <span className={`text-[10px] ${myStatus === 'PAKHAN' ? 'text-black/80 font-medium' : 'text-zinc-500'}`}>
                сделал всё чётко
              </span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleSelect('MALOY')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all active:scale-95 ${
                myStatus === 'MALOY'
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600 border-rose-400 text-white shadow-lg shadow-rose-500/25 scale-[1.02]'
                  : 'bg-zinc-800/80 border-white/5 text-zinc-300 hover:border-rose-500/40'
              }`}
            >
              <span className="text-2xl mb-1">🍼</span>
              <span className={`text-xs font-black uppercase font-display ${myStatus === 'MALOY' ? 'text-white' : 'text-rose-400'}`}>
                Я Малой
              </span>
              <span className={`text-[10px] ${myStatus === 'MALOY' ? 'text-white/80 font-medium' : 'text-zinc-500'}`}>
                обленился / дал слабину
              </span>
            </button>
          </div>
        </div>

        {/* Buddy status preview & Nudge */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between bg-zinc-900/40 -mx-4 -mb-4 px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400">
              {buddy ? buddy.first_name : 'Кореш'}:
            </span>
            {buddyStatus === 'PAKHAN' && (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-400">
                <span>👑 Отметил «Пахан»</span>
              </span>
            )}
            {buddyStatus === 'MALOY' && (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-400">
                <span>🍼 Отметил «Малой»</span>
              </span>
            )}
            {buddyStatus === 'NONE' && (
              <span className="text-xs font-medium text-zinc-500 italic">
                ⏳ Ещё не отметил
              </span>
            )}
          </div>

          {buddy && buddyStatus === 'NONE' && (
            <button
              onClick={handleNudge}
              disabled={nudged}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition active:scale-95 ${
                nudged
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
              }`}
            >
              {nudged ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Пнули!</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>Пнуть кореша</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
