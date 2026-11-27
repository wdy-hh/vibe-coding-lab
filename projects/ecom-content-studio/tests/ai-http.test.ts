import { strict as assert } from 'node:assert';
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { test } from 'node:test';
import { createAiHandler } from '../server/httpHandler';
import { readAiConfiguration } from '../server/aiService';

const config = readAiConfiguration({ AIOP_API_KEY: 'private-server-test-key' });
const output = { seoTitle: '黑色尼龙轻量通勤双肩包独立电脑仓日常实用收纳背包', posterTitle: '轻装出发自在通勤', sellingPoints: ['黑色尼龙搭配轻量设计，兼顾日常收纳与通勤使用需求。', '独立电脑仓方便分类收纳，通勤路上让随身物品各有位置。', '适合日常通勤与学习使用，黑色外观为出行搭配多一份从容。'], warnings: [] };
const input = { action: 'full', product: { name: '双肩包', category: '箱包配饰', material: '尼龙', specs: '黑色', audience: '上班族' } };

async function withServer(work: (base: string) => Promise<void>, options: Parameters<typeof createAiHandler>[1] = {}) {
  const handle = createAiHandler(() => config, { fetcher: (async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(output) } }] }))) as typeof fetch, ...options });
  const server: Server = createServer((request, response) => { void handle(request, response).then(handled => { if (!handled) { response.statusCode = 404; response.end(); } }); });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  try { await work(`http://127.0.0.1:${address.port}`); }
  finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
}
const post = (base: string, body: unknown, headers: Record<string, string> = {}) => fetch(`${base}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

test('health exposes only configured/model and POST returns structured data without secrets', async () => {
  await withServer(async base => {
    const health = await fetch(`${base}/api/ai-health`);
    assert.equal(health.headers.get('cache-control'), 'no-store');
    const healthBody = await health.json();
    assert.deepEqual(Object.keys(healthBody).sort(), ['configured', 'model']);
    assert.equal(healthBody.configured, true);
    assert.ok(!JSON.stringify(healthBody).includes(config.apiKey));
    const response = await post(base, input);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { data: output });
  });
});

test('HTTP routes reject wrong methods, cross-origin calls, malformed and oversized bodies', async () => {
  await withServer(async base => {
    assert.equal((await fetch(`${base}/api/generate`)).status, 405);
    assert.equal((await post(base, input, { Origin: 'https://unrelated.example' })).status, 403);
    assert.equal((await fetch(`${base}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' })).status, 400);
    assert.equal((await post(base, { text: 'x'.repeat(17000) })).status, 413);
    assert.equal((await fetch(`${base}/api/generate`, { method: 'POST', body: '{}' })).status, 415);
  });
});

test('proxy normalizes 429 responses and includes safe retry information', async () => {
  await withServer(async base => {
    const response = await post(base, input);
    const body = await response.json();
    assert.equal(response.status, 429);
    assert.equal(body.error.code, 'RATE_LIMITED');
    assert.equal(body.error.requestId, 'request-safe');
    assert.equal(response.headers.get('retry-after'), '3');
    assert.ok(!JSON.stringify(body).includes('private-upstream'));
  }, { fetcher: (async () => new Response(JSON.stringify({ error: { message: 'private-upstream' } }), { status: 429, headers: { 'retry-after': '3', 'x-request-id': 'request-safe' } })) as typeof fetch });
});
