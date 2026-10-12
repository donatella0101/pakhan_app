import React, { useState } from 'react';
import { Duel } from '../types';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { openTelegramShare, hapticNotification, hapticImpact } from '../telegram';

interface InviteModalProps {
  duel: Duel;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ duel, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Generate invite link (deep link to Telegram Bot)
  const botUsername = 'pakhan_duel_bot';
  const inviteUrl = `https://t.me/${botUsername}?start=${duel.code}`;

  const shareText = `Здарова! Залетай на дуэль дисциплины: «Пахан vs Малой». Проверим, кто из нас настоящий Пахан, а кто Малой! 💪🍼`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    hapticNotification('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    hapticImpact('heavy');
    openTelegramShare(shareText, inviteUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-dark-950 border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition active:scale-95 border border-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-lg">
            💪
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-display">
              Инвайт на дуэль
            </h3>
            <p className="text-xs text-zinc-400">
              Код дуэли: <span className="text-white font-mono font-bold">{duel.code}</span>
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-5 text-xs text-zinc-300">
          <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-2">
            <p className="font-semibold text-white">Как подключиться:</p>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px]">
              <li>Отправь эту ссылку Мише (@hansahools) в Telegram.</li>
              <li>Он переходит по ссылке и моментально подключается к дуэли.</li>
              <li>Вы оба заполняете дни и рубитесь за звание Пахана недели, месяца и года!</li>
            </ol>
          </div>

          <div className="flex items-center space-x-2 bg-zinc-900 p-2.5 rounded-xl border border-white/10">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="bg-transparent text-xs text-zinc-300 font-mono w-full focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition active:scale-95 flex items-center space-x-1 flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleShareTelegram}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-200 active:scale-98 transition font-black text-black font-display text-xs tracking-wider shadow-lg flex items-center justify-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Отправить Мише в Telegram</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 active:scale-98 transition font-bold text-zinc-300 text-xs flex items-center justify-center space-x-2"
          >
            {copied ? (
              <span className="text-emerald-400 font-bold">Ссылка скопирована в буфер!</span>
            ) : (
              <span>Скопировать ссылку</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
