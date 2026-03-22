import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const start = Date.now();
    // Test connection with a simple query
    const [rows] = await db.query('SELECT 1 as connection_test');
    const end = Date.now();
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection successful!',
      latency: `${end - start}ms`,
      data: rows,
      config: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message,
      code: error.code,
      stack: error.stack,
      config: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
      }
    }, { status: 500 });
  }
}
