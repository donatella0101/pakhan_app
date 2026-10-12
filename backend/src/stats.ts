export interface DailyRecord {
  id?: number;
  duel_id: number;
  date: string; // YYYY-MM-DD
  user1_status: 'PAKHAN' | 'MALOY' | 'PENDING' | 'NONE';
  user2_status: 'PAKHAN' | 'MALOY' | 'PENDING' | 'NONE';
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

// Get dates for current week (Monday through Sunday)
export function getWeekDates(referenceDate = new Date()): { start: string; end: string } {
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + distanceToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
}

// Get dates for current month
export function getMonthDates(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

// Get dates for current year
export function getYearDates(year: number): { start: string; end: string } {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`
  };
}

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateStatsForPeriod(
  records: DailyRecord[],
  startDate: string,
  endDate: string,
  period: 'week' | 'month' | 'year',
  user1Name: string,
  user2Name: string
): PeriodStats {
  let u1Pakhan = 0;
  let u2Pakhan = 0;
  let u1Maloy = 0;
  let u2Maloy = 0;
  let bothPakhan = 0;
  let bothMaloy = 0;
  let totalTracked = 0;

  for (const r of records) {
    if (r.date >= startDate && r.date <= endDate) {
      const u1 = r.user1_status;
      const u2 = r.user2_status;

      if (u1 !== 'NONE' && u1 !== 'PENDING' && u2 !== 'NONE' && u2 !== 'PENDING') {
        totalTracked++;
        if (u1 === 'PAKHAN') u1Pakhan++;
        if (u1 === 'MALOY') u1Maloy++;
        if (u2 === 'PAKHAN') u2Pakhan++;
        if (u2 === 'MALOY') u2Maloy++;

        if (u1 === 'PAKHAN' && u2 === 'PAKHAN') bothPakhan++;
        if (u1 === 'MALOY' && u2 === 'MALOY') bothMaloy++;
      } else if (u1 === 'PAKHAN') {
        u1Pakhan++;
      } else if (u2 === 'PAKHAN') {
        u2Pakhan++;
      }
    }
  }

  let winner: PeriodStats['winner'] = 'undecided';
  let winnerName: string | undefined = undefined;

  if (totalTracked > 0 || u1Pakhan > 0 || u2Pakhan > 0) {
    if (u1Pakhan > u2Pakhan) {
      winner = 'user1';
      winnerName = user1Name;
    } else if (u2Pakhan > u1Pakhan) {
      winner = 'user2';
      winnerName = user2Name;
    } else if (u1Pakhan === u2Pakhan && u1Pakhan > 0) {
      winner = 'tie_pakhan';
      winnerName = 'Оба Паханы (Ничья!)';
    } else if (u1Maloy > 0 && u2Maloy > 0) {
      winner = 'tie_maloy';
      winnerName = 'Оба Малые (Позор!)';
    }
  }

  const titles = {
    week: 'Пахан недели',
    month: 'Пахан месяца',
    year: 'Пахан года'
  };

  return {
    period,
    title: titles[period],
    user1_pakhan_count: u1Pakhan,
    user2_pakhan_count: u2Pakhan,
    user1_maloy_count: u1Maloy,
    user2_maloy_count: u2Maloy,
    both_pakhan_count: bothPakhan,
    both_maloy_count: bothMaloy,
    total_tracked_days: totalTracked,
    winner,
    winner_name: winnerName
  };
}
