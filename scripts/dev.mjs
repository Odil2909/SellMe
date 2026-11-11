import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const portProbe = createServer();
const apiPort = await new Promise((resolvePort, reject) => {
  portProbe.once('error', reject);
  portProbe.listen(0, '127.0.0.1', () => {
    const { port } = portProbe.address();
    portProbe.close(error => error ? reject(error) : resolvePort(port));
  });
});
const children = [
  spawn(process.execPath, ['server/index.mjs'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PORT: String(apiPort) }
  }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}` }
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
