const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function test() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await connection.query('SELECT * FROM projects LIMIT 1');
  console.log("PROJECT BEFORE:", rows[0]);
  
  if (rows.length > 0) {
    const id = rows[0].id;
    await connection.query('UPDATE projects SET demoUrl=?, imageUrl=? WHERE id=?', 
      ["http://testdemo.com", "http://testimg.com", id]
    );
    const [rows2] = await connection.query('SELECT * FROM projects WHERE id=?', [id]);
    console.log("PROJECT AFTER:", rows2[0]);
  }
  
  process.exit(0);
}
test().catch(console.error);
