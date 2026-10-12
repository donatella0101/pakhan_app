import React, { useEffect, useState, useMemo } from 'react';
import { DailyRecord, PlayerStatus, User } from './types';
import { initTelegram, getTelegramUser } from './telegram';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { WeekStrip } from './components/WeekStrip';
import { LastWeekChampion } from './components/LastWeekChampion';
import { TodayCard } from './components/TodayCard';
import { CalendarView } from './components/CalendarView';
import { DayModal } from './components/DayModal';
import { InviteModal } from './components/InviteModal';
import { OutcomeModal, OutcomeType } from './components/OutcomeModal';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [duel, setDuel] = useState<any | null>(null);
  const [user1, setUser1] = useState<User | null>(null);
  const [user2, setUser2] = useState<User | null>(null);

  const [records, setRecords] = useState<Record<string, DailyRecord>>({});
  const [stats, setStats] = useState<any | null>(null);

  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDayModalDate, setSelectedDayModalDate] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [outcomeModal, setOutcomeModal] = useState<{ isOpen: boolean; outcome: OutcomeType } | null>(null);

  // Profile slot for demo / web mode
  const [profileSlot, setProfileSlot] = useState<'user1' | 'user2'>(() => {
    return (localStorage.getItem('pakhan_slot') as 'user1' | 'user2') || 'user1';
  });

  // Today's YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Current week Monday
  const currentWeekStart = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setDate(diff + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [weekOffset]);

  // Fetch or initialize duel
  const initializeApp = async (slot = profileSlot) => {
    try {
      setLoading(true);
      setError(null);
      initTelegram();

      const tgUser = getTelegramUser();
      const urlParams = new URLSearchParams(window.location.search);
      const duelCodeFromUrl = urlParams.get('duel') || undefined;

      // 1. Init duel session
      const initRes = await fetch('/api/duels/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramUser: tgUser,
          duelCode: duelCodeFromUrl,
          asUser: slot
        })
      });

      if (!initRes.ok) {
        throw new Error(`Ошибка сервера: ${initRes.statusText}`);
      }

      const initData = await initRes.json();
      setCurrentUser(initData.currentUser);
      setDuel(initData.duel);
      setUser1(initData.user1);
      setUser2(initData.user2);

      // 2. Fetch full records & stats
      await fetchDuelData(initData.duel.code);
    } catch (err: any) {
      console.error('App init error:', err);
      setError(err.message || 'Ошибка подключения');
    } finally {
      setLoading(false);
    }
  };

  const fetchDuelData = async (code: string) => {
    try {
      const res = await fetch(`/api/duels/${code}`);
      if (!res.ok) throw new Error('Не удалось загрузить данные дуэли');
      const data = await res.json();

      setUser1(data.user1);
      setUser2(data.user2);
      setStats(data.stats);

      const recordMap: Record<string, DailyRecord> = {};
      data.records.forEach((r: DailyRecord) => {
        recordMap[r.date] = r;
      });
      setRecords(recordMap);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  // Poll every 5 seconds for live updates when buddy marks their status
  useEffect(() => {
    if (!duel?.code) return;
    const interval = setInterval(() => {
      fetchDuelData(duel.code);
    }, 5000);
    return () => clearInterval(interval);
  }, [duel?.code]);

  const handleToggleUser = async () => {
    const nextSlot = profileSlot === 'user1' ? 'user2' : 'user1';
    setProfileSlot(nextSlot);
    localStorage.setItem('pakhan_slot', nextSlot);
    await initializeApp(nextSlot);
  };

  // Handle setting status for today or specific day
  const handleUpdateStatus = async (dateStr: string, status: PlayerStatus) => {
    if (!duel || !currentUser) return;

    try {
      const res = await fetch(`/api/duels/${duel.code}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: currentUser.telegram_id,
          date: dateStr,
          status
        })
      });

      if (!res.ok) throw new Error('Ошибка обновления статуса');
      const data = await res.json();
      const updatedRecord: DailyRecord = data.record;

      // Update record in state
      setRecords((prev) => ({
        ...prev,
        [dateStr]: updatedRecord
      }));

      // Trigger outcome modal ONLY if both players have selected their status for this day
      if (updatedRecord.user1_status !== 'NONE' && updatedRecord.user2_status !== 'NONE') {
        const isU1 = currentUser.telegram_id === user1?.telegram_id;
        const myStat = isU1 ? updatedRecord.user1_status : updatedRecord.user2_status;
        const buddyStat = isU1 ? updatedRecord.user2_status : updatedRecord.user1_status;

        if (myStat === 'PAKHAN' && buddyStat === 'PAKHAN') {
          setOutcomeModal({ isOpen: true, outcome: 'BOTH_PAKHAN' });
        } else if (myStat === 'MALOY' && buddyStat === 'MALOY') {
          setOutcomeModal({ isOpen: true, outcome: 'BOTH_MALOY' });
        } else if (myStat === 'PAKHAN' && buddyStat === 'MALOY') {
          setOutcomeModal({ isOpen: true, outcome: 'I_WON' });
        } else if (myStat === 'MALOY' && buddyStat === 'PAKHAN') {
          setOutcomeModal({ isOpen: true, outcome: 'BUDDY_WON' });
        }
      }

      // Refetch stats
      await fetchDuelData(duel.code);
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  // Handle nudging buddy
  const handleNudgeBuddy = async () => {
    if (!duel || !currentUser) return;
    try {
      const res = await fetch(`/api/duels/${duel.code}/nudge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: currentUser.telegram_id
        })
      });
      const data = await res.json();
      console.log('Nudge response:', data);
    } catch (e) {
      console.error('Nudge failed:', e);
    }
  };

  // Month navigation
  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl mb-4 animate-pulse shadow-2xl">
          💪
        </div>
        <h2 className="text-sm font-black uppercase tracking-wider text-white font-display">
          Из пасанов в паханов
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Даня vs Миша</p>
      </div>
    );
  }

  if (error || !currentUser || !duel || !user1) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-base font-bold text-white mb-1">Что-то пошло не так</h2>
        <p className="text-xs text-zinc-400 mb-4">{error || 'Не удалось найти дуэль'}</p>
        <button
          onClick={() => initializeApp()}
          className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold font-display"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  const isUser1 = currentUser.telegram_id === user1.telegram_id;
  const todayRecord = records[todayStr];
  const myTodayStatus: PlayerStatus = isUser1 ? todayRecord?.user1_status || 'NONE' : todayRecord?.user2_status || 'NONE';
  const buddyTodayStatus: PlayerStatus = isUser1 ? todayRecord?.user2_status || 'NONE' : todayRecord?.user1_status || 'NONE';
  const buddy = isUser1 ? user2 : user1;

  const myName = currentUser.first_name || (isUser1 ? 'Даня' : 'Миша');
  const buddyName = buddy?.first_name || (isUser1 ? 'Миша' : 'Даня');

  return (
    <div className="min-h-screen bg-dark-950 pb-12 flex flex-col max-w-md mx-auto shadow-2xl relative text-zinc-100">
      {/* Header with duel fighters */}
      <Header
        duel={duel}
        currentUser={currentUser}
        user1={user1}
        user2={user2}
        onOpenInvite={() => setShowInviteModal(true)}
        onToggleUser={!getTelegramUser() ? handleToggleUser : undefined}
      />

      {/* Main Stats (Пахан недели, месяца, года - Lime D vs Sky M) */}
      {stats && (
        <StatsOverview
          stats={stats}
          currentUser={currentUser}
          user1={user1}
          user2={user2}
        />
      )}

      {/* Week Strip (7 squares with days of the week) */}
      <WeekStrip
        currentWeekStart={currentWeekStart}
        records={records}
        todayStr={todayStr}
        user1Name={user1.first_name}
        user2Name={user2?.first_name}
        onSelectDate={(dateStr) => setSelectedDayModalDate(dateStr)}
        onPrevWeek={() => setWeekOffset((prev) => prev - 1)}
        onNextWeek={() => setWeekOffset((prev) => Math.min(0, prev + 1))}
      />

      {/* Today's Action Card */}
      <TodayCard
        todayStr={todayStr}
        myStatus={myTodayStatus}
        buddyStatus={buddyTodayStatus}
        buddy={buddy}
        isViewerDanya={isUser1}
        onSetStatus={(status) => handleUpdateStatus(todayStr, status)}
        onNudgeBuddy={handleNudgeBuddy}
        onTriggerOutcome={(outcome) => setOutcomeModal({ isOpen: true, outcome })}
      />

      {/* Button to open Monthly Calendar */}
      <div className="px-4 py-2">
        <button
          onClick={() => setShowCalendarModal(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 active:scale-98 transition flex items-center justify-between text-xs font-bold text-white shadow-xl group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white text-base">
              📅
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xs block font-display">Посмотреть календарь месяца</span>
              <span className="text-[10px] text-zinc-400 font-normal">Кто какие дни забрал</span>
            </div>
          </div>
          <span className="text-xs text-zinc-400 group-hover:text-white transition font-bold flex items-center space-x-1">
            <span>Открыть</span>
            <span>➔</span>
          </span>
        </button>
      </div>

      {/* Last Week Champion Banner (внизу под календарем) */}
      <LastWeekChampion
        lastWeekStats={stats?.lastWeek}
        currentWeekStats={stats?.week}
        user1={user1}
        user2={user2}
      />

      {/* Interactive Month Calendar Modal */}
      {showCalendarModal && (
        <CalendarView
          isModal={true}
          currentDate={calendarDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          records={records}
          user1={user1}
          user2={user2}
          currentUser={currentUser}
          onSelectDay={(dateStr) => {
            setSelectedDayModalDate(dateStr);
          }}
          onClose={() => setShowCalendarModal(false)}
        />
      )}

      {/* Outcome Art Modal (4 scenarios) */}
      {outcomeModal && (
        <OutcomeModal
          isOpen={outcomeModal.isOpen}
          outcome={outcomeModal.outcome}
          myName={myName}
          buddyName={buddyName}
          isViewerDanya={isUser1}
          onClose={() => setOutcomeModal(null)}
        />
      )}

      {/* Day Edit Modal */}
      {selectedDayModalDate && (
        <DayModal
          dateStr={selectedDayModalDate}
          record={records[selectedDayModalDate]}
          currentUser={currentUser}
          user1={user1}
          user2={user2}
          onClose={() => setSelectedDayModalDate(null)}
          onSaveStatus={(dateStr, status) => handleUpdateStatus(dateStr, status)}
        />
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          duel={duel}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};

export default App;
