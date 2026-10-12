declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

export function initTelegram() {
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      if (tg.enableClosingConfirmation) {
        tg.enableClosingConfirmation();
      }
    } catch (e) {
      console.warn('Could not initialize Telegram WebApp SDK', e);
    }
  }
}

export function getTelegramUser() {
  if (tg?.initDataUnsafe?.user) {
    const user = tg.initDataUnsafe.user;
    return {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      photo_url: user.photo_url
    };
  }

  // Fallback demo user for testing in regular browsers
  const savedDemoId = localStorage.getItem('demo_tg_id') || `demo_${Math.floor(Math.random() * 8999 + 1000)}`;
  localStorage.setItem('demo_tg_id', savedDemoId);

  return {
    id: savedDemoId,
    username: 'brat_demo',
    first_name: 'Ты (Пахан)',
    last_name: '',
    photo_url: undefined
  };
}

// Haptic feedback helpers
export function hapticImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
}

export function hapticNotification(type: 'error' | 'success' | 'warning' = 'success') {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred(type);
  }
}

export function hapticSelection() {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.selectionChanged();
  }
}

export function openTelegramShare(text: string, url: string) {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, '_blank');
  }
}
