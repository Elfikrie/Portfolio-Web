const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const bcrypt = require('bcrypt');
const { NextRequest } = require('next/server');

const root = path.resolve(__dirname, '..');
const initialPassword = crypto.randomBytes(20).toString('hex');
const replacementPassword = crypto.randomBytes(20).toString('hex');
let user, cookie, writes, queryFailure, conflict;
const db = {
  async query(sql, params) {
    if (queryFailure) throw new Error('Database unavailable');
    const matches = sql.includes('WHERE id') ? String(params[0]) === String(user.id) : params[0] === user.username;
    return [matches ? [{ ...user }] : []];
  },
  async execute(sql, params) {
    assert.equal(sql, 'UPDATE users SET password_hash = ? WHERE id = ? AND password_hash = ?');
    if (conflict || params[1] !== user.id || params[2] !== user.password_hash) return [{ affectedRows: 0 }];
    user.password_hash = params[0];
    writes++;
    return [{ affectedRows: 1 }];
  },
};

function modules() {
  const cache = new Map();
  function load(file) {
    const full = path.resolve(root, file);
    if (cache.has(full)) return cache.get(full).exports;
    const mod = { exports: {} };
    cache.set(full, mod);
    const compiled = ts.transpileModule(fs.readFileSync(full, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const resolve = (name) => {
      if (name === '@/lib/db') return db;
      if (name === 'next/headers') return { cookies: async () => ({ get: () => cookie ? { value: cookie } : undefined }) };
      if (name === 'next/navigation') return { redirect: (url) => { throw new Error('REDIRECT:' + url); } };
      if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
      return require(name);
    };
    new Function('require', 'module', 'exports', compiled)(resolve, mod, mod.exports);
    return mod.exports;
  }
  return {
    login: load('src/app/api/auth/login/route.ts').POST,
    change: load('src/app/api/auth/change-password/route.ts').POST,
    logout: load('src/app/api/auth/logout/route.ts').POST,
    proxy: load('src/proxy.ts').proxy,
    auth: load('src/lib/admin-auth.ts'),
    session: load('src/lib/session.ts'),
  };
}

const request = (body, origin = 'https://portfolio.test') => new Request('https://portfolio.test/api/auth/login', {
  method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(body),
});
const credentials = () => ({ username: user.username, password: initialPassword });
const passwordChange = (extra = {}) => ({ username: user.username, currentPassword: initialPassword,
  newPassword: replacementPassword, confirmPassword: replacementPassword, ...extra });

test.beforeEach(async () => {
  process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
  process.env.NODE_ENV = 'production';
  delete process.env.URL;
  delete process.env.DEPLOY_URL;
  delete process.env.DEPLOY_PRIME_URL;
  user = { id: 42, username: 'test-admin', password_hash: await bcrypt.hash(initialPassword, 4) };
  cookie = undefined; writes = 0; queryFailure = false; conflict = false;
});

test('login succeeds once, cookie covers /admin and session passes both guards', async () => {
  const m = modules();
  const response = await m.login(request(credentials()));
  assert.equal(response.status, 200);
  const header = response.headers.get('set-cookie');
  for (const value of ['Path=/', 'HttpOnly', 'Secure', 'SameSite=strict', 'Max-Age=86400']) assert.ok(header.includes(value));
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  cookie = response.cookies.get('admin_token').value;
  const accepted = await m.proxy(new NextRequest('https://portfolio.test/admin', { headers: { cookie: 'admin_token=' + cookie } }));
  assert.equal(accepted.headers.get('x-middleware-next'), '1');
  assert.equal((await m.auth.requireAdmin()).id, 42);
});

test('missing secret fails closed without claiming credentials are wrong', async () => {
  const m = modules(); delete process.env.JWT_SECRET;
  const response = await m.login(request(credentials()));
  assert.equal(response.status, 503);
  assert.equal(response.cookies.get('admin_token'), undefined);
});

test('bad credentials, invalid JSON, types, missing fields and cross-origin requests fail', async () => {
  const m = modules();
  assert.equal((await m.login(request({ ...credentials(), password: 'wrong' }))).status, 401);
  assert.equal((await m.login(request({ ...credentials(), username: 'missing' }))).status, 401);
  for (const body of [null, {}, { username: 1, password: [] }]) assert.equal((await m.login(request(body))).status, 400);
  assert.equal((await m.login(new Request('https://portfolio.test/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }))).status, 400);
  assert.equal((await m.login(request(credentials(), 'https://other.test'))).status, 403);
});

test('wrong old password, confirmation, short or oversized UTF-8 passwords never change data', async () => {
  const m = modules();
  assert.equal((await m.change(request(passwordChange({ currentPassword: 'wrong' })))).status, 401);
  for (const extra of [{ confirmPassword: 'different' }, { newPassword: 'short', confirmPassword: 'short' },
    { newPassword: '🔥'.repeat(20), confirmPassword: '🔥'.repeat(20) },
    { newPassword: initialPassword, confirmPassword: initialPassword }]) {
    assert.equal((await m.change(request(passwordChange(extra)))).status, 400);
  }
  assert.equal((await m.change(request(passwordChange(), 'https://other.test'))).status, 403);
  assert.equal(writes, 0);
});

test('password change stores bcrypt, revokes old sessions and accepts only new password', async () => {
  const m = modules();
  const login = await m.login(request(credentials()));
  cookie = login.cookies.get('admin_token').value;
  const response = await m.change(request(passwordChange()));
  assert.equal(response.status, 200);
  assert.equal(writes, 1);
  assert.ok(await bcrypt.compare(replacementPassword, user.password_hash));
  assert.equal(bcrypt.getRounds(user.password_hash), 12);
  assert.ok(response.headers.get('set-cookie').includes('Max-Age=0'));
  assert.equal(await m.auth.getAdmin(cookie), null);
  await assert.rejects(m.auth.requireAdmin(), /REDIRECT:\/login/);
  assert.equal((await m.login(request(credentials()))).status, 401);
  assert.equal((await m.login(request({ username: user.username, password: replacementPassword }))).status, 200);
});

test('concurrent update cannot overwrite newer password', async () => {
  const m = modules(); conflict = true;
  assert.equal((await m.change(request(passwordChange()))).status, 409);
  assert.equal(writes, 0);
});

test('logout clears root cookie and forged sessions are rejected', async () => {
  const m = modules();
  const response = await m.logout();
  assert.ok(response.headers.get('set-cookie').includes('Path=/'));
  assert.ok(response.headers.get('set-cookie').includes('Max-Age=0'));
  assert.equal(await m.auth.getAdmin('forged'), null);
  const denied = await m.proxy(new NextRequest('https://portfolio.test/admin'));
  assert.equal(denied.headers.get('location'), 'https://portfolio.test/login');
});

test('repeated attempts are throttled', async () => {
  const m = modules();
  for (let i = 0; i < 10; i++) await m.login(request({ ...credentials(), password: 'wrong' }));
  assert.equal((await m.login(request(credentials()))).status, 429);
});

test('trusted Netlify public origin survives internal HTTP proxying; foreign origins fail', async () => {
  process.env.URL = 'http://portfolio.test';
  const m = modules();
  const forwarded = (origin) => new Request('http://localhost:3000/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(credentials()),
  });
  assert.equal((await m.login(forwarded('https://portfolio.test'))).status, 200);
  assert.equal((await m.login(forwarded('https://other.test'))).status, 403);
  delete process.env.URL;
  const sameHost = new Request('http://portfolio.test/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://portfolio.test' },
    body: JSON.stringify(credentials()),
  });
  assert.equal((await m.login(sameHost)).status, 200);
});
