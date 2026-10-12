import React, { useState } from 'react';
import { DailyRecord, PlayerStatus, User } from '../types';
import { X, Check } from 'lucide-react';
import { hapticImpact, hapticNotification } from '../telegram';
import confetti from 'canvas-confetti';

interface DayModalProps {
  dateStr: string;
  record?: DailyRecord;
  currentUser: User;
  user1: User;
  user2: User | null;
  onClose: () => void;
  onSaveStatus: (dateStr: string, status: PlayerStatus) => Promise<void>;
}

export const DayModal: React.FC<DayModalProps> = ({
  dateStr,
  record,
  currentUser,
  user1,
  user2,
  onClose,
  onSaveStatus
}) => {
  const isUser1 = currentUser.telegram_id === user1.telegram_id;

  const currentMyStatus = isUser1 ? record?.user1_status || 'NONE' : record?.user2_status || 'NONE';
  const currentBuddyStatus = isUser1 ? record?.user2_status || 'NONE' : record?.user1_status || 'NONE';

  const [selectedStatus, setSelectedStatus] = useState<PlayerStatus>(currentMyStatus);
  const [saving, setSaving] = useState(false);

  const parsedDate = new Date(dateStr);
  const formattedDate = parsedDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric'
  });

  const buddyName = isUser1 ? (user2 ? user2.first_name : 'Кореш') : user1.first_name;

  const handleSave = async () => {
    try {
      setSaving(true);
      hapticImpact('heavy');
      if (selectedStatus === 'PAKHAN') {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 }
        });
        hapticNotification('success');
      }
      await onSaveStatus(dateStr, selectedStatus);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-dark-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 pr-8">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            Отметка в календаре
          </span>
          <h3 className="text-base font-extrabold text-white capitalize font-display">
            {formattedDate}
          </h3>
        </div>

        {/* Outcome banner if both filled */}
        <div className="mb-4 p-3 rounded-2xl bg-zinc-800/80 border border-white/5 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-zinc-400 block text-[10px] uppercase font-bold">
              Статус {buddyName}:
            </span>
            <span className="font-bold text-white">
              {currentBuddyStatus === 'PAKHAN' && '👑 Пахан (не ленился)'}
              {currentBuddyStatus === 'MALOY' && '🍼 Малой (дал слабину)'}
              {currentBuddyStatus === 'NONE' && '⏳ Ещё не отметил день'}
            </span>
          </div>

          <div className="text-2xl">
            {currentBuddyStatus === 'PAKHAN' ? '👑' : currentBuddyStatus === 'MALOY' ? '🍼' : '⏳'}
          </div>
        </div>

        {/* My Status Choice */}
        <div className="mb-5">
          <p className="text-xs font-bold text-zinc-300 mb-2">
            Твой статус за этот день:
          </p>

          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              type="button"
              onClick={() => {
                hapticImpact('medium');
                setSelectedStatus('PAKHAN');
              }}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                selectedStatus === 'PAKHAN'
                  ? 'bg-amber-500 border-amber-400 text-black font-extrabold shadow-lg shadow-amber-500/25 scale-102'
                  : 'bg-zinc-800 border-white/5 text-zinc-300 hover:border-amber-500/30'
              }`}
            >
              <span className="text-3xl mb-1">👑</span>
              <span className="text-xs font-black uppercase font-display">
                Пахан
              </span>
              <span className={`text-[10px] ${selectedStatus === 'PAKHAN' ? 'text-black/80' : 'text-zinc-500'}`}>
                день закрыт чётко
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                hapticImpact('medium');
                setSelectedStatus('MALOY');
              }}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                selectedStatus === 'MALOY'
                  ? 'bg-rose-500 border-rose-400 text-white font-extrabold shadow-lg shadow-rose-500/25 scale-102'
                  : 'bg-zinc-800 border-white/5 text-zinc-300 hover:border-rose-500/30'
              }`}
            >
              <span className="text-3xl mb-1">🍼</span>
              <span className="text-xs font-black uppercase font-display">
                Малой
              </span>
              <span className={`text-[10px] ${selectedStatus === 'MALOY' ? 'text-white/80' : 'text-zinc-500'}`}>
                день потерян
              </span>
            </button>
          </div>

          {selectedStatus !== 'NONE' && (
            <button
              onClick={() => setSelectedStatus('NONE')}
              className="w-full text-center text-[11px] text-zinc-500 hover:text-zinc-300 py-1 transition"
            >
              Сбросить отметку
            </button>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 transition font-black text-black font-display text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
        >
          <Check className="w-4 h-4" />
          <span>{saving ? 'Сохранение...' : 'Зафиксировать статус'}</span>
        </button>
      </div>
    </div>
  );
};
