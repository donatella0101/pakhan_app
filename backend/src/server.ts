import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { db, initDb } from './db.js';
import { setupBot, sendNudgeMessage } from './bot.js';
import { calculateStatsForPeriod, getMonthDates, getWeekDates, getPreviousWeekDates, getYearDates, DailyRecord } from './stats.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config(); // fallback to current working directory

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Allow iframe embedding in Telegram WebApp
app.use((_req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  next();
});

// Ensure canonical duel exists for Danya (@znkssmt) and Misha (@hansahools)
export function ensureCanonicalDuel() {
  // Ensure Danya exists
  let danya = db.prepare("SELECT * FROM users WHERE username = 'znkssmt' OR telegram_id = '756260518'").get() as any;
  if (!danya) {
    danya = db.prepare(`
      INSERT INTO users (telegram_id, username, first_name)
      VALUES ('756260518', 'znkssmt', 'Даня')
      RETURNING *
    `).get() as any;
  } else if (danya.first_name !== 'Даня') {
    db.prepare("UPDATE users SET first_name = 'Даня' WHERE id = ?").run(danya.id);
    danya.first_name = 'Даня';
  }

  // Ensure Misha exists
  let misha = db.prepare("SELECT * FROM users WHERE username = 'hansahools' OR telegram_id = '739647994'").get() as any;
  if (!misha) {
    misha = db.prepare(`
      INSERT INTO users (telegram_id, username, first_name)
      VALUES ('739647994', 'hansahools', 'Миша')
      RETURNING *
    `).get() as any;
  } else if (misha.first_name !== 'Миша') {
    db.prepare("UPDATE users SET first_name = 'Миша' WHERE id = ?").run(misha.id);
    misha.first_name = 'Миша';
  }

  // Ensure canonical duel pakhan_main exists
  let duel = db.prepare("SELECT * FROM duels WHERE code = 'pakhan_main'").get() as any;
  if (!duel) {
    const first = db.prepare("SELECT * FROM duels ORDER BY id ASC LIMIT 1").get() as any;
    if (first) {
      db.prepare("UPDATE duels SET code = 'pakhan_main', user1_id = ?, user2_id = ? WHERE id = ?").run(danya.id, misha.id, first.id);
      duel = db.prepare("SELECT * FROM duels WHERE id = ?").get(first.id) as any;
    } else {
      duel = db.prepare(`
        INSERT INTO duels (code, title, user1_id, user2_id)
        VALUES ('pakhan_main', 'Дуэль Паханов', ?, ?)
        RETURNING *
      `).get(danya.id, misha.id) as any;
    }
  } else {
    db.prepare("UPDATE duels SET user1_id = ?, user2_id = ? WHERE id = ?").run(danya.id, misha.id, duel.id);
  }

  // Ensure initial sample history if table is empty
  const recCount = db.prepare('SELECT COUNT(*) as count FROM daily_records WHERE duel_id = ?').get(duel.id) as any;
  if (!recCount || recCount.count === 0) {
    const today = new Date();
    for (let i = 4; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const u1 = i % 2 === 0 ? 'PAKHAN' : 'MALOY';
      const u2 = i === 1 ? 'MALOY' : 'PAKHAN';
      db.prepare(`
        INSERT OR IGNORE INTO daily_records (duel_id, date, user1_status, user2_status)
        VALUES (?, ?, ?, ?)
      `).run(duel.id, dateStr, u1, u2);
    }
  }

  return { danya, misha, duel };
}

// Initialize SQLite database & ensure canonical duel on boot
initDb();
ensureCanonicalDuel();

// Start Telegram Bot
setupBot();

// Helper to generate a friendly duel code
function generateDuelCode(): string {
  return 'duel_' + crypto.randomBytes(4).toString('hex');
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Init user and get or join duel
app.post('/api/duels/init', (req, res) => {
  try {
    const { telegramUser, asUser } = req.body;
    const { danya, misha, duel } = ensureCanonicalDuel();

    // Check if opened inside Telegram
    const isMock = !telegramUser?.id || String(telegramUser.id).startsWith('demo_');
    const requestedSlot = asUser || 'user1';

    // Determine if caller is Misha or Danya
    const isMisha =
      telegramUser?.username?.toLowerCase() === 'hansahools' ||
      String(telegramUser?.id) === '739647994' ||
      (isMock && requestedSlot === 'user2');

    let currentUser: any;

    if (telegramUser?.id && !String(telegramUser.id).startsWith('demo_')) {
      // Real Telegram user
      const tgId = String(telegramUser.id);
      const tgUsername = telegramUser.username || (isMisha ? 'hansahools' : 'znkssmt');
      const tgFirstName = isMisha ? 'Миша' : (tgUsername.toLowerCase() === 'znkssmt' ? 'Даня' : (telegramUser.first_name || 'Брат'));
      const tgPhoto = telegramUser.photo_url || null;

      currentUser = db.prepare(`
        INSERT INTO users (telegram_id, username, first_name, photo_url)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(telegram_id) DO UPDATE SET
          username = excluded.username,
          first_name = excluded.first_name,
          photo_url = excluded.photo_url
        RETURNING *
      `).get(tgId, tgUsername, tgFirstName, tgPhoto);

      // Link to duel slot
      if (isMisha) {
        db.prepare('UPDATE duels SET user2_id = ? WHERE id = ?').run(currentUser.id, duel.id);
      } else {
        db.prepare('UPDATE duels SET user1_id = ? WHERE id = ?').run(currentUser.id, duel.id);
      }
    } else {
      // Mock / Local preview
      currentUser = isMisha ? misha : danya;
    }

    const updatedDuel = db.prepare('SELECT * FROM duels WHERE id = ?').get(duel.id) as any;
    const user1 = db.prepare('SELECT id, telegram_id, username, first_name, photo_url FROM users WHERE id = ?').get(updatedDuel.user1_id) as any;
    const user2 = db.prepare('SELECT id, telegram_id, username, first_name, photo_url FROM users WHERE id = ?').get(updatedDuel.user2_id) as any;

    res.json({
      currentUser,
      duel: updatedDuel,
      user1,
      user2
    });
  } catch (error: any) {
    console.error('Init error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Get duel details & calendar records
app.get('/api/duels/:code', (req, res) => {
  try {
    const { code } = req.params;
    const duel = db.prepare('SELECT * FROM duels WHERE code = ?').get(code) as any;
    if (!duel) {
      return res.status(404).json({ error: 'Дуэль не найдена' });
    }

    const user1 = db.prepare('SELECT id, telegram_id, username, first_name, photo_url FROM users WHERE id = ?').get(duel.user1_id);
    const user2 = duel.user2_id
      ? db.prepare('SELECT id, telegram_id, username, first_name, photo_url FROM users WHERE id = ?').get(duel.user2_id)
      : null;

    const records = db.prepare('SELECT * FROM daily_records WHERE duel_id = ? ORDER BY date ASC').all(duel.id) as DailyRecord[];

    // Calculate stats
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const weekDates = getWeekDates(now);
    const prevWeekDates = getPreviousWeekDates(now);
    const monthDates = getMonthDates(currentYear, currentMonth);
    const yearDates = getYearDates(currentYear);

    const u1Name = (user1 as any)?.first_name || 'Даня';
    const u2Name = (user2 as any)?.first_name || 'Миша';

    const weekStats = calculateStatsForPeriod(records, weekDates.start, weekDates.end, 'week', u1Name, u2Name);
    const lastWeekStats = calculateStatsForPeriod(records, prevWeekDates.start, prevWeekDates.end, 'week', u1Name, u2Name);
    const monthStats = calculateStatsForPeriod(records, monthDates.start, monthDates.end, 'month', u1Name, u2Name);
    const yearStats = calculateStatsForPeriod(records, yearDates.start, yearDates.end, 'year', u1Name, u2Name);

    res.json({
      duel,
      user1,
      user2,
      records,
      stats: {
        week: weekStats,
        lastWeek: lastWeekStats,
        month: monthStats,
        year: yearStats
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Update status for a specific day (Option 2: Each player submits their own status)
app.post('/api/duels/:code/status', (req, res) => {
  try {
    const { code } = req.params;
    const { telegramId, date, status, note } = req.body;

    if (!date || !status) {
      return res.status(400).json({ error: 'Не указана дата или статус' });
    }

    const duel = db.prepare('SELECT * FROM duels WHERE code = ?').get(code) as any;
    if (!duel) {
      return res.status(404).json({ error: 'Дуэль не найдена' });
    }

    // Find user
    const user = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(String(telegramId)) as any;
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isUser1 = duel.user1_id === user.id || user.username?.toLowerCase() === 'znkssmt' || user.telegram_id === '756260518';
    const isUser2 = duel.user2_id === user.id || user.username?.toLowerCase() === 'hansahools' || user.telegram_id === '739647994';

    if (!isUser1 && !isUser2) {
      return res.status(403).json({ error: 'Вы не являетесь участником этой дуэли' });
    }

    // Fetch existing daily record or insert default
    let record = db.prepare('SELECT * FROM daily_records WHERE duel_id = ? AND date = ?').get(duel.id, date) as any;

    if (!record) {
      db.prepare(`
        INSERT INTO daily_records (duel_id, date, user1_status, user2_status, note)
        VALUES (?, ?, 'NONE', 'NONE', ?)
      `).run(duel.id, date, note || null);
      record = db.prepare('SELECT * FROM daily_records WHERE duel_id = ? AND date = ?').get(duel.id, date);
    }

    // Update status for the specific user
    const columnToUpdate = isUser1 ? 'user1_status' : 'user2_status';
    db.prepare(`
      UPDATE daily_records 
      SET ${columnToUpdate} = ?, note = COALESCE(?, note), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, note || null, record.id);

    const updatedRecord = db.prepare('SELECT * FROM daily_records WHERE id = ?').get(record.id);

    res.json({
      success: true,
      record: updatedRecord
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Nudge friend to submit their status
app.post('/api/duels/:code/nudge', async (req, res) => {
  try {
    const { code } = req.params;
    const { telegramId } = req.body;

    const duel = db.prepare('SELECT * FROM duels WHERE code = ?').get(code) as any;
    if (!duel) return res.status(404).json({ error: 'Дуэль не найдена' });

    const user = db.prepare('SELECT id, first_name, username, telegram_id FROM users WHERE telegram_id = ?').get(String(telegramId)) as any;
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const isUser1 = duel.user1_id === user.id || user.username?.toLowerCase() === 'znkssmt' || user.telegram_id === '756260518';
    const targetUserId = isUser1 ? duel.user2_id : duel.user1_id;

    if (!targetUserId) {
      return res.status(400).json({ error: 'Второй кореш еще не подключился к дуэли' });
    }

    const targetUser = db.prepare('SELECT telegram_id, first_name, username FROM users WHERE id = ?').get(targetUserId) as any;
    if (!targetUser) return res.status(404).json({ error: 'Кореш не найден' });

    const senderDisplayName = isUser1 ? 'Даня' : 'Миша';
    const sent = await sendNudgeMessage(targetUser.telegram_id, senderDisplayName, duel.code);

    res.json({
      success: sent,
      message: sent ? 'Пинок успешно отправлен в Telegram!' : 'Не удалось отправить сообщение (возможно, бот заблокирован)'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend static build in production
const frontendDist = process.env.FRONTEND_DIST || path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер «Пахан vs Малой» запущен на http://localhost:${PORT}`);
});
