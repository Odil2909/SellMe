import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const children = [
  spawn(process.execPath, ['server/index.mjs'], { cwd: root, stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], { cwd: root, stdio: 'inherit' })
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

children.forEach(child => {
  child.on('error', error => {
    console.error(error);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (!shuttingDown) stop(code || (signal ? 1 : 0));
  });
});

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
