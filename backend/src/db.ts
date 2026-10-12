import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

const defaultDbPath = path.join(__dirname, '..', 'pakhan.db');
const dbPath = process.env.DB_PATH || (process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'pakhan.db') : defaultDbPath);

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE NOT NULL,
      username TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT,
      photo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS duels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      title TEXT DEFAULT 'Дуэль Паханов',
      user1_id INTEGER NOT NULL REFERENCES users(id),
      user2_id INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      duel_id INTEGER NOT NULL REFERENCES duels(id),
      date TEXT NOT NULL, -- YYYY-MM-DD
      user1_status TEXT NOT NULL DEFAULT 'NONE', -- 'PAKHAN' | 'MALOY' | 'NONE'
      user2_status TEXT NOT NULL DEFAULT 'NONE', -- 'PAKHAN' | 'MALOY' | 'NONE'
      note TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(duel_id, date)
    );
  `);

  console.log('Database initialized successfully at', dbPath);
}
