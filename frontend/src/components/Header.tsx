import React from 'react';
import { User, Duel } from '../types';
import { Share2, UserPlus, ArrowLeftRight } from 'lucide-react';
import { hapticImpact } from '../telegram';

interface HeaderProps {
  duel: Duel;
  currentUser: User;
  user1: User;
  user2: User | null;
  onOpenInvite: () => void;
  onToggleUser?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  duel,
  currentUser,
  user1,
  user2,
  onOpenInvite,
  onToggleUser
}) => {
  const isUser1Me = user1.telegram_id === currentUser.telegram_id;
  const isUser2Me = user2?.telegram_id === currentUser.telegram_id;

  return (
    <header className="relative pt-3 pb-3 px-4 bg-dark-950 border-b border-white/10 shadow-lg">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-lg">
            💪
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-white font-display">
              Пахан vs Малой
            </h1>
            <p className="text-[10px] text-zinc-400 tracking-wide font-medium">
              Дуэль дисциплины #{duel.code}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick profile switch for web/local test */}
          {onToggleUser && (
            <button
              onClick={() => {
                hapticImpact('light');
                onToggleUser();
              }}
              title="Переключить профиль (Д / М)"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-zinc-300 active:scale-95 transition"
            >
              <ArrowLeftRight className="w-3 h-3 text-zinc-400" />
              <span>{isUser1Me ? 'Я: Данил (Д)' : 'Я: Кореш (М)'}</span>
            </button>
          )}

          {/* Share/Invite button */}
          <button
            onClick={() => {
              hapticImpact('light');
              onOpenInvite();
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 active:scale-95 transition text-xs font-black font-display shadow"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Инвайт</span>
          </button>
        </div>
      </div>

      {/* Versus Cards */}
      <div className="grid grid-cols-11 gap-2 items-center">
        {/* Fighter 1 (Данил / Д - Салатовый) */}
        <div className={`col-span-5 glass-panel rounded-2xl p-2.5 flex flex-col items-center text-center relative overflow-hidden transition ${
          isUser1Me ? 'border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'border-white/10'
        }`}>
          <div className="relative mb-1.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center overflow-hidden">
                <span className="text-xl font-black text-emerald-400 font-display">
                  Д
                </span>
              </div>
            </div>
            {isUser1Me && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-400 text-black font-black text-[8px] px-1.5 py-0.2 rounded-md uppercase tracking-tighter shadow font-display">
                ТЫ
              </span>
            )}
          </div>
          <span className="font-extrabold text-xs text-white truncate max-w-[110px] font-display">
            {user1.first_name || 'Данил'}
          </span>
          <span className="text-[10px] text-emerald-400 font-bold truncate max-w-[110px]">
            Салатовый (Д)
          </span>
        </div>

        {/* VS Badge */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center text-[10px] font-black text-white shadow">
            VS
          </div>
        </div>

        {/* Fighter 2 (Кореш / М - Небесно-голубой) */}
        <div className={`col-span-5 glass-panel rounded-2xl p-2.5 flex flex-col items-center text-center relative overflow-hidden transition ${
          isUser2Me ? 'border-sky-500/50 bg-sky-950/20 shadow-[0_0_15px_rgba(56,189,248,0.15)]' : 'border-white/10'
        }`}>
          {user2 ? (
            <>
              <div className="relative mb-1.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-400 p-0.5 shadow-md shadow-sky-400/20 flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center overflow-hidden">
                    <span className="text-xl font-black text-sky-400 font-display">
                      М
                    </span>
                  </div>
                </div>
                {isUser2Me && (
                  <span className="absolute -bottom-1 -right-1 bg-sky-400 text-black font-black text-[8px] px-1.5 py-0.2 rounded-md uppercase tracking-tighter shadow font-display">
                    ТЫ
                  </span>
                )}
              </div>
              <span className="font-extrabold text-xs text-white truncate max-w-[110px] font-display">
                {user2.first_name || 'Кореш'}
              </span>
              <span className="text-[10px] text-sky-400 font-bold truncate max-w-[110px]">
                Голубой (М)
              </span>
            </>
          ) : (
            <button
              onClick={() => {
                hapticImpact('medium');
                onOpenInvite();
              }}
              className="flex flex-col items-center justify-center py-1 group w-full"
            >
              <div className="w-10 h-10 rounded-2xl border border-dashed border-zinc-600 group-hover:border-sky-400 flex items-center justify-center text-zinc-400 group-hover:text-sky-400 mb-1 transition">
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-sky-400">
                Ждём кореша
              </span>
              <span className="text-[9px] text-zinc-500">
                нажми позвать
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
