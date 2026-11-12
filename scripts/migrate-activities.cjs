const mysql = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    if (!process.env[key]) throw new Error('Required database configuration is missing');
  }
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }, connectTimeout: 15000,
  });
  try {
    await connection.query(fs.readFileSync(path.join(__dirname, '../migrations/001_activities.sql'), 'utf8'));
    const [columns] = await connection.query('SHOW COLUMNS FROM activities');
    console.log(JSON.stringify({ table: 'activities', columns: columns.map(c => c.Field), migration: 'complete' }));
  } finally { await connection.end(); }
})().catch(error => { console.error('Activity migration failed:', error.code || 'unknown'); process.exitCode = 1; });
