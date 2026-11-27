import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { AiServiceError, generateAiCopy, isAiConfigured, parseModelJson, readAiConfiguration, validateGenerateRequest, validateModelOutput } from '../server/aiService';
import { buildMessages } from '../server/promptBuilder';
import type { GenerateApiRequest } from '../shared/ai';

const input: GenerateApiRequest = { action: 'full', product: { name: '轻量通勤双肩包', category: '箱包配饰', material: '黑色尼龙', specs: '黑色 15.6寸', audience: '职场通勤人群', highlights: '独立电脑仓、轻量收纳' } };
const output = { seoTitle: '黑色尼龙轻量通勤双肩包独立电脑仓日常实用收纳背包', posterTitle: '轻装出发自在通勤', sellingPoints: ['黑色尼龙搭配轻量设计，兼顾日常收纳与通勤使用需求。', '独立电脑仓方便分类收纳，通勤路上让随身物品各有位置。', '适合日常通勤与学习使用，黑色外观为出行搭配多一份从容。'], warnings: [] };
const config = readAiConfiguration({ AIOP_API_KEY: 'server-only-test-key' });
const response = (content: unknown) => new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 } }), { headers: { 'content-type': 'application/json', 'x-request-id': 'test-request-1' } });

test('model JSON strips thinking tags and Markdown fences before parsing', () => {
  assert.deepEqual(parseModelJson(`<think>不要显示的思考</think>说明文字\n\`\`\`json\n${JSON.stringify(output)}\n\`\`\``), output);
  assert.throws(() => parseModelJson('<think>未完成的思考'), { code: 'INVALID_AI_RESPONSE' });
  assert.throws(() => validateModelOutput({ ...output, sellingPoints: [] }, input), { code: 'INVALID_AI_RESPONSE' });
  assert.throws(() => validateModelOutput({ ...output, seoTitle: '' }, input), { code: 'INVALID_AI_RESPONSE' });
});

test('request validation forwards only business fields and rejects invalid point indexes', () => {
  const clean = validateGenerateRequest({ ...input, apiKey: 'do-not-forward', imageUrl: 'data:image/png;base64,private', product: { ...input.product, imageUrl: 'data:image/png;base64,private' } });
  assert.ok(!JSON.stringify(clean).includes('private'));
  assert.ok(!JSON.stringify(buildMessages(clean)).includes('do-not-forward'));
  assert.throws(() => validateGenerateRequest({ ...input, action: 'regen_point', targetPointIndex: -1, existingPoints: ['a'] }), { code: 'INVALID_REQUEST' });
  assert.throws(() => validateGenerateRequest({ ...input, product: { ...input.product, name: '' } }), { code: 'INVALID_REQUEST' });
});

test('incomplete product data produces factual reminders rather than invented attributes', () => {
  const result = validateModelOutput(output, { action: 'full', product: { name: '双肩包', category: '箱包配饰' } });
  assert.ok('warnings' in result && result.warnings.some(warning => warning.includes('材质')));
  const system = buildMessages(input)[0].content;
  assert.match(system, /禁止编造/);
  assert.match(system, /全网第一/);
});

test('single point regeneration returns one new point and rejects duplicates', () => {
  const pointInput: GenerateApiRequest = { ...input, action: 'regen_point', targetPointIndex: 1, existingPoints: output.sellingPoints };
  const newPoint = '通勤收纳兼顾实用和条理感，让每天携带的物品各有位置。';
  assert.deepEqual(validateModelOutput({ sellingPoint: newPoint }, pointInput), { sellingPoint: newPoint });
  assert.throws(() => validateModelOutput({ sellingPoint: output.sellingPoints[0] }, pointInput), { code: 'INVALID_AI_RESPONSE' });
});

test('server fetch uses server credentials and captures safe metadata', async () => {
  const fetcher = (async (url, options) => {
    assert.equal(String(url), 'https://aiop.whu.edu.cn/api/v1/chat/completions');
    assert.equal(new Headers(options?.headers).get('authorization'), `Bearer ${config.apiKey}`);
    const body = JSON.parse(String(options?.body));
    assert.equal(body.model, config.model);
    assert.equal(body.temperature, 0.7);
    return response(JSON.stringify(output));
  }) as typeof fetch;
  const result = await generateAiCopy(input, config, { fetcher });
  assert.deepEqual(result.data, output);
  assert.equal(result.meta.requestId, 'test-request-1');
  assert.equal(result.meta.usage?.total_tokens, 150);
  assert.ok(!JSON.stringify(result).includes(config.apiKey));
});

test('authentication and rate-limit errors never expose upstream error bodies', async () => {
  for (const status of [401, 403, 429]) {
    await assert.rejects(generateAiCopy(input, config, { fetcher: (async () => new Response(JSON.stringify({ error: { message: `sensitive ${config.apiKey}` } }), { status, headers: { 'retry-after': '8', 'x-request-id': 'safe-id' } })) as typeof fetch }), (error: unknown) => {
      assert.ok(error instanceof AiServiceError);
      assert.equal(error.code, status === 429 ? 'RATE_LIMITED' : 'UNAUTHORIZED');
      assert.ok(!error.message.includes(config.apiKey));
      assert.equal(error.requestId, 'safe-id');
      return true;
    });
  }
});

test('timeouts, network failures and malformed JSON are distinct retryable errors', async () => {
  const abortedFetch = (async (_url, options) => new Promise((_resolve, reject) => options?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true }))) as typeof fetch;
  await assert.rejects(generateAiCopy(input, config, { fetcher: abortedFetch, timeoutMs: 5 }), { code: 'TIMEOUT', status: 504 });
  await assert.rejects(generateAiCopy(input, config, { fetcher: (async () => { throw new Error('network'); }) as typeof fetch }), { code: 'NETWORK_ERROR' });
  await assert.rejects(generateAiCopy(input, config, { fetcher: (async () => response('broken JSON')) as typeof fetch }), { code: 'INVALID_AI_RESPONSE' });
  await assert.rejects(generateAiCopy(input, readAiConfiguration({}), { fetcher: abortedFetch }), { code: 'NOT_CONFIGURED' });
  assert.equal(isAiConfigured(readAiConfiguration({ AIOP_API_KEY: 'your_api_key_here' })), false);
});

test('reflected credentials are blocked in content and request identifiers', async () => {
  const fetcher = (async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ ...output, warnings: [config.apiKey] }) } }] }), { headers: { 'x-request-id': config.apiKey } })) as typeof fetch;
  await assert.rejects(generateAiCopy(input, config, { fetcher }), (error: unknown) => {
    assert.ok(error instanceof AiServiceError);
    assert.equal(error.code, 'INVALID_AI_RESPONSE');
    assert.equal(error.requestId, undefined);
    assert.ok(!JSON.stringify(error).includes(config.apiKey));
    return true;
  });
});
