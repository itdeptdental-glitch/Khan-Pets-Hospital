import { spawn } from 'node:child_process';
import mysql from 'mysql2/promise';
import { databaseUrl, deployDatabase } from './database.mjs';

// Use a disposable database so checks never change the configured hospital data.
const original = new URL(databaseUrl());
const name = `patient_demo_check_${Date.now()}`;
const port = '3107';
process.env.DB_NAME = name;
process.env.NEXTAUTH_URL = `http://localhost:${port}`;
process.env.NEXTAUTH_SECRET = 'temporary-patient-demo-verification-secret';
process.env.TEST_BASE_URL = process.env.NEXTAUTH_URL;
process.env.TEST_EMAIL = 'admin@hospital.com';
process.env.TEST_PASSWORD = 'admin123';
let server;
const execute = args => new Promise((resolve,reject) => {
 const child=spawn(process.execPath,args,{stdio:'inherit',env:process.env});
 child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`Check process failed: ${code}`)));
});
let db;
try {
 db = await mysql.createConnection({host:original.hostname,port:Number(original.port||3306),user:decodeURIComponent(original.username),password:decodeURIComponent(original.password),connectTimeout:5000});
 await deployDatabase();
 await execute(['scripts/seed.mjs']);
 await execute(['scripts/seed.mjs']);
 const [counts]=await db.query(`SELECT COUNT(*) AS count FROM \`${name}\`.Pet`);
 if(counts[0].count!==10) throw new Error('Demo seed duplicated patients');
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',port],{stdio:'inherit',env:process.env});
 server.on('error',error=>console.error(error.message));
 let ready=false;
 for(let attempt=0;attempt<40;attempt++){
  try { const response=await fetch(process.env.TEST_BASE_URL+'/api/auth/csrf');if(response.ok){ready=true;break} }catch{}
  await new Promise(resolve=>setTimeout(resolve,500));
 }
 if(!ready)throw new Error('Test server did not become ready');
 await execute(['scripts/verify-patient-owners.mjs']);
 console.log('Patient demo integration checks passed on a disposable database.');
} catch(error) { console.error(error);process.exitCode=1; }
finally {
 if(server&&server.exitCode===null){await new Promise(resolve=>{server.once('exit',resolve);server.kill();});}
 if(db){await db.query(`DROP DATABASE IF EXISTS \`${name}\``);await db.end();console.log('Disposable database removed.');}
}
