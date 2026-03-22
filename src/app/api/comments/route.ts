import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get('noteId');

  if (!noteId) {
    return NextResponse.json({ message: 'noteId is required' }, { status: 400 });
  }

  try {
    const [rows]: any = await db.query(
      'SELECT * FROM comments WHERE note_id = ? ORDER BY created_at ASC',
      [noteId]
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ message: 'Error fetching comments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { noteId, author, content } = await request.json();

    if (!noteId || !author || !content) {
      return NextResponse.json({ message: 'noteId, author, dan content harus diisi.' }, { status: 400 });
    }

    const [result]: any = await db.query(
      'INSERT INTO comments (note_id, author, content) VALUES (?, ?, ?)',
      [noteId, author, content]
    );

    const [newComment]: any = await db.query('SELECT * FROM comments WHERE id = ?', [result.insertId]);

    return NextResponse.json(newComment[0], { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ message: 'Gagal mengirim komentar.' }, { status: 500 });
  }
}
