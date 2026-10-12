import React from 'react';
import { X } from 'lucide-react';
import { hapticImpact } from '../telegram';

export type OutcomeType = 'I_WON' | 'BUDDY_WON' | 'BOTH_PAKHAN' | 'BOTH_MALOY';

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  outcome: OutcomeType;
  myName: string;
  buddyName: string;
  isViewerDanya?: boolean;
}

export const OutcomeModal: React.FC<OutcomeModalProps> = ({
  isOpen,
  onClose,
  outcome,
  isViewerDanya = true
}) => {
  if (!isOpen) return null;

  // Determine illustration image based on who is viewing and outcome
  const getIllustrationSrc = (): string => {
    switch (outcome) {
      case 'BOTH_PAKHAN':
        return '/assets/both_pakhan.jpg';
      case 'BOTH_MALOY':
        return '/assets/both_maloy.jpg';
      case 'I_WON':
        // Viewer is PAKHAN (Danya in red jacket with belt / Misha looking stern)
        return isViewerDanya ? '/assets/danya_pakhan.jpg' : '/assets/misha_pakhan.jpg';
      case 'BUDDY_WON':
        // Viewer is MALOY (Danya on couch with bottle / Misha sitting down)
        return isViewerDanya ? '/assets/danya_maloy.jpg' : '/assets/misha_maloy.jpg';
    }
  };

  // Content configurations with the user's custom phrases
  const contentConfig = {
    I_WON: {
      badge: 'ТЫ ПАХАН',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      title: 'ТЫ СЕГОДНЯ ПАХАН! 💪',
      subtitle: 'Приветствую пахан, сегодня это твой день от начала и до конца, еби и завтрашний день',
      borderColor: 'border-emerald-500/50',
      buttonText: 'Так точно, Пахан! 👊'
    },
    BUDDY_WON: {
      badge: 'ТЫ МАЛОЙ',
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
      title: 'СЕГОДНЯ ТЫ МАЛОЙ 🍼',
      subtitle: 'Общий малой, сегодня ты конкретная вафельница, попробуй сделать хоть что нибудь завтра',
      borderColor: 'border-sky-500/50',
      buttonText: 'Завтра исправлюсь 🤝'
    },
    BOTH_PAKHAN: {
      badge: 'СПАРТА',
      badgeColor: 'bg-white/10 text-white border-white/30',
      title: 'ДВА ПАХАНА РАЙОНА! 💪💪',
      subtitle: 'СПАРТАНЦЫ НЕ ОТСТУПАЮТ, НЕ КАПИТУЛИРУЮТ',
      borderColor: 'border-white/40',
      buttonText: 'МОЩЬ ⚡️'
    },
    BOTH_MALOY: {
      badge: 'ДЕНЬ ЛЕНИ',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      title: 'ОБА ДАЛИ СЛАБИНУ 🍼🍼',
      subtitle: 'Отлично проебали день, ковбои с Горбатой горы! Завтра узнаем, исправитесь ли вы',
      borderColor: 'border-rose-500/40',
      buttonText: 'Завтра реванш 💤'
    }
  };

  const current = contentConfig[outcome];
  const imgSrc = getIllustrationSrc();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-sm rounded-3xl p-5 bg-dark-950 border ${current.borderColor} shadow-2xl text-center overflow-hidden`}>
        {/* Close Button */}
        <button
          onClick={() => {
            hapticImpact('light');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition z-20 border border-white/5"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3.5 border border-solid shadow-sm">
          <span className={`px-2 py-0.5 rounded-full ${current.badgeColor}`}>
            {current.badge}
          </span>
        </div>

        {/* Photo Card */}
        <div className="mb-4 relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-zinc-900">
          <img
            src={imgSrc}
            alt={current.title}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-white font-display mb-1.5 tracking-wide">
          {current.title}
        </h3>

        {/* Custom Phrase Subtitle */}
        <p className="text-xs text-zinc-200 leading-relaxed mb-5 px-1 font-semibold italic">
          «{current.subtitle}»
        </p>

        {/* Action Button */}
        <button
          onClick={() => {
            hapticImpact('medium');
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-white text-black font-black text-xs font-display tracking-wider hover:bg-zinc-200 active:scale-95 transition shadow-lg"
        >
          {current.buttonText}
        </button>
      </div>
    </div>
  );
};
