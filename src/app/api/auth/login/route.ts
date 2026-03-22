import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import db from '@/lib/db';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const [rows]: any = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT via jose
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'super_secret_jwt_key_fikrie_2026_portfolio');
    
    const token = await new SignJWT({ userId: user.id, username: user.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secretKey);

    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
    
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    // On the first run without DB initialized, intercept and return explicit error message
    if ((error as any).code === 'ER_BAD_DB_ERROR' || (error as any).code === 'ECONNREFUSED' || (error as any).code === 'ER_NO_SUCH_TABLE') {
       return NextResponse.json({ message: 'Database connecting error. Did you import database.sql?' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
