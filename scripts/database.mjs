import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
dotenv.config({ quiet: true });
export function databaseUrl() {
  if (process.env.DB_HOST) {
    const { DB_HOST, DB_PORT = '3306', DB_USER, DB_PASSWORD, DB_NAME } = process.env;
    if (!DB_USER || DB_PASSWORD === undefined || !DB_NAME) throw new Error('Set DB_USER, DB_PASSWORD and DB_NAME in .env');
    if (!/^\d+$/.test(DB_PORT) || +DB_PORT < 1 || +DB_PORT > 65535) throw new Error('Invalid DB_PORT');
    const host = DB_HOST.includes(':') && !DB_HOST.startsWith('[') ? `[${DB_HOST}]` : DB_HOST;
    process.env.DATABASE_URL = `mysql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${host}:${DB_PORT}/${encodeURIComponent(DB_NAME)}`;
  }
  if (!process.env.DATABASE_URL) throw new Error('Configure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME');
  return process.env.DATABASE_URL;
}
export function runPrisma(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['node_modules/prisma/build/index.js', ...args], { stdio: 'inherit', env: process.env });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Prisma exited with code ${code}`)));
  });
}
export async function deployDatabase() {
  const url = new URL(databaseUrl());
  const name = decodeURIComponent(url.pathname.slice(1));
  if (!/^[A-Za-z0-9_]{1,64}$/.test(name)) throw new Error('DB_NAME must contain 1-64 letters, numbers or underscores');
  let connection;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      connection = await mysql.createConnection({ host: url.hostname.replace(/^\[|\]$/g, ''), port: Number(url.port || 3306), user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), connectTimeout: 5000 });
      break;
    } catch (error) {
      if (!['ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'PROTOCOL_CONNECTION_LOST'].includes(error.code) || attempt === 29) throw error;
      console.log('Waiting for MySQL...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  try { await connection.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`); }
  finally { await connection.end(); }
  await runPrisma(['migrate', 'deploy']);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] === 'dev') { databaseUrl(); await runPrisma(['migrate', 'dev', ...process.argv.slice(3)]); }
    else await deployDatabase();
  } catch (error) { console.error(`Database setup failed: ${error.message}`); process.exitCode = 1; }
}
