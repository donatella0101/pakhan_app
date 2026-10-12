import React, { useState } from 'react';
import { PlayerStatus, User } from '../types';
import { Bell, CheckCircle2, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { hapticImpact, hapticNotification } from '../telegram';
import { OutcomeType } from './OutcomeModal';

interface TodayCardProps {
  todayStr?: string;
  myStatus: PlayerStatus;
  buddyStatus: PlayerStatus;
  buddy: User | null;
  onSetStatus: (status: PlayerStatus) => Promise<void>;
  onNudgeBuddy: () => Promise<void>;
  onTriggerOutcome?: (outcome: OutcomeType) => void;
}

export const TodayCard: React.FC<TodayCardProps> = ({
  myStatus,
  buddyStatus,
  buddy,
  onSetStatus,
  onNudgeBuddy,
  onTriggerOutcome
}) => {
  const [loading, setLoading] = useState(false);
  const [nudged, setNudged] = useState(false);

  const handleSelect = async (status: PlayerStatus) => {
    try {
      setLoading(true);
      hapticImpact('heavy');

      if (status === 'PAKHAN') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.65 }
        });
        hapticNotification('success');
      } else {
        hapticNotification('warning');
      }

      await onSetStatus(status);

      // Determine outcome to show visual modal
      if (onTriggerOutcome) {
        if (status === 'PAKHAN' && buddyStatus === 'PAKHAN') {
          onTriggerOutcome('BOTH_PAKHAN');
        } else if (status === 'MALOY' && buddyStatus === 'MALOY') {
          onTriggerOutcome('BOTH_MALOY');
        } else if (status === 'PAKHAN') {
          onTriggerOutcome('I_WON');
        } else if (status === 'MALOY' && buddyStatus === 'PAKHAN') {
          onTriggerOutcome('BUDDY_WON');
        }
      }
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

  const buddyDisplayName = buddy
    ? (buddy.username === 'hansahools' ? 'Миша' : (buddy.username === 'znkssmt' ? 'Даня' : (buddy.first_name || 'Кореш')))
    : 'Кореш';

  return (
    <div className="px-4 py-2">
      <div className="glass-panel rounded-2xl p-4 border-white/10 relative overflow-hidden bg-dark-900/90 shadow-xl">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center space-x-1 font-display">
              <Zap className="w-3 h-3 text-white" />
              <span>Главная битва дня</span>
            </span>
            <h2 className="text-base font-extrabold text-white capitalize font-display">
              {todayDateFormatted}
            </h2>
          </div>

          {/* Outcome Badge if both marked */}
          {myStatus !== 'NONE' && buddyStatus !== 'NONE' && (
            <button
              onClick={() => {
                if (onTriggerOutcome) {
                  if (myStatus === 'PAKHAN' && buddyStatus === 'PAKHAN') onTriggerOutcome('BOTH_PAKHAN');
                  else if (myStatus === 'MALOY' && buddyStatus === 'MALOY') onTriggerOutcome('BOTH_MALOY');
                  else if (myStatus === 'PAKHAN') onTriggerOutcome('I_WON');
                  else onTriggerOutcome('BUDDY_WON');
                }
              }}
              title="Посмотреть итог дня"
              className="px-2.5 py-1 rounded-full bg-zinc-950 hover:bg-zinc-800 border border-white/20 text-xs font-bold text-white shadow active:scale-95 transition cursor-pointer flex items-center space-x-1"
            >
              <span>
                {myStatus === 'PAKHAN' && buddyStatus === 'PAKHAN' && '💪💪 Два Пахана'}
                {myStatus === 'MALOY' && buddyStatus === 'MALOY' && '🍼🍼 Два Малых'}
                {myStatus === 'PAKHAN' && buddyStatus === 'MALOY' && '💪 Ты забрал день!'}
                {myStatus === 'MALOY' && buddyStatus === 'PAKHAN' && `🍼 ${buddyDisplayName} забрал день`}
              </span>
            </button>
          )}
        </div>

        {/* My status selector */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-zinc-400 mb-2.5">
            Твой статус на сегодня:
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              disabled={loading}
              onClick={() => handleSelect('PAKHAN')}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-95 ${
                myStatus === 'PAKHAN'
                  ? 'bg-white border-white text-black shadow-xl white-glow scale-[1.02]'
                  : 'bg-zinc-950/80 border-white/10 text-zinc-300 hover:border-white/30 hover:bg-zinc-900'
              }`}
            >
              <span className="text-3xl mb-1.5 leading-none">💪</span>
              <span className={`text-xs font-black uppercase font-display tracking-wide ${myStatus === 'PAKHAN' ? 'text-black' : 'text-white'}`}>
                Я Пахан
              </span>
              <span className={`text-[10px] mt-0.5 ${myStatus === 'PAKHAN' ? 'text-black/80 font-bold' : 'text-zinc-500 font-medium'}`}>
                сделал всё чётко
              </span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleSelect('MALOY')}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-95 ${
                myStatus === 'MALOY'
                  ? 'bg-zinc-800 border-white/20 text-white shadow-lg scale-[1.02]'
                  : 'bg-zinc-950/80 border-white/10 text-zinc-300 hover:border-rose-500/40 hover:bg-zinc-900'
              }`}
            >
              <span className="text-3xl mb-1.5 leading-none">🍼</span>
              <span className={`text-xs font-black uppercase font-display tracking-wide ${myStatus === 'MALOY' ? 'text-rose-400' : 'text-zinc-300'}`}>
                Я Малой
              </span>
              <span className={`text-[10px] mt-0.5 ${myStatus === 'MALOY' ? 'text-rose-300 font-semibold' : 'text-zinc-500 font-medium'}`}>
                обленился / дал слабину
              </span>
            </button>
          </div>
        </div>

        {/* Buddy status preview & Nudge */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between bg-zinc-950/60 -mx-4 -mb-4 px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400">
              {buddyDisplayName}:
            </span>
            {buddyStatus === 'PAKHAN' && (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-sky-400">
                <span>💪 Отметил «Пахан»</span>
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
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                nudged
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
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
