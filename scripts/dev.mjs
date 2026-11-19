import './load-env.mjs';
import { spawn } from 'node:child_process';
import { delimiter, join, resolve } from 'node:path';
import { createConnection } from 'node:net';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dockerBinDirectory = '/Applications/Docker.app/Contents/Resources/bin';
const userDockerBinDirectory = join(process.env.HOME || '', '.docker', 'bin');
process.env.PATH = [userDockerBinDirectory, dockerBinDirectory, process.env.PATH || ''].filter(Boolean).join(delimiter);
const dockerCommand = join(dockerBinDirectory, 'docker');
const databaseUrl = process.env.DATABASE_URL || '';
const usesDockerPostgres = !databaseUrl || /:5433(?:\/|\?|$)/.test(databaseUrl);
console.log('Запускаю сайт uy-ol и Java API...');
if (usesDockerPostgres) {
  console.log('Проверяю локальный PostgreSQL в Docker...');
  await new Promise(resolveCompose => {
    const compose = spawn(dockerCommand, ['compose', 'up', '-d', 'postgres'], { cwd: root, stdio: 'ignore', env: process.env });
    compose.once('error', () => { console.error('Не удалось запустить PostgreSQL. Проверь, что Docker Desktop открыт.'); resolveCompose(); });
    compose.once('exit', code => {
      if (code === 0) console.log('PostgreSQL запущен.');
      else console.error('Не удалось запустить PostgreSQL. Проверь Docker Desktop и повтори npm run dev.');
      resolveCompose();
    });
  });
} else console.log('Использую PostgreSQL из DATABASE_URL.');
console.log('Сайт: http://127.0.0.1:5100');
console.log(`Java API: http://127.0.0.1:${process.env.PORT || '4178'}`);
const apiPort = Number(process.env.PORT || '4178');
const children = [];
let shuttingDown = false;

function stop(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  children.forEach(child => {
    if (child.exitCode === null && !child.killed) child.kill('SIGTERM');
  });
  process.exitCode = exitCode;
}

function monitor(child, index) {
  child.on('error', error => {
    console.error(index === 1 ? `Не удалось запустить сайт: ${error.message}` : `Не удалось запустить Java API: ${error.message}`);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    if (index === 1) {
      if (code || signal) console.error('Сайт остановился. Проверь, не занят ли порт 5100.');
      stop(code || (signal ? 1 : 0));
    } else if (code || signal) console.error('Java API остановился. Проверь подключение к PostgreSQL и настройки файла .env.');
  });
}

function delay(ms) {
  return new Promise(resolveDelay => setTimeout(resolveDelay, ms));
}

async function waitForApi(child, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (!shuttingDown && child.exitCode === null && Date.now() < deadline) {
    const listening = await new Promise(resolveListening => {
      const socket = createConnection({ host: '127.0.0.1', port: apiPort });
      socket.once('connect', () => { socket.destroy(); resolveListening(true); });
      socket.once('error', () => resolveListening(false));
    });
    if (listening) return true;
    await delay(250);
  }
  return false;
}

process.on('SIGINT', () => { console.log('\nОстанавливаю сайт и Java API...'); stop(0); });
process.on('SIGTERM', () => stop(0));

const backend = spawn(process.execPath, ['scripts/run-backend.mjs'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, PORT: String(apiPort) }
});
children.push(backend);
monitor(backend, 0);

if (await waitForApi(backend)) console.log('Java API готов. Запускаю сайт...');
else if (!shuttingDown) console.warn('Java API пока не отвечает; сайт запустится, но данные каталога могут быть недоступны.');

if (!shuttingDown) {
  const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--logLevel', 'warn'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}` }
  });
  children.push(vite);
  monitor(vite, 1);
}
