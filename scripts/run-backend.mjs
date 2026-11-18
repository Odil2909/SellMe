import './load-env.mjs';
import { runMaven } from './maven.mjs';
try { await runMaven(['spring-boot:run']); }
catch(error) { console.error(error.message); process.exitCode=1; }
