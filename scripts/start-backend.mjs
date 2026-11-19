import './load-env.mjs';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const jar = resolve(root, 'backend/target/uyol-api-1.0.0.jar');
if (!existsSync(jar)) {
  console.error('Java API не собран. Сначала выполни npm run build.');
  process.exit(1);
}

const java = process.env.JAVA_HOME
  ? join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java')
  : 'java';
const backendEnv = { ...process.env };
delete backendEnv.DEBUG;
const backend = spawn(java, ['-jar', jar], { cwd: root, stdio: 'inherit', env: backendEnv });

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => backend.kill(signal));
}
backend.on('error', error => {
  console.error(`Не удалось запустить Java API: ${error.message}`);
  process.exitCode = 1;
});
backend.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
