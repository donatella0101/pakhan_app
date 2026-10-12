import React from 'react';
import { DailyRecord, User } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { hapticSelection, hapticImpact } from '../telegram';

interface CalendarViewProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  records: Record<string, DailyRecord>;
  user1: User;
  user2?: User | null;
  currentUser?: User;
  onSelectDay: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  records,
  user1,
  onSelectDay
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Calculate days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // First day of week (Monday = 0, Sunday = 6)
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  // Format today's YYYY-MM-DD
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const daysArray = [];
  // Empty slots before month start
  for (let i = 0; i < startingDayOfWeek; i++) {
    daysArray.push(null);
  }
  // Days of month
  for (let d = 1; d <= totalDays; d++) {
    const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysArray.push({
      dayNum: d,
      dateStr: dayDateStr,
      isToday: dayDateStr === todayStr,
      record: records[dayDateStr]
    });
  }

  return (
    <div className="px-4 py-2">
      <div className="glass-panel rounded-2xl p-4 border-white/5">
        {/* Month Header Switcher */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              hapticSelection();
              onPrevMonth();
            }}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white active:scale-95 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h3 className="text-sm font-extrabold text-white font-display tracking-wide uppercase">
            {monthNames[month]} {year}
          </h3>

          <button
            onClick={() => {
              hapticSelection();
              onNextMonth();
            }}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white active:scale-95 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekDayNames.map((d, index) => (
            <div
              key={d}
              className={`text-[11px] font-bold ${
                index >= 5 ? 'text-amber-500/70' : 'text-zinc-500'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {daysArray.map((item, index) => {
            if (!item) {
              return <div key={`empty-${index}`} className="h-14 rounded-xl opacity-0" />;
            }

            const { dayNum, dateStr, isToday, record } = item;
            const u1 = record?.user1_status || 'NONE';
            const u2 = record?.user2_status || 'NONE';

            // Background & border stylings depending on day outcome
            let cellBg = 'bg-zinc-800/40 border-white/5';

            if (u1 !== 'NONE' || u2 !== 'NONE') {
              if (u1 === 'PAKHAN' && u2 === 'PAKHAN') {
                cellBg = 'bg-amber-500/20 border-amber-500/40';
              } else if (u1 === 'MALOY' && u2 === 'MALOY') {
                cellBg = 'bg-rose-500/20 border-rose-500/40';
              } else if (u1 === 'PAKHAN' || u2 === 'PAKHAN') {
                cellBg = 'bg-amber-500/10 border-amber-500/25';
              }
            }

            if (isToday) {
              cellBg += ' ring-2 ring-amber-400';
            }

            return (
              <button
                key={dateStr}
                onClick={() => {
                  hapticImpact('light');
                  onSelectDay(dateStr);
                }}
                className={`h-14 rounded-xl border flex flex-col items-center justify-between p-1 transition-all active:scale-95 ${cellBg}`}
              >
                {/* Day Number */}
                <span className={`text-[11px] font-bold leading-none ${isToday ? 'text-amber-400 font-extrabold' : 'text-zinc-300'}`}>
                  {dayNum}
                </span>

                {/* Status Badges */}
                <div className="flex items-center space-x-0.5 justify-center">
                  {u1 === 'PAKHAN' && <span className="text-[10px]" title={`${user1.first_name}: Пахан`}>👑</span>}
                  {u1 === 'MALOY' && <span className="text-[10px]" title={`${user1.first_name}: Малой`}>🍼</span>}
                  {u1 === 'NONE' && (u2 !== 'NONE') && <span className="text-[8px] text-zinc-600">⏳</span>}

                  {u2 === 'PAKHAN' && <span className="text-[10px]" title="Кореш: Пахан">👑</span>}
                  {u2 === 'MALOY' && <span className="text-[10px]" title="Кореш: Малой">🍼</span>}
                  {u2 === 'NONE' && (u1 !== 'NONE') && <span className="text-[8px] text-zinc-600">⏳</span>}

                  {u1 === 'NONE' && u2 === 'NONE' && (
                    <div className="w-1 h-1 rounded-full bg-zinc-700 my-1" />
                  )}
                </div>

                {/* Indicator dot */}
                <div className="h-1">
                  {isToday && <div className="w-1.5 h-1 rounded-full bg-amber-400 mx-auto" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-around text-[10px] text-zinc-400">
          <div className="flex items-center space-x-1">
            <span>👑 👑</span>
            <span>Два Пахана</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>👑 🍼</span>
            <span>Пахан vs Малой</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🍼 🍼</span>
            <span>Два Малых</span>
          </div>
        </div>
      </div>
    </div>
  );
};
