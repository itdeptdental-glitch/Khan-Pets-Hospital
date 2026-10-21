import { databaseUrl } from './database.mjs'
import fs from 'node:fs'
import mysql from 'mysql2/promise'
 const url = databaseUrl()
const db=await mysql.createConnection(url)
try {
 const sql=fs.readFileSync('prisma/migrations/202610210002_procedures/migration.sql','utf8')
 for(const statement of sql.split(';').map(value=>value.trim()).filter(Boolean)) await db.query(statement)
 const [rows]=await db.query('SELECT category,COUNT(*) AS procedures FROM PetProcedure GROUP BY category')
 console.log('Procedures migration applied:',rows)
} finally {await db.end()}
