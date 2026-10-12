import React from 'react';
import { User, Duel } from '../types';
import { Share2, UserPlus, Zap } from 'lucide-react';
import { hapticImpact } from '../telegram';

interface HeaderProps {
  duel: Duel;
  currentUser: User;
  user1: User;
  user2: User | null;
  onOpenInvite: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  duel,
  currentUser,
  user1,
  user2,
  onOpenInvite
}) => {
  return (
    <header className="relative pt-3 pb-4 px-4 bg-gradient-to-b from-dark-800 to-dark-900 border-b border-white/5">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm">
            👑
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider uppercase text-white font-display">
              Пахан vs Малой
            </h1>
            <p className="text-[10px] text-zinc-400 tracking-wide uppercase font-semibold">
              Битва дисциплины #{duel.code}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            hapticImpact('light');
            onOpenInvite();
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 transition border border-white/10 text-xs font-medium text-amber-400"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Позвать</span>
        </button>
      </div>

      {/* Versus Cards */}
      <div className="grid grid-cols-11 gap-2 items-center">
        {/* Fighter 1 */}
        <div className="col-span-5 glass-panel rounded-2xl p-3 flex flex-col items-center text-center relative overflow-hidden border-amber-500/20">
          <div className="relative mb-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                {user1.photo_url ? (
                  <img src={user1.photo_url} alt={user1.first_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">😎</span>
                )}
              </div>
            </div>
            {user1.telegram_id === currentUser.telegram_id && (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black font-extrabold text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow">
                Ты
              </span>
            )}
          </div>
          <span className="font-bold text-xs text-white truncate max-w-[110px]">
            {user1.first_name}
          </span>
          <span className="text-[10px] text-amber-400/80 font-medium truncate max-w-[110px]">
            @{user1.username || 'пахан'}
          </span>
        </div>

        {/* VS Badge */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-amber-400 shadow-md">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
        </div>

        {/* Fighter 2 */}
        <div className="col-span-5 glass-panel rounded-2xl p-3 flex flex-col items-center text-center relative overflow-hidden border-white/5">
          {user2 ? (
            <>
              <div className="relative mb-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 p-0.5 shadow-lg shadow-indigo-500/20">
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                    {user2.photo_url ? (
                      <img src={user2.photo_url} alt={user2.first_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🦁</span>
                    )}
                  </div>
                </div>
                {user2.telegram_id === currentUser.telegram_id && (
                  <span className="absolute -bottom-1 -right-1 bg-indigo-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow">
                    Ты
                  </span>
                )}
              </div>
              <span className="font-bold text-xs text-white truncate max-w-[110px]">
                {user2.first_name}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[110px]">
                @{user2.username || 'кореш'}
              </span>
            </>
          ) : (
            <button
              onClick={() => {
                hapticImpact('medium');
                onOpenInvite();
              }}
              className="flex flex-col items-center justify-center py-2 group w-full"
            >
              <div className="w-12 h-12 rounded-full border border-dashed border-zinc-600 group-hover:border-amber-400 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 mb-1 transition">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-400">
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
