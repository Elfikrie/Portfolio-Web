import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Create comments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        note_id INT NOT NULL,
        author VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
      )
    `);

    // Create contacts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    return NextResponse.json({ message: 'Tables comments & contacts created successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ message: 'Error creating tables', error: String(error) }, { status: 500 });
  }
}
