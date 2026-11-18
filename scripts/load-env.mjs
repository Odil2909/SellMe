import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const envFile = resolve(projectRoot, '.env');

if (existsSync(envFile)) process.loadEnvFile(envFile);
