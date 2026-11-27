import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { AiClientError, checkAiHealth, createGeneratePayload, generateProductCopy, regenerateSellingPoint } from '../src/utils/aiClient';
import { createDemoProducts, createDemoTemplates } from '../src/data/demoData';
import { mergeGeneratedCopy, processGenerationQueue } from '../src/utils/generation';

const item = createDemoProducts()[0];
const template = createDemoTemplates()[1];
const copy = { seoTitle: '黑色尼龙轻量通勤双肩包独立电脑仓日常实用收纳背包', posterTitle: '轻装出发自在通勤', sellingPoints: ['黑色尼龙搭配轻量设计，兼顾日常收纳与通勤使用需求。', '独立电脑仓方便分类收纳，通勤路上让随身物品各有位置。', '适合日常通勤与学习使用，黑色外观为出行搭配多一份从容。'], warnings: ['请核对商品规格。'] };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });

test('frontend sends only product text to its own proxy without a bearer token or images', async () => {
  const payload = createGeneratePayload(item, template);
  assert.ok(!JSON.stringify(payload).includes('data:image'));
  assert.ok(!('imageUrl' in payload.product));
  const fetcher = (async (url, options) => {
    assert.equal(String(url), 'https://example.test/shop/api/generate');
    assert.equal(new Headers(options?.headers).get('authorization'), null);
    assert.equal(options?.cache, 'no-store');
    assert.deepEqual(JSON.parse(String(options?.body)), payload);
    return json({ data: copy });
  }) as typeof fetch;
  assert.deepEqual(await generateProductCopy(payload, { fetcher, baseUrl: 'https://example.test/shop/' }), copy);
});

test('health checks gracefully distinguish static hosting, missing keys and a ready proxy', async () => {
  assert.equal((await checkAiHealth({ fetcher: (async () => new Response('<!doctype html>', { status: 404 })) as typeof fetch })).status, 'unavailable');
  assert.equal((await checkAiHealth({ fetcher: (async () => json({ configured: false, model: 'test-model' })) as typeof fetch })).status, 'unconfigured');
  assert.equal((await checkAiHealth({ fetcher: (async () => json({ configured: true, model: 'test-model' })) as typeof fetch })).status, 'ready');
});

test('client replaces raw technical errors with safe messages and preserves retry metadata', async () => {
  await assert.rejects(generateProductCopy(createGeneratePayload(item), { fetcher: (async () => json({ error: { code: 'RATE_LIMITED', message: 'Traceback private upstream error', retryAfter: 8 } }, 429)) as typeof fetch }), (error: unknown) => {
    assert.ok(error instanceof AiClientError);
    assert.equal(error.code, 'RATE_LIMITED');
    assert.equal(error.retryAfter, 8);
    assert.ok(!error.message.includes('Traceback'));
    return true;
  });
  await assert.rejects(generateProductCopy(createGeneratePayload(item), { fetcher: (async () => json({ data: {} })) as typeof fetch }), { code: 'INVALID_AI_RESPONSE' });
});

test('single point refresh changes exactly one point and preserves manually edited design and titles', async () => {
  const edited = { ...item, generated: { ...item.generated!, seoTitle: '人工确认的商品标题', posterTitle: '人工修改的主图标题', sellingPoints: ['人工编辑卖点甲', '原卖点乙', '人工编辑卖点丙'], visualStyle: 'luxury-black' as const } };
  const payload = createGeneratePayload(edited, template, 1);
  assert.equal(payload.action, 'regen_point');
  assert.equal(payload.targetPointIndex, 1);
  const result = await regenerateSellingPoint(payload, { fetcher: (async () => json({ data: { sellingPoint: '新的第二条卖点' } })) as typeof fetch });
  const merged = mergeGeneratedCopy(edited, 1, result, 'real', 'minimal-white');
  assert.equal(merged.seoTitle, edited.generated.seoTitle);
  assert.equal(merged.posterTitle, edited.generated.posterTitle);
  assert.equal(merged.visualStyle, 'luxury-black');
  assert.deepEqual(merged.sellingPoints, ['人工编辑卖点甲', '新的第二条卖点', '人工编辑卖点丙']);
  assert.equal(mergeGeneratedCopy(edited, 'copy', copy, 'real', 'minimal-white').posterTitle, edited.generated.posterTitle);
});

test('sequential batch processing continues after one failure and never runs parallel requests', async () => {
  const failures: number[] = [], finished: number[] = [];
  let active = 0, maximum = 0;
  const summary = await processGenerationQueue([1, 2, 3], async value => {
    active++; maximum = Math.max(active, maximum);
    await new Promise(resolve => setTimeout(resolve, 2));
    active--;
    if (value === 2) throw new AiClientError('RATE_LIMITED');
    finished.push(value);
  }, value => { failures.push(value); });
  assert.equal(maximum, 1);
  assert.deepEqual(finished, [1, 3]);
  assert.deepEqual(failures, [2]);
  assert.deepEqual(summary, { success: 2, failed: 1, cancelled: false });
});

test('stopping a batch does not send requests for remaining queued products', async () => {
  const controller = new AbortController();
  const called: number[] = [];
  const summary = await processGenerationQueue([1, 2, 3], async value => { called.push(value); controller.abort(); }, () => {}, controller.signal);
  assert.deepEqual(called, [1]);
  assert.equal(summary.cancelled, true);
});
