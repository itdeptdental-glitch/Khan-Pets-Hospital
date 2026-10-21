const mysql = require('mysql2/promise')

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
  })

  try {
    await connection.execute('DROP DATABASE IF EXISTS khan_pets_hospital')
    console.log('✓ Dropped old database')
    
    await connection.execute('CREATE DATABASE khan_pets_hospital')
    console.log('✓ Created new database: khan_pets_hospital')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await connection.end()
  }
}

createDatabase()
