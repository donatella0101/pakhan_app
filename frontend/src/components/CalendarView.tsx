import React from 'react';
import { DailyRecord, User } from '../types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  onClose?: () => void;
  isModal?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  records,
  user1: _user1,
  onSelectDay,
  onClose,
  isModal = false
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

  const calendarCard = (
    <div className={`glass-panel rounded-3xl p-4 border-white/10 bg-dark-950 shadow-2xl relative ${isModal ? 'm-2 sm:m-0' : ''}`}>
      {/* Close button if modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition active:scale-95 border border-white/5"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Month Header Switcher */}
      <div className={`flex items-center justify-between mb-4 ${isModal && onClose ? 'pr-12' : ''}`}>
        <button
          onClick={() => {
            hapticSelection();
            onPrevMonth();
          }}
          className="p-1.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300 hover:text-white active:scale-95 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="text-xs font-black text-white font-display tracking-wider uppercase">
          {monthNames[month]} {year}
        </h3>

        <button
          onClick={() => {
            hapticSelection();
            onNextMonth();
          }}
          className="p-1.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300 hover:text-white active:scale-95 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDayNames.map((d) => (
          <div
            key={d}
            className="text-[10px] font-bold text-zinc-500 uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysArray.map((item, index) => {
          if (!item) {
            return <div key={`empty-${index}`} className="h-13 rounded-xl opacity-0" />;
          }

          const { dayNum, dateStr, isToday, record } = item;
          const u1 = record?.user1_status || 'NONE';
          const u2 = record?.user2_status || 'NONE';

          // Background & border stylings depending on day outcome
          let cellBg = 'bg-zinc-900/80 border-white/5';

          if (u1 !== 'NONE' || u2 !== 'NONE') {
            if (u1 === 'PAKHAN' && u2 === 'PAKHAN') {
              cellBg = 'bg-white/10 border-white/30 text-white';
            } else if (u1 === 'MALOY' && u2 === 'MALOY') {
              cellBg = 'bg-zinc-900 border-rose-500/30 text-rose-300';
            } else if (u1 === 'PAKHAN') {
              cellBg = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300';
            } else if (u2 === 'PAKHAN') {
              cellBg = 'bg-sky-950/40 border-sky-500/40 text-sky-300';
            }
          }

          if (isToday) {
            cellBg += ' ring-2 ring-white ring-offset-1 ring-offset-black';
          }

          return (
            <button
              key={dateStr}
              onClick={() => {
                hapticImpact('light');
                onSelectDay(dateStr);
              }}
              className={`h-13 rounded-xl border flex flex-col items-center justify-between p-1 transition-all active:scale-95 ${cellBg}`}
            >
              {/* Day Number */}
              <span className={`text-[10px] font-bold leading-none ${isToday ? 'text-white font-extrabold' : 'text-zinc-400'}`}>
                {dayNum}
              </span>

              {/* Status Badges */}
              <div className="flex items-center space-x-0.5 justify-center">
                {u1 === 'PAKHAN' && <span className="text-[10px] font-bold text-emerald-400" title="Даня: Пахан">Д</span>}
                {u1 === 'MALOY' && <span className="text-[9px]" title="Даня: Малой">🍼</span>}

                {u2 === 'PAKHAN' && <span className="text-[10px] font-bold text-sky-400" title="Миша: Пахан">М</span>}
                {u2 === 'MALOY' && <span className="text-[9px]" title="Миша: Малой">🍼</span>}

                {u1 === 'NONE' && u2 === 'NONE' && (
                  <div className="w-1 h-1 rounded-full bg-zinc-800 my-0.5" />
                )}
              </div>

              <div className="h-0.5" />
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-around text-[10px] text-zinc-400">
        <div className="flex items-center space-x-1">
          <span className="text-emerald-400 font-bold">Д</span>
          <span>Даня</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-sky-400 font-bold">М</span>
          <span>Миша</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>💪</span>
          <span>Оба</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>🍼</span>
          <span>Малой</span>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md">
          {calendarCard}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      {calendarCard}
    </div>
  );
};
