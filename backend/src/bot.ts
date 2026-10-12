import { Bot, InlineKeyboard } from 'grammy';
import cron from 'node-cron';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const token = process.env.BOT_TOKEN || '';
const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:5173';

export const bot = token ? new Bot(token) : null;

export function setupBot() {
  if (!bot) {
    console.log('⚠️ [Telegram Bot] BOT_TOKEN не указан в .env. Бот запущен в режиме WEB / MOCK.');
    return;
  }

  // Handle /start command (including deep linking for duel invitations)
  bot.command('start', async (ctx) => {
    const payload = ctx.match; // e.g. duel_ABC123
    const fromUser = ctx.from;
    if (!fromUser) return;

    // Upsert user in database
    const upsertUser = db.prepare(`
      INSERT INTO users (telegram_id, username, first_name, last_name)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(telegram_id) DO UPDATE SET
        username = excluded.username,
        first_name = excluded.first_name,
        last_name = excluded.last_name
      RETURNING id, first_name
    `);

    const user = upsertUser.get(
      String(fromUser.id),
      fromUser.username || null,
      fromUser.first_name,
      fromUser.last_name || null
    ) as { id: number; first_name: string };

    let replyText = `👋 Здарова, ${fromUser.first_name}!\n\n` +
      `Добро пожаловать в **«Пахан vs Малой»** — трекер дисциплины и дуэль между двумя корешами.\n\n` +
      `👑 **Правила простые:**\n` +
      `• Каждый день отмечаешь свой статус: Пахан (сделал всё чётко) или Малой (обленился).\n` +
      `• Кореш делает то же самое.\n` +
      `• В конце недели, месяца и года смотрим, кто настоящий Пахан района, а кто застрял в Малых!`;

    let duelCode = '';

    if (payload && payload.startsWith('duel_')) {
      duelCode = payload;
      // Connect to duel as user 2 if empty
      const duelStmt = db.prepare('SELECT * FROM duels WHERE code = ?');
      const duel = duelStmt.get(duelCode) as any;

      if (duel) {
        if (duel.user1_id !== user.id && (!duel.user2_id || duel.user2_id === user.id)) {
          db.prepare('UPDATE duels SET user2_id = ? WHERE code = ?').run(user.id, duelCode);
          replyText += `\n\n⚔️ **Ты успешно залетел в дуэль!** Кореш уже ждёт.`;
        }
      }
    }

    const appUrlWithDuel = duelCode ? `${webAppUrl}?duel=${duelCode}` : webAppUrl;

    const keyboard = new InlineKeyboard().webApp(
      '🔥 Открыть битву Паханов',
      appUrlWithDuel
    );

    await ctx.reply(replyText, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  });

  // Daily reminder cron at 21:00 (every day)
  cron.schedule('0 21 * * *', async () => {
    try {
      console.log('⏰ Запуск ежедневного вечернего напоминания...');
      const users = db.prepare('SELECT telegram_id, first_name FROM users').all() as any[];

      for (const u of users) {
        try {
          const keyboard = new InlineKeyboard().webApp('👑 Отметить статус дня', webAppUrl);
          await bot.api.sendMessage(
            u.telegram_id,
            `🌙 **Вечерний подсчёт!**\n\nДень подходит к концу. Ты сегодня **Пахан** 👑 или сдал назад и стал **Малым** 🍼?\n\nЗайди в приложение и зафиксируй свой статус!`,
            {
              parse_mode: 'Markdown',
              reply_markup: keyboard
            }
          );
        } catch (e) {
          // ignore blocked users
        }
      }
    } catch (err) {
      console.error('Ошибка отправки напоминаний:', err);
    }
  });

  // Launch bot long polling
  bot.start({
    onStart: (botInfo) => {
      console.log(`🤖 Telegram-бот @${botInfo.username} успешно запущен!`);
    }
  }).catch((err) => {
    console.error('Ошибка запуска Telegram-бота:', err);
  });
}

// Function to send nudge to friend
export async function sendNudgeMessage(targetTelegramId: string, fromName: string, duelCode: string) {
  if (!bot) return false;
  try {
    const keyboard = new InlineKeyboard().webApp('🔥 Отметить статус прямо сейчас', `${webAppUrl}?duel=${duelCode}`);
    await bot.api.sendMessage(
      targetTelegramId,
      `🚨 **ЭЙ, СЛЫШЬ!**\n\nТвой кореш **${fromName}** уже зафиксировал свой статус на сегодня, а ты до сих пор тянешь резину!\n\nЗайди в апп и докажи, что ты Пахан 👑, а не Малой 🍼!`,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );
    return true;
  } catch (err) {
    console.error('Не удалось отправить пинок в Telegram:', err);
    return false;
  }
}
