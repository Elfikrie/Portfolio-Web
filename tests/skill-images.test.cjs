const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const sharp = require('sharp');

let row, blobs, writes, authorized, failWrite, conflict, sharedKey, png;
const db = { async query(sql, values) {
  if (sql.startsWith('SELECT id, image_key')) return [row ? [{ ...row }] : []];
  if (sql.startsWith('SELECT id FROM')) return [(row?.image_key === values[0] || sharedKey === values[0]) ? [{ id: 1 }] : []];
  if (failWrite) throw new Error('Database unavailable');
  if (sql.startsWith('INSERT')) {
    writes++; row = { id: 1, name: values[0], level: values[1], type: values[2], image_key: values[3] };
    return [{ affectedRows: 1, insertId: 1 }];
  }
  if (!row || conflict || values.at(-1) !== row.image_key) return [{ affectedRows: 0 }];
  writes++;
  if (sql.startsWith('UPDATE')) row = { ...row, name: values[0], level: values[1], type: values[2], image_key: values[3] };
  if (sql.startsWith('DELETE')) row = null;
  return [{ affectedRows: 1 }];
} };
function modules() {
  const cache = new Map(), root = path.resolve(__dirname, '..');
  function load(file) {
    const full = path.resolve(root, file);
    if (cache.has(full)) return cache.get(full).exports;
    const mod = { exports: {} }; cache.set(full, mod);
    const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    const resolve = name => {
      if (name === '@/lib/db') return db;
      if (name === '@/lib/admin-auth') return { requireAdmin: async () => { if (!authorized) throw new Error('Unauthorized'); return { id: 1 }; } };
      if (name === 'next/cache') return { revalidatePath() {} };
      if (name === '@netlify/blobs') return { getStore: () => ({
        async set(key, data) { blobs.set(key, data); return { modified: true }; },
        async get(key) { return blobs.get(key) || null; },
        async delete(key) { blobs.delete(key); },
      }) };
      if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
      return require(name);
    };
    new Function('require', 'module', 'exports', code)(resolve, mod, mod.exports);
    return mod.exports;
  }
  return { ...load('src/app/actions/admin.ts'), image: load('src/app/api/skill-images/[key]/route.ts').GET };
}
function form(photo = true) {
  const f = new FormData();
  Object.entries({ name: 'Skill example', level: '75', type: 'hard' }).forEach(([k, v]) => f.set(k, v));
  if (photo) f.set('skillImage', new File([png], 'logo.png', { type: 'image/png' }));
  return f;
}
function image(m, key) { return m.image(new Request('https://portfolio.test/api/skill-images/' + key), { params: Promise.resolve({ key }) }); }
test.beforeEach(async () => {
  row = null; blobs = new Map(); writes = 0; authorized = true; failWrite = false; conflict = false; sharedKey = null;
  process.env.CONTEXT = 'production';
  png = await sharp({ create: { width: 800, height: 400, channels: 4, background: { r: 250, g: 128, b: 114, alpha: 0.5 } } }).png().toBuffer();
});

test('skill mutations require authentication and reject writes from deploy previews', async () => {
  const m = modules(); authorized = false;
  await assert.rejects(m.createSkill(form()), /Unauthorized/);
  await assert.rejects(m.updateSkill('1', form()), /Unauthorized/);
  await assert.rejects(m.deleteSkill('1'), /Unauthorized/);
  authorized = true; process.env.CONTEXT = 'deploy-preview';
  assert.equal((await m.createSkill(form())).success, false);
  assert.equal((await m.updateSkill('1', form())).success, false);
  assert.equal((await m.deleteSkill('1')).success, false);
  assert.equal(writes, 0); assert.equal(blobs.size, 0);
});

test('logos preserve transparency and aspect ratio; create, retain, replace, remove and delete work', async () => {
  const m = modules(); assert.equal((await m.createSkill(form())).success, true);
  const first = row.image_key;
  const response = await image(m, first);
  assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), 'image/webp');
  const data = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(data).metadata();
  assert.equal(metadata.width, 512); assert.equal(metadata.height, 256); assert.equal(metadata.hasAlpha, true); assert.equal(metadata.exif, undefined);
  assert.equal((await sharp(data).stats()).isOpaque, false);
  assert.equal((await m.updateSkill('1', form(false))).success, true); assert.equal(row.image_key, first);
  assert.equal((await m.updateSkill('1', form())).success, true); assert.notEqual(row.image_key, first); assert.equal(blobs.size, 1);
  assert.equal((await image(m, first)).status, 404);
  const remove = form(false); remove.set('removeImage', 'on');
  assert.equal((await m.updateSkill('1', remove)).success, true); assert.equal(row.image_key, null); assert.equal(blobs.size, 0);
  await m.updateSkill('1', form()); const last = row.image_key;
  assert.equal((await m.deleteSkill('1')).success, true); assert.equal(row, null); assert.equal(blobs.size, 0);
  assert.equal((await image(m, last)).status, 404);
});

test('optional logo keeps existing skills compatible and ignores posted blob keys', async () => {
  const m = modules(); const f = form(false);
  f.set('skillImage', new File([], '', { type: 'application/octet-stream' })); f.set('image_key', 'unauthorized-file.webp');
  assert.equal((await m.createSkill(f)).success, true); assert.equal(row.image_key, null); assert.equal(blobs.size, 0);
  assert.equal((await m.updateSkill('1', f)).success, true); assert.equal(row.image_key, null);
});

test('invalid skill fields, malformed images and oversized uploads never write data', async () => {
  const m = modules();
  for (const [key, value] of [['name', ''], ['name', 'a'.repeat(101)], ['level', '0'], ['level', '101'], ['level', '75.5'], ['type', 'other']]) {
    const f = form(); f.set(key, value); assert.equal((await m.createSkill(f)).success, false);
  }
  for (const file of [new File(['<svg/>'], 'fake.png', { type: 'image/png' }), new File([new Uint8Array(3 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' })]) {
    const f = form(); f.set('skillImage', file); assert.equal((await m.createSkill(f)).success, false);
  }
  const contradictory = form(); contradictory.set('removeImage', 'on'); assert.equal((await m.createSkill(contradictory)).success, false);
  assert.equal(writes, 0); assert.equal(blobs.size, 0);
});

test('database failures and concurrent edits clean new images while preserving existing logos', async () => {
  const m = modules(); failWrite = true;
  assert.equal((await m.createSkill(form())).success, false); assert.equal(blobs.size, 0);
  failWrite = false; await m.createSkill(form()); const original = row.image_key;
  conflict = true;
  assert.equal((await m.updateSkill('1', form())).success, false); assert.equal(row.image_key, original); assert.equal(blobs.size, 1);
  assert.equal((await m.deleteSkill('1')).success, false); assert.equal(blobs.size, 1);
});

test('shared images remain available, and arbitrary or unattached keys cannot be read', async () => {
  const m = modules(); await m.createSkill(form()); sharedKey = row.image_key;
  assert.equal((await m.deleteSkill('1')).success, true); assert.equal(blobs.size, 1);
  assert.equal((await image(m, sharedKey)).status, 200);
  sharedKey = null;
  assert.equal((await image(m, 'invalid-key')).status, 404);
  assert.equal((await image(m, [...blobs.keys()][0])).status, 404);
});
