const mysql = require('mysql2/promise')

async function clearDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'khan_pets_hospital',
  })

  try {
    const tables = await connection.execute('SHOW TABLES')
    const tableNames = tables[0].map(row => Object.values(row)[0])
    
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0')
    
    for (const table of tableNames) {
      await connection.execute(`TRUNCATE TABLE ${table}`)
      console.log(`✓ Cleared table: ${table}`)
    }
    
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1')
    console.log('✅ All tables cleared!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await connection.end()
  }
}

clearDatabase()
