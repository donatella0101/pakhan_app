import React from 'react';
import { DailyRecord } from '../types';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { hapticSelection } from '../telegram';

interface WeekStripProps {
  currentWeekStart: Date; // Monday of current week
  records: Record<string, DailyRecord>;
  todayStr: string;
  user1Name?: string;
  user2Name?: string;
  onSelectDate: (dateStr: string) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

export const WeekStrip: React.FC<WeekStripProps> = ({
  currentWeekStart,
  records,
  todayStr,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}) => {
  const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Generate 7 days starting from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      date: d,
      dateStr,
      dayNum: d.getDate(),
      dayLabel: dayLabels[i],
      isToday: dateStr === todayStr,
      isFuture: d > new Date() && dateStr !== todayStr,
    };
  });

  return (
    <div className="px-4 py-2">
      <div className="glass-panel rounded-2xl p-3.5 border-white/10 bg-dark-900/90 shadow-xl">
        {/* Header with Navigation and Legend */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold tracking-wider text-zinc-300 uppercase font-display">
              Неделя
            </span>
          </div>

          {/* Quick legend */}
          <div className="flex items-center space-x-2 text-[10px] font-bold">
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Д</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              <span>М</span>
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">💪 Оба</span>
          </div>

          {/* Nav arrows if provided */}
          {(onPrevWeek || onNextWeek) && (
            <div className="flex items-center space-x-1">
              {onPrevWeek && (
                <button
                  onClick={() => {
                    hapticSelection();
                    onPrevWeek();
                  }}
                  className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
              {onNextWeek && (
                <button
                  onClick={() => {
                    hapticSelection();
                    onNextWeek();
                  }}
                  className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 7 Squares Row */}
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map(({ dateStr, dayNum, dayLabel, isToday, isFuture }) => {
            const record = records[dateStr];
            const u1 = record?.user1_status || 'NONE';
            const u2 = record?.user2_status || 'NONE';

            let cellBg = 'bg-zinc-900/80 border-white/10 text-zinc-400';
            let mainContent: React.ReactNode = null;
            let subLabel = dayNum;

            // 1. Danil won (user1 is PAKHAN, user2 is not)
            if (u1 === 'PAKHAN' && u2 !== 'PAKHAN') {
              cellBg = 'bg-emerald-500 text-black border-emerald-400 lime-glow font-black';
              mainContent = (
                <span className="text-base font-black leading-none tracking-tight font-display">
                  Д
                </span>
              );
            }
            // 2. Friend won (user2 is PAKHAN, user1 is not)
            else if (u2 === 'PAKHAN' && u1 !== 'PAKHAN') {
              cellBg = 'bg-sky-400 text-black border-sky-300 sky-glow font-black';
              mainContent = (
                <span className="text-base font-black leading-none tracking-tight font-display">
                  М
                </span>
              );
            }
            // 3. BOTH are PAKHAN
            else if (u1 === 'PAKHAN' && u2 === 'PAKHAN') {
              cellBg = 'bg-gradient-to-br from-emerald-500 via-teal-400 to-sky-400 text-black border-white/30 font-black shadow-lg';
              mainContent = (
                <span className="text-xs font-black leading-none flex items-center justify-center">
                  💪
                </span>
              );
            }
            // 4. BOTH are MALOY
            else if (u1 === 'MALOY' && u2 === 'MALOY') {
              cellBg = 'bg-zinc-800/90 text-rose-300 border-rose-500/30';
              mainContent = (
                <span className="text-xs leading-none">🍼</span>
              );
            }
            // 5. Incomplete / single vote recorded
            else if (u1 !== 'NONE' || u2 !== 'NONE') {
              cellBg = 'bg-zinc-800/70 border-white/20 text-zinc-300';
              mainContent = (
                <span className="text-[10px] text-zinc-400">⏳</span>
              );
            }
            // 6. Empty / unvoted
            else {
              mainContent = (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700/60 block"></span>
              );
            }

            return (
              <button
                key={dateStr}
                onClick={() => {
                  hapticSelection();
                  onSelectDate(dateStr);
                }}
                disabled={isFuture}
                className={`flex flex-col items-center justify-between py-2 px-0.5 rounded-xl border transition-all active:scale-95 ${cellBg} ${
                  isToday ? 'ring-2 ring-white/90 ring-offset-2 ring-offset-black' : ''
                } ${isFuture ? 'opacity-30 cursor-not-allowed' : 'hover:brightness-110 cursor-pointer'}`}
                style={{ minHeight: '62px' }}
              >
                {/* Day label (Пн, Вт...) */}
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  (u1 === 'PAKHAN' || u2 === 'PAKHAN') ? 'text-black/70' : 'text-zinc-400'
                }`}>
                  {dayLabel}
                </span>

                {/* Central Letter / Emoji */}
                <div className="my-auto flex items-center justify-center">
                  {mainContent}
                </div>

                {/* Date number */}
                <span className={`text-[9px] font-semibold ${
                  (u1 === 'PAKHAN' || u2 === 'PAKHAN') ? 'text-black/60' : 'text-zinc-500'
                }`}>
                  {subLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
