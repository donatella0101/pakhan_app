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

  const [y, m, d] = dateStr.split('-').map(Number);
  const parsedDate = new Date(y, m - 1, d);
  const formattedDate = parsedDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric'
  });

  const buddyName = isUser1
    ? (user2?.username === 'hansahools' ? 'Миша' : (user2?.first_name || 'Миша'))
    : (user1?.username === 'znkssmt' ? 'Даня' : (user1?.first_name || 'Даня'));

  const handleSave = async () => {
    try {
      setSaving(true);
      hapticImpact('heavy');
      if (selectedStatus === 'PAKHAN') {
        confetti({
          particleCount: 50,
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

  const bothSelected = currentMyStatus !== 'NONE' && currentBuddyStatus !== 'NONE';
  let dayImgSrc = '';
  let dayBadge = '';
  let dayPhrase = '';

  if (bothSelected) {
    if (currentMyStatus === 'PAKHAN' && currentBuddyStatus === 'PAKHAN') {
      dayImgSrc = '/assets/both_pakhan.jpg';
      dayBadge = 'ОБА ПАХАНЫ 💪💪';
      dayPhrase = 'СПАРТАНЦЫ НЕ ОТСТУПАЮТ, НЕ КАПИТУЛИРУЮТ';
    } else if (currentMyStatus === 'MALOY' && currentBuddyStatus === 'MALOY') {
      dayImgSrc = '/assets/both_maloy.jpg';
      dayBadge = 'ОБА МАЛЫЕ 🍼🍼';
      dayPhrase = 'Отлично проебали день гомики с горбатой горы, завтра узнаем остались ли вы пидорами';
    } else if (currentMyStatus === 'PAKHAN' && currentBuddyStatus === 'MALOY') {
      dayImgSrc = isUser1 ? '/assets/danya_pakhan.jpg' : '/assets/misha_pakhan.jpg';
      dayBadge = isUser1 ? 'ДАНЯ — ПАХАН 💪' : 'МИША — ПАХАН 💪';
      dayPhrase = 'приветствую пахан сегодня это твой день от начала и до конца, еби и завтрешний день';
    } else if (currentMyStatus === 'MALOY' && currentBuddyStatus === 'PAKHAN') {
      dayImgSrc = isUser1 ? '/assets/danya_maloy.jpg' : '/assets/misha_maloy.jpg';
      dayBadge = isUser1 ? 'ДАНЯ — МАЛОЙ 🍼' : 'МИША — МАЛОЙ 🍼';
      dayPhrase = 'общий малой сегодня ты конкертная вафельница попробуй сделать хоть что нибудь завтра';
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-dark-950 border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition active:scale-95 border border-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 pr-8">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider font-display">
            Отметка дня
          </span>
          <h3 className="text-base font-extrabold text-white capitalize font-display">
            {formattedDate}
          </h3>
        </div>

        {/* Outcome photo card if BOTH filled */}
        {bothSelected && dayImgSrc && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-white/15 bg-zinc-950 shadow-xl">
            <div className="relative w-full aspect-[4/3] bg-zinc-900">
              <img src={dayImgSrc} alt={dayBadge} className="w-full h-full object-cover object-center" />
              <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-wider text-white">
                {dayBadge}
              </div>
            </div>
            <div className="p-3 bg-zinc-950 text-center border-t border-white/10">
              <p className="text-xs text-zinc-100 font-semibold italic leading-relaxed">
                «{dayPhrase}»
              </p>
            </div>
          </div>
        )}

        {/* Outcome banner if buddy filled */}
        <div className="mb-4 p-3 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-zinc-400 block text-[10px] uppercase font-bold">
              Статус {buddyName}:
            </span>
            <span className="font-bold text-white">
              {currentBuddyStatus === 'PAKHAN' && '💪 Пахан (не ленился)'}
              {currentBuddyStatus === 'MALOY' && '🍼 Малой (дал слабину)'}
              {currentBuddyStatus === 'NONE' && '⏳ Ещё не отметил день'}
            </span>
          </div>

          <div className="text-2xl">
            {currentBuddyStatus === 'PAKHAN' ? '💪' : currentBuddyStatus === 'MALOY' ? '🍼' : '⏳'}
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
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                selectedStatus === 'PAKHAN'
                  ? 'bg-white border-white text-black font-extrabold shadow-xl scale-[1.02]'
                  : 'bg-zinc-900 border-white/10 text-zinc-300 hover:border-white/30'
              }`}
            >
              <span className="text-3xl mb-1.5 leading-none">💪</span>
              <span className={`text-xs font-black uppercase font-display ${selectedStatus === 'PAKHAN' ? 'text-black' : 'text-white'}`}>
                Пахан
              </span>
              <span className={`text-[10px] mt-0.5 ${selectedStatus === 'PAKHAN' ? 'text-black/80 font-bold' : 'text-zinc-500'}`}>
                день закрыт чётко
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                hapticImpact('medium');
                setSelectedStatus('MALOY');
              }}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                selectedStatus === 'MALOY'
                  ? 'bg-zinc-800 border-white/20 text-white font-extrabold shadow-lg scale-[1.02]'
                  : 'bg-zinc-900 border-white/10 text-zinc-300 hover:border-rose-500/30'
              }`}
            >
              <span className="text-3xl mb-1.5 leading-none">🍼</span>
              <span className={`text-xs font-black uppercase font-display ${selectedStatus === 'MALOY' ? 'text-rose-400' : 'text-zinc-300'}`}>
                Малой
              </span>
              <span className={`text-[10px] mt-0.5 ${selectedStatus === 'MALOY' ? 'text-rose-300' : 'text-zinc-500'}`}>
                день потерян
              </span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || selectedStatus === 'NONE'}
          className={`w-full py-3.5 rounded-2xl font-extrabold text-sm font-display tracking-wider transition active:scale-95 flex items-center justify-center space-x-2 shadow-lg ${
            selectedStatus === 'NONE'
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-zinc-200'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{saving ? 'Сохранение...' : 'Зафиксировать день'}</span>
        </button>
      </div>
    </div>
  );
};
