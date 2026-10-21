import { spawn } from 'node:child_process';
import { databaseUrl } from './database.mjs';
databaseUrl();
const child = spawn(process.execPath, ['node_modules/ts-node/dist/bin.js', '--compiler-options', '{"module":"CommonJS"}', 'prisma/seed.ts'], { stdio: 'inherit', env: process.env });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
