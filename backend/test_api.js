import { spawn } from 'child_process';
import http from 'http';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3001,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
        }
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseBody });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Запуск сервера для тестирования...');
  const serverProcess = spawn('node', ['dist/server.js'], {
    cwd: '/Users/Berserk/.gemini/antigravity/scratch/pakhan-app/backend',
    env: { ...process.env, PORT: '3001' }
  });

  serverProcess.stdout.on('data', (d) => console.log('[Server]', d.toString().trim()));
  serverProcess.stderr.on('data', (d) => console.error('[Server Error]', d.toString().trim()));

  // Wait 1.5s for server to start
  await new Promise((r) => setTimeout(r, 1500));

  try {
    // 1. Health check
    console.log('\n--- 1. Проверка /api/health ---');
    const health = await makeRequest('GET', '/api/health');
    console.log('Health status:', health.status, health.data);
    if (health.status !== 200 || health.data.status !== 'ok') {
      throw new Error('Health check failed');
    }

    // 2. Init User 1
    console.log('\n--- 2. Инициализация Первого Пахана ---');
    const init1 = await makeRequest('POST', '/api/duels/init', {
      telegramUser: { id: 1001, username: 'sanya_chief', first_name: 'Саня' }
    });
    console.log('User 1 duel code:', init1.data.duel.code);
    const duelCode = init1.data.duel.code;

    // 3. Connect User 2 via duel code
    console.log('\n--- 3. Подключение Второго Пахана по ссылке ---');
    const init2 = await makeRequest('POST', '/api/duels/init', {
      telegramUser: { id: 1002, username: 'vlad_bro', first_name: 'Влад' },
      duelCode
    });
    console.log('User 2 joined:', init2.data.user2.first_name);

    function formatLocalDate(d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    // 4. Mark today: User 1 = PAKHAN, User 2 = MALOY
    const today = formatLocalDate(new Date());
    console.log(`\n--- 4. Отметка статусов на сегодня (${today}) ---`);
    await makeRequest('POST', `/api/duels/${duelCode}/status`, {
      telegramId: '1001',
      date: today,
      status: 'PAKHAN'
    });
    const dayResult = await makeRequest('POST', `/api/duels/${duelCode}/status`, {
      telegramId: '1002',
      date: today,
      status: 'MALOY'
    });
    console.log('Результат сегодняшнего дня:', dayResult.data.record);

    // 5. Mark another day this week (e.g. tomorrow or +1 day)
    const nextDay = formatLocalDate(new Date(Date.now() + 86400000));
    console.log(`\n--- 5. Отметка статусов на следующий день (${nextDay}) ---`);
    await makeRequest('POST', `/api/duels/${duelCode}/status`, {
      telegramId: '1001',
      date: nextDay,
      status: 'PAKHAN'
    });
    await makeRequest('POST', `/api/duels/${duelCode}/status`, {
      telegramId: '1002',
      date: nextDay,
      status: 'PAKHAN'
    });

    // 6. Fetch stats
    console.log('\n--- 6. Проверка статистики и подсчета Пахана недели ---');
    const duelData = await makeRequest('GET', `/api/duels/${duelCode}`);
    console.log('Статистика недели:', duelData.data.stats.week);
    console.log('Пахан недели:', duelData.data.stats.week.winner_name);

    if (duelData.data.stats.week.user1_pakhan_count !== 2) {
      throw new Error(`Expected User 1 to have 2 pakhan days, got ${duelData.data.stats.week.user1_pakhan_count}`);
    }
    if (duelData.data.stats.week.user2_pakhan_count !== 1) {
      throw new Error(`Expected User 2 to have 1 pakhan day, got ${duelData.data.stats.week.user2_pakhan_count}`);
    }
    if (duelData.data.stats.week.winner !== 'user1') {
      throw new Error(`Expected User 1 to be the week winner, got ${duelData.data.stats.week.winner}`);
    }

    console.log('\n✅ ВСЕ ТЕСТЫ УСПЕШНО ПРОЙДЕНЫ!');
  } finally {
    serverProcess.kill();
  }
}

runTests().catch((e) => {
  console.error('❌ Ошибка теста:', e);
  process.exit(1);
});
