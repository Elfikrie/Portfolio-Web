const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const sharp = require('sharp');

let row, blobs, writes, authorized, failWrite, conflict, sharedCover, png;
const db = { async query(sql, values) {
  if (sql.startsWith('SELECT id, imageUrl')) return [row ? [{ ...row }] : []];
  if (sql.startsWith('SELECT id FROM')) return [(row?.imageUrl === values[0] || sharedCover === values[0]) ? [{ id: 1 }] : []];
  if (failWrite) throw new Error('Database unavailable');
  if (sql.startsWith('INSERT')) {
    writes++; row = { id: 1, title: values[0], description: values[1], demoUrl: values[2], imageUrl: values[3], tags: values[4] };
    return [{ affectedRows: 1, insertId: 1 }];
  }
  if (!row || conflict || values.at(-1) !== row.imageUrl) return [{ affectedRows: 0 }];
  writes++;
  if (sql.startsWith('UPDATE')) row = { ...row, title: values[0], description: values[1], demoUrl: values[2], imageUrl: values[3], tags: values[4] };
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
  return { ...load('src/app/actions/admin.ts'), image: load('src/app/api/project-images/[key]/route.ts').GET };
}
function form(photo = true) {
  const f = new FormData();
  Object.entries({ title: 'Sample project', description: 'A test description.', demoUrl: 'https://example.com', tags: 'Next.js, React', imageUrl: 'https://untrusted.test/ignored.jpg' }).forEach(([k, v]) => f.set(k, v));
  if (photo) f.set('coverPhoto', new File([png], 'cover.png', { type: 'image/png' }));
  return f;
}
function image(m, url) { return m.image(new Request('https://portfolio.test' + url), { params: Promise.resolve({ key: url.split('/').at(-1) }) }); }
test.beforeEach(async () => {
  row = null; blobs = new Map(); writes = 0; authorized = true; failWrite = false; conflict = false; sharedCover = null;
  process.env.CONTEXT = 'production';
  png = await sharp({ create: { width: 120, height: 80, channels: 3, background: '#fa8072' } }).png().toBuffer();
});

test('project mutations require authentication and cannot modify production from previews', async () => {
  const m = modules(); authorized = false;
  await assert.rejects(m.createProject(form()), /Unauthorized/);
  await assert.rejects(m.updateProject('1', form()), /Unauthorized/);
  await assert.rejects(m.deleteProject('1'), /Unauthorized/);
  authorized = true; process.env.CONTEXT = 'deploy-preview';
  assert.equal((await m.createProject(form())).success, false);
  assert.equal((await m.updateProject('1', form())).success, false);
  assert.equal((await m.deleteProject('1')).success, false);
  assert.equal(writes, 0); assert.equal(blobs.size, 0);
});

test('create, serve, retain, replace and delete an uploaded cover', async () => {
  const m = modules();
  assert.equal((await m.createProject(form())).success, true);
  const first = row.imageUrl;
  assert.match(first, /^\/api\/project-images\/[a-f0-9-]+\.jpg$/);
  const response = await image(m, first);
  assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), 'image/jpeg');
  assert.equal((await sharp(Buffer.from(await response.arrayBuffer())).metadata()).format, 'jpeg');
  assert.equal((await m.updateProject('1', form(false))).success, true);
  assert.equal(row.imageUrl, first); assert.equal(blobs.size, 1);
  assert.equal((await m.updateProject('1', form())).success, true);
  assert.notEqual(row.imageUrl, first); assert.equal(blobs.size, 1);
  assert.equal((await image(m, first)).status, 404);
  const second = row.imageUrl;
  assert.equal((await m.deleteProject('1')).success, true);
  assert.equal(row, null); assert.equal(blobs.size, 0);
  assert.equal((await image(m, second)).status, 404);
});

test('editing without a photo keeps the legacy cover and ignores posted URLs', async () => {
  const m = modules(); row = { id: 1, imageUrl: 'https://existing.example/cover.png' };
  const f = form(false); f.set('coverPhoto', new File([], '', { type: 'application/octet-stream' }));
  assert.equal((await m.updateProject('1', f)).success, true);
  assert.equal(row.imageUrl, 'https://existing.example/cover.png'); assert.equal(blobs.size, 0);
  assert.equal((await m.updateProject('1', form())).success, true); assert.equal(blobs.size, 1);
  row = null;
  assert.equal((await m.createProject(form(false))).success, true); assert.equal(row.imageUrl, null);
});

test('corrupt, oversized and non-image uploads fail before any write', async () => {
  const m = modules();
  for (const file of [new File(['<svg/>'], 'fake.jpg', { type: 'image/jpeg' }), new File([new Uint8Array(3 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }), new File(['text'], 'data.txt', { type: 'text/plain' })]) {
    const f = form(); f.set('coverPhoto', file);
    assert.equal((await m.createProject(f)).success, false);
  }
  assert.equal(writes, 0); assert.equal(blobs.size, 0);
});

test('failed and conflicting database writes clean the new upload but preserve the old cover', async () => {
  const m = modules(); failWrite = true;
  assert.equal((await m.createProject(form())).success, false); assert.equal(blobs.size, 0);
  failWrite = false; await m.createProject(form()); const original = row.imageUrl;
  conflict = true;
  assert.equal((await m.updateProject('1', form())).success, false);
  assert.equal(row.imageUrl, original); assert.equal(blobs.size, 1);
  assert.equal((await m.deleteProject('1')).success, false); assert.equal(blobs.size, 1);
});

test('shared covers are retained and arbitrary or unattached blob keys are not served', async () => {
  const m = modules(); await m.createProject(form()); sharedCover = row.imageUrl;
  assert.equal((await m.deleteProject('1')).success, true); assert.equal(blobs.size, 1);
  assert.equal((await image(m, sharedCover)).status, 200);
  sharedCover = null;
  assert.equal((await image(m, '/api/project-images/not-an-image')).status, 404);
  assert.equal((await image(m, '/api/project-images/' + [...blobs.keys()][0])).status, 404);
});
