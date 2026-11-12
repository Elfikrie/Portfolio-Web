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
    const [before] = await connection.query('SELECT COUNT(*) AS total FROM skills');
    const [existing] = await connection.query("SHOW COLUMNS FROM skills LIKE 'image_key'");
    if (!existing.length) await connection.query(fs.readFileSync(path.join(__dirname, '../migrations/002_skill_images.sql'), 'utf8'));
    const [columns] = await connection.query("SHOW COLUMNS FROM skills LIKE 'image_key'");
    const [after] = await connection.query('SELECT COUNT(*) AS total FROM skills');
    if (columns[0]?.Type !== 'varchar(80)' || columns[0]?.Null !== 'YES') throw new Error('Unexpected image column definition');
    console.log(JSON.stringify({ table: 'skills', column: 'image_key', added: !existing.length, rowsBefore: before[0].total, rowsAfter: after[0].total }));
  } finally { await connection.end(); }
})().catch(error => { console.error('Skill image migration failed:', error.code || 'unexpected schema'); process.exitCode = 1; });
