"use server";

import db from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import { saveProjectRecord, deleteProjectRecord } from '@/lib/project-management';
import { saveSkillRecord, deleteSkillRecord } from '@/lib/skill-management';

// --- PROJECTS ---
export async function deleteProject(id: string) {
  await requireAdmin();
  return deleteProjectRecord(id);
}
export async function createProject(formData: FormData) {
  await requireAdmin();
  return saveProjectRecord(formData);
}
export async function updateProject(id: string, formData: FormData) {
  await requireAdmin();
  return saveProjectRecord(formData, id);
}

// --- NOTES ---
export async function deleteNote(id: string) {
  await requireAdmin();
  try {
    await db.query('DELETE FROM notes WHERE id = ?', [id]);
    revalidatePath('/admin/notes');
    revalidatePath('/notes');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal menghapus note.' };
  }
}
export async function createNote(formData: FormData) {
  await requireAdmin();
  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const tagsText = formData.get('tags') as string;
    const tags = tagsText ? tagsText.split(',').map(t => t.trim()) : [];

    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date().toLocaleDateString('en-US', dateOptions);

    await db.query('INSERT INTO notes (title, content, tags, date) VALUES (?, ?, ?, ?)',
      [title, content, JSON.stringify(tags), date]
    );
    revalidatePath('/admin/notes');
    revalidatePath('/notes');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal membuat note.' };
  }
}
export async function updateNote(id: string, formData: FormData) {
  await requireAdmin();
  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const tagsText = formData.get('tags') as string;
    const tags = tagsText ? tagsText.split(',').map(t => t.trim()) : [];

    await db.query('UPDATE notes SET title=?, content=?, tags=? WHERE id=?',
      [title, content, JSON.stringify(tags), id]
    );
    revalidatePath('/admin/notes');
    revalidatePath('/notes');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal mengupdate note.' };
  }
}

// --- SKILLS ---
export async function deleteSkill(id: string) {
  await requireAdmin();
  return deleteSkillRecord(id);
}
export async function createSkill(formData: FormData) {
  await requireAdmin();
  return saveSkillRecord(formData);
}
export async function updateSkill(id: string, formData: FormData) {
  await requireAdmin();
  return saveSkillRecord(formData, id);
}

// --- EXPERIENCE ---
export async function deleteExperience(id: string) {
  await requireAdmin();
  try {
    await db.query('DELETE FROM experiences WHERE id = ?', [id]);
    revalidatePath('/admin/experience');
    revalidatePath('/experience');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal menghapus experience.' };
  }
}
export async function createExperience(formData: FormData) {
  await requireAdmin();
  try {
    const role = formData.get('role') as string;
    const company = formData.get('company') as string;
    const duration = formData.get('duration') as string;
    const description = formData.get('description') as string;

    await db.query('INSERT INTO experiences (role, company, duration, description) VALUES (?, ?, ?, ?)',
      [role, company, duration, description]
    );
    revalidatePath('/admin/experience');
    revalidatePath('/experience');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal membuat experience.' };
  }
}
export async function updateExperience(id: string, formData: FormData) {
  await requireAdmin();
  try {
    const role = formData.get('role') as string;
    const company = formData.get('company') as string;
    const duration = formData.get('duration') as string;
    const description = formData.get('description') as string;

    await db.query('UPDATE experiences SET role=?, company=?, duration=?, description=? WHERE id=?',
      [role, company, duration, description, id]
    );
    revalidatePath('/admin/experience');
    revalidatePath('/experience');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal mengupdate experience.' };
  }
}

// --- ORGANIZATION ---
export async function deleteOrganization(id: string) {
  await requireAdmin();
  try {
    await db.query('DELETE FROM organizations WHERE id = ?', [id]);
    revalidatePath('/admin/organization');
    revalidatePath('/experience');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal menghapus organization.' };
  }
}
export async function createOrganization(formData: FormData) {
  await requireAdmin();
  try {
    const role = formData.get('role') as string;
    const name = formData.get('name') as string;
    const duration = formData.get('duration') as string;
    const description = formData.get('description') as string;

    await db.query('INSERT INTO organizations (role, name, duration, description) VALUES (?, ?, ?, ?)',
      [role, name, duration, description]
    );
    revalidatePath('/admin/organization');
    revalidatePath('/experience');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal membuat organization.' };
  }
}
export async function updateOrganization(id: string, formData: FormData) {
  await requireAdmin();
  try {
    const role = formData.get('role') as string;
    const name = formData.get('name') as string;
    const duration = formData.get('duration') as string;
    const description = formData.get('description') as string;

    await db.query('UPDATE organizations SET role=?, name=?, duration=?, description=? WHERE id=?',
      [role, name, duration, description, id]
    );
    revalidatePath('/admin/organization');
    revalidatePath('/experience');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal mengupdate organization.' };
  }
}
