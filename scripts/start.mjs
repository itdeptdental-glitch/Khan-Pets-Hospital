import { spawn } from 'node:child_process';
import { deployDatabase } from './database.mjs';
try {
  await deployDatabase();
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', process.argv[2] === 'dev' ? 'dev' : 'start', ...process.argv.slice(3)], { stdio: 'inherit', env: process.env });
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
} catch (error) { console.error(`Startup aborted: ${error.message}`); process.exitCode = 1; }
