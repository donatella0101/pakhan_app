export type PlayerStatus = 'PAKHAN' | 'MALOY' | 'NONE';

export interface User {
  id: number;
  telegram_id: string;
  username?: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
}

export interface Duel {
  id: number;
  code: string;
  title: string;
  user1_id: number;
  user2_id?: number;
  created_at: string;
}

export interface DailyRecord {
  id?: number;
  duel_id?: number;
  date: string; // YYYY-MM-DD
  user1_status: PlayerStatus;
  user2_status: PlayerStatus;
  note?: string;
}

export interface PeriodStats {
  period: 'week' | 'month' | 'year';
  title: string;
  user1_pakhan_count: number;
  user2_pakhan_count: number;
  user1_maloy_count: number;
  user2_maloy_count: number;
  both_pakhan_count: number;
  both_maloy_count: number;
  total_tracked_days: number;
  winner: 'user1' | 'user2' | 'tie_pakhan' | 'tie_maloy' | 'undecided';
  winner_name?: string;
}

export interface AppState {
  currentUser: User | null;
  duel: Duel | null;
  user1: User | null;
  user2: User | null;
  records: Record<string, DailyRecord>; // keyed by YYYY-MM-DD
  stats: {
    week: PeriodStats;
    month: PeriodStats;
    year: PeriodStats;
  } | null;
}
