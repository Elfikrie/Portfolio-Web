import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { dummyProjects, dummyNotes, hardSkills, softSkills, dummyExperiences, dummyOrganizations } from '@/lib/dummyData';

export async function GET() {
  try {
    // 1. Seed Projects
    for (const project of dummyProjects) {
      await db.query(
        'INSERT INTO projects (title, description, demoUrl, imageUrl, tags) VALUES (?, ?, ?, ?, ?)',
        [project.title, project.description, project.demoUrl, project.imageUrl, JSON.stringify(project.tags)]
      );
    }

    // 2. Seed Notes
    for (const note of dummyNotes) {
      await db.query(
        'INSERT INTO notes (title, content, tags, date) VALUES (?, ?, ?, ?)',
        [note.title, note.content, JSON.stringify(note.tags), note.date]
      );
    }

    // 3. Seed Skills
    for (const skill of hardSkills) {
      await db.query('INSERT INTO skills (name, level, type) VALUES (?, ?, ?)', [skill.name, skill.level, 'hard']);
    }
    for (const skill of softSkills) {
      await db.query('INSERT INTO skills (name, level, type) VALUES (?, ?, ?)', [skill.name, skill.level, 'soft']);
    }

    // 4. Seed Experiences
    for (const exp of dummyExperiences) {
      await db.query(
        'INSERT INTO experiences (role, company, duration, description) VALUES (?, ?, ?, ?)',
        [exp.role, exp.company, exp.duration, exp.description]
      );
    }

    // 5. Seed Organizations
    for (const org of dummyOrganizations) {
      await db.query(
        'INSERT INTO organizations (role, name, duration, description) VALUES (?, ?, ?, ?)',
        [org.role, org.name, org.duration, org.description]
      );
    }

    return NextResponse.json({ message: 'Database successfully seeded with dummy data!' }, { status: 200 });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ message: 'Error seeding database', error: String(error) }, { status: 500 });
  }
}
