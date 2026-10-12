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
      `💪 **Правила простые:**\n` +
      `• Каждый день отмечаешь свой статус: Пахан (сделал всё чётко) или Малой (обленился).\n` +
      `• Кореш делает то же самое.\n` +
      `• В конце недели, месяца и года смотрим, кто настоящий Пахан района, а кто застрял в Малых!`;

    const keyboard = new InlineKeyboard().webApp(
      '🔥 Открыть битву Паханов',
      `${webAppUrl}?duel=pakhan_main`
    );

    await ctx.reply(replyText, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  });

  // Test notify command for manual verification
  bot.command('test_notify', async (ctx) => {
    const keyboard = new InlineKeyboard().webApp('💪 Отметить статус', `${webAppUrl}?duel=pakhan_main`);
    await ctx.reply('кабанчиком отчитались и спать', {
      reply_markup: keyboard
    });
  });

  // Daily reminder cron at 23:00 (every day) in Europe/Moscow timezone
  cron.schedule(
    '0 23 * * *',
    async () => {
      try {
        console.log('⏰ Запуск ежедневного напоминания в 23:00 (МСК)...');
        const targetIds = new Set<string>(['756260518', '739647994']);
        const dbUsers = db.prepare(`SELECT telegram_id FROM users WHERE telegram_id NOT LIKE 'demo_%'`).all() as any[];
        for (const u of dbUsers) {
          if (u.telegram_id) targetIds.add(String(u.telegram_id));
        }

        const keyboard = new InlineKeyboard().webApp('💪 Отметить статус', `${webAppUrl}?duel=pakhan_main`);

        for (const tgId of targetIds) {
          try {
            await bot.api.sendMessage(
              tgId,
              'кабанчиком отчитались и спать',
              {
                reply_markup: keyboard
              }
            );
            console.log(`✅ Напоминание в 23:00 отправлено ${tgId}`);
          } catch (e: any) {
            console.warn(`⚠️ Не удалось отправить напоминание ${tgId}:`, e?.message);
          }
        }
      } catch (err) {
        console.error('Ошибка отправки напоминаний в 23:00:', err);
      }
    },
    {
      timezone: 'Europe/Moscow'
    }
  );

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
      `🚨 **ЭЙ, СЛЫШЬ!**\n\nТвой кореш **${fromName}** уже зафиксировал свой статус на сегодня, а ты до сих пор тянешь резину!\n\nЗайди в апп и докажи, что ты Пахан 💪, а не Малой 🍼!`,
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
