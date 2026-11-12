const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const sharp = require('sharp');
const { NextRequest } = require('next/server');

const root = path.resolve(__dirname, '..');
let authenticated, row, writes, blobs, png, conflict;
const db = {
  async query() { return [row ? [{ ...row }] : []]; },
  async execute(sql, values) {
    if (sql.startsWith('INSERT')) {
      writes++;
      row = { id: 12, title: values[0], date: values[1], description: values[2], image_key: values[3], status: values[4], revision: 1 };
      return [{ insertId: 12, affectedRows: 1 }];
    }
    if (conflict || !row || values.at(-1) !== row.revision) return [{ affectedRows: 0 }];
    writes++;
    if (sql.startsWith('UPDATE')) row = { ...row, title: values[0], date: values[1], description: values[2], image_key: values[3], status: values[4], revision: row.revision + 1 };
    if (sql.startsWith('DELETE')) row = null;
    return [{ affectedRows: 1 }];
  },
};
function modules() {
  const cache = new Map();
  function load(file) {
    const full = path.resolve(root, file);
    if (cache.has(full)) return cache.get(full).exports;
    const mod = { exports: {} }; cache.set(full, mod);
    const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
    } }).outputText;
    const resolve = name => {
      if (name === '@/lib/db') return db;
      if (name === '@/lib/admin-auth') return { getAdmin: async () => authenticated ? { id: 1, username: 'private-login', password_hash: 'never-return-this' } : null };
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
  return { create: load('src/app/api/admin/activities/route.ts').POST,
    update: load('src/app/api/admin/activities/[id]/route.ts').PUT,
    remove: load('src/app/api/admin/activities/[id]/route.ts').DELETE,
    image: load('src/app/api/activity-images/[id]/route.ts').GET,
    me: load('src/app/api/auth/me/route.ts').GET,
    input: load('src/lib/activities.ts').activityInput,
    photos: load('src/lib/activity-photos.ts') };
}
function form(extra = {}, withPhoto = true) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ title: 'A genuine moment', date: '2026-11-12', description: 'A short story.', status: 'draft', revision: '1', ...extra })) data.set(key, value);
  if (withPhoto) data.set('photo', new File([png], 'photo.png', { type: 'image/png' }));
  return data;
}
function request(body, method = 'POST', origin = 'https://portfolio.test') {
  return new NextRequest('https://portfolio.test/api/admin/activities', { method, body,
    headers: { origin, ...(typeof body === 'string' ? { 'content-type': 'application/json' } : {}) } });
}
const params = { params: Promise.resolve({ id: '12' }) };
test.beforeEach(async () => {
  authenticated = true; row = null; writes = 0; conflict = false; blobs = new Map();
  process.env.NODE_ENV = 'production'; process.env.CONTEXT = 'production';
  png = await sharp({ create: { width: 40, height: 30, channels: 3, background: '#fa8072' } }).png().toBuffer();
});

test('all mutation routes reject anonymous and foreign-origin requests without writes', async () => {
  const m = modules(); authenticated = false;
  assert.equal((await m.create(request(form()))).status, 401);
  assert.equal((await m.update(request(form(), 'PUT'), params)).status, 401);
  assert.equal((await m.remove(request('{"revision":1}', 'DELETE'), params)).status, 401);
  authenticated = true;
  assert.equal((await m.create(request(form(), 'POST', 'https://other.test'))).status, 403);
  process.env.CONTEXT = 'deploy-preview';
  assert.equal((await m.create(request(form()))).status, 403);
  assert.equal(writes, 0); assert.equal(blobs.size, 0);
});

test('title, real calendar date, description and status are validated', () => {
  const m = modules();
  for (const extra of [{ title: ' ' }, { title: 'a'.repeat(161) }, { date: '2026-02-30' }, { date: 'bad' }, { description: ' ' }, { description: 'x'.repeat(1001) }, { status: 'anything' }]) {
    assert.throws(() => m.input(form(extra)));
  }
  assert.equal(m.input(form({ date: '2024-02-29' })).date, '2024-02-29');
});

test('photos must decode as raster images, reject oversized files and strip metadata', async () => {
  const m = modules();
  await assert.rejects(m.photos.prepareActivityPhoto(new File(['<svg/>'], 'x.jpg', { type: 'image/jpeg' })));
  await assert.rejects(m.photos.prepareActivityPhoto(new File([new Uint8Array(3 * 1024 * 1024 + 1)], 'x.jpg', { type: 'image/jpeg' })));
  const output = await m.photos.prepareActivityPhoto(new File([png], 'photo.png', { type: 'image/png' }));
  const info = await sharp(Buffer.from(output)).metadata();
  assert.equal(info.format, 'jpeg'); assert.equal(info.exif, undefined);
});

test('create draft, protect image, publish, edit with same image, and delete exact record', async () => {
  const m = modules();
  assert.equal((await m.create(request(form()))).status, 201);
  assert.equal(row.status, 'draft'); assert.equal(blobs.size, 1);
  authenticated = false;
  assert.equal((await m.image(new NextRequest('https://portfolio.test/api/activity-images/12'), params)).status, 404);
  authenticated = true;
  assert.equal((await m.image(new NextRequest('https://portfolio.test/api/activity-images/12'), params)).headers.get('content-type'), 'image/jpeg');
  const imageKey = row.image_key;
  assert.equal((await m.update(request(form({ title: 'Edited moment', status: 'published' }, false), 'PUT'), params)).status, 200);
  assert.equal(row.image_key, imageKey); assert.equal(row.revision, 2);
  authenticated = false;
  assert.equal((await m.image(new NextRequest('https://portfolio.test/api/activity-images/12'), params)).status, 200);
  authenticated = true;
  assert.equal((await m.remove(request('{"revision":2}', 'DELETE'), params)).status, 200);
  assert.equal(row, null); assert.equal(blobs.size, 0);
});

test('conflicting image update cannot overwrite record and cleans the new orphan', async () => {
  const m = modules(); await m.create(request(form()));
  const key = row.image_key; conflict = true;
  assert.equal((await m.update(request(form(), 'PUT'), params)).status, 409);
  assert.equal(row.image_key, key); assert.equal(blobs.size, 1);
});

test('session identity exposes only display name and photo, not login credentials', async () => {
  const m = modules();
  const response = await m.me(new NextRequest('https://portfolio.test/api/auth/me'));
  assert.deepEqual(await response.json(), { user: { name: 'Fikrie', avatar: '/Profile.jpg' } });
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  authenticated = false;
  assert.deepEqual(await (await m.me(new NextRequest('https://portfolio.test/api/auth/me'))).json(), { user: null });
});
