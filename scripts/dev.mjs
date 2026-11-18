import './load-env.mjs';
import { spawn } from 'node:child_process';
import { delimiter, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dockerBinDirectory = '/Applications/Docker.app/Contents/Resources/bin';
const userDockerBinDirectory = join(process.env.HOME || '', '.docker', 'bin');
process.env.PATH = [userDockerBinDirectory, dockerBinDirectory, process.env.PATH || ''].filter(Boolean).join(delimiter);
const dockerCommand = join(dockerBinDirectory, 'docker');
const databaseUrl = process.env.DATABASE_URL || '';
const usesDockerPostgres = !databaseUrl || /:5433(?:\/|\?|$)/.test(databaseUrl);
if (usesDockerPostgres) {
  await new Promise(resolveCompose => {
    const compose = spawn(dockerCommand, ['compose', 'up', '-d', 'postgres'], { cwd: root, stdio: 'inherit', env: process.env });
    compose.once('error', error => { console.error(`PostgreSQL не запущен: ${error.message}`); resolveCompose(); });
    compose.once('exit', code => {
      if (code !== 0) console.error('PostgreSQL не запущен. Открой Docker Desktop и повтори npm run dev.');
      resolveCompose();
    });
  });
} else console.log('Using PostgreSQL from DATABASE_URL; Docker PostgreSQL is skipped.');
const children = [
  spawn(process.execPath, ['scripts/run-backend.mjs'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PORT: process.env.PORT || '4178' }
  }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, VITE_API_PROXY_TARGET: `http://127.0.0.1:${process.env.PORT || '4178'}` }
  })
];
let shuttingDown = false;

function stop(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  children.forEach(child => {
    if (child.exitCode === null && !child.killed) child.kill('SIGTERM');
  });
  process.exitCode = exitCode;
}

children.forEach((child, index) => {
  child.on('error', error => {
    console.error(error);
    if (index === 1) stop(1);
  });
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    if (index === 1) stop(code || (signal ? 1 : 0));
    else if (code || signal) console.error('Java API stopped; the frontend remains available, but account and listing API calls need PostgreSQL.');
  });
});

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
