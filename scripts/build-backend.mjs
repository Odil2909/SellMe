import './load-env.mjs';
import { runMaven } from './maven.mjs';
try { await runMaven(['clean','package','-DskipTests']); }
catch(error) { console.error(error.message); process.exitCode=1; }
