import { databaseUrl } from './database.mjs'
// Apply only the additive inventory migration; existing source records stay intact.
import fs from 'node:fs'
import mysql from 'mysql2/promise'
async function main() {
 const url = databaseUrl()
 const db = await mysql.createConnection(url)
 try {
  const sql=fs.readFileSync('prisma/migrations/202610210001_inventory/migration.sql','utf8')
  for(const statement of sql.split(';').map(value=>value.trim()).filter(Boolean)) await db.query(statement)
  const [rows] = await db.query('SELECT category, COUNT(*) AS items FROM InventoryItem GROUP BY category')
  console.log('Inventory migration applied:',rows)
 } finally {await db.end()}
}
main().catch(error=>{console.error(error.message);process.exitCode=1})

