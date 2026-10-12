import React, { useEffect, useState, useMemo } from 'react';
import { DailyRecord, PlayerStatus, User } from './types';
import { initTelegram, getTelegramUser } from './telegram';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { TodayCard } from './components/TodayCard';
import { CalendarView } from './components/CalendarView';
import { DayModal } from './components/DayModal';
import { InviteModal } from './components/InviteModal';
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

  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDayModalDate, setSelectedDayModalDate] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Today's YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Fetch or initialize duel
  const initializeApp = async () => {
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
          duelCode: duelCodeFromUrl
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

      // Update record in state
      setRecords((prev) => ({
        ...prev,
        [dateStr]: data.record
      }));

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
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-3xl mb-4 animate-bounce">
          👑
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-display">
          Загрузка арены...
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Пахан vs Малой</p>
      </div>
    );
  }

  if (error || !currentUser || !duel || !user1) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-base font-bold text-white mb-1">Что-то пошло не так</h2>
        <p className="text-xs text-zinc-400 mb-4">{error || 'Не удалось найти дуэль'}</p>
        <button
          onClick={initializeApp}
          className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold font-display"
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

  return (
    <div className="min-h-screen bg-dark-900 pb-12 flex flex-col max-w-md mx-auto shadow-2xl relative">
      {/* Header with duel fighters */}
      <Header
        duel={duel}
        currentUser={currentUser}
        user1={user1}
        user2={user2}
        onOpenInvite={() => setShowInviteModal(true)}
      />

      {/* Main Stats (Пахан недели, месяца, года) */}
      {stats && (
        <StatsOverview
          stats={stats}
          currentUser={currentUser}
          user1={user1}
          user2={user2}
        />
      )}

      {/* Today's Action Card */}
      <TodayCard
        todayStr={todayStr}
        myStatus={myTodayStatus}
        buddyStatus={buddyTodayStatus}
        buddy={buddy}
        onSetStatus={(status) => handleUpdateStatus(todayStr, status)}
        onNudgeBuddy={handleNudgeBuddy}
      />

      {/* Interactive Calendar */}
      <CalendarView
        currentDate={calendarDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        records={records}
        user1={user1}
        user2={user2}
        currentUser={currentUser}
        onSelectDay={(dateStr) => setSelectedDayModalDate(dateStr)}
      />

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
