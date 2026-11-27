import { AI_ERROR_MESSAGES } from '../shared/ai.ts';
import type { AiErrorCode, FullCopyResult, GenerateApiRequest, SellingPointResult } from '../shared/ai.ts';
import { buildMessages } from './promptBuilder.ts';

export const DEFAULT_BASE_URL = 'https://aiop.whu.edu.cn/api/v1';
export const DEFAULT_MODEL_ID = 'b0c5a237-a5fe-46fb-9007-f1cf17c5382b';
export interface AiConfiguration { baseUrl: string; model: string; apiKey: string }
export interface AiMetadata { httpStatus: number; elapsedMs: number; requestId?: string; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }
export interface AiServiceResult { data: FullCopyResult | SellingPointResult; meta: AiMetadata }

export class AiServiceError extends Error {
  code: AiErrorCode;
  status: number;
  requestId?: string;
  retryAfter?: number;
  constructor(code: AiErrorCode, status: number, details: { requestId?: string; retryAfter?: number } = {}) {
    super(AI_ERROR_MESSAGES[code]); this.name = 'AiServiceError'; this.code = code; this.status = status;
    this.requestId = details.requestId; this.retryAfter = details.retryAfter;
  }
}

export function readAiConfiguration(env: Record<string, string | undefined> = process.env): AiConfiguration {
  return { baseUrl: (env.AIOP_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, ''), model: env.AIOP_MODEL_ID?.trim() || DEFAULT_MODEL_ID, apiKey: env.AIOP_API_KEY?.trim() || '' };
}
export function isAiConfigured(config: AiConfiguration): boolean {
  try {
    const url = new URL(config.baseUrl);
    return Boolean(config.apiKey && !/^(your[_-]?api[_-]?key[_-]?here|placeholder)$/i.test(config.apiKey) && config.model && (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) && !url.username && !url.password && !url.search && !url.hash);
  } catch { return false; }
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
function text(value: unknown, max: number, required = false): string {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new AiServiceError('INVALID_REQUEST', 400);
  return value.trim();
}

/** Whitelisting excludes image Data URLs, client credentials and arbitrary prompts. */
export function validateGenerateRequest(value: unknown): GenerateApiRequest {
  if (!record(value) || !['full', 'regen_point'].includes(String(value.action)) || !record(value.product)) throw new AiServiceError('INVALID_REQUEST', 400);
  const product = value.product;
  const result: GenerateApiRequest = { action: value.action as GenerateApiRequest['action'], product: {
    name: text(product.name, 100, true), category: text(product.category, 100, true), material: text(product.material, 100), specs: text(product.specs, 100), audience: text(product.audience, 100), highlights: text(product.highlights, 500), badgeText: text(product.badgeText, 100),
  } };
  if (value.template !== undefined) {
    if (!record(value.template) || !['promo', 'minimal', 'lifestyle', 'professional'].includes(String(value.template.copyTone))) throw new AiServiceError('INVALID_REQUEST', 400);
    result.template = { name: text(value.template.name, 100, true), copyTone: value.template.copyTone as NonNullable<GenerateApiRequest['template']>['copyTone'], titleFormulaHint: text(value.template.titleFormulaHint, 200) };
  }
  if (result.action === 'regen_point') {
    if (!Number.isInteger(value.targetPointIndex) || !Array.isArray(value.existingPoints) || value.existingPoints.length > 8 || Number(value.targetPointIndex) < 0 || Number(value.targetPointIndex) >= value.existingPoints.length) throw new AiServiceError('INVALID_REQUEST', 400);
    result.targetPointIndex = Number(value.targetPointIndex);
    result.existingPoints = value.existingPoints.map(point => text(point, 500));
  }
  return result;
}

export function parseModelJson(raw: unknown): unknown {
  if (typeof raw !== 'string' || raw.length > 60000) throw new AiServiceError('INVALID_AI_RESPONSE', 502);
  const clean = raw.replace(/<think\b[^>]*>[\s\S]*?<\/think\s*>/gi, '').replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const first = clean.indexOf('{'), last = clean.lastIndexOf('}');
  if (first < 0 || last <= first) throw new AiServiceError('INVALID_AI_RESPONSE', 502);
  try { return JSON.parse(clean.slice(first, last + 1)); }
  catch { throw new AiServiceError('INVALID_AI_RESPONSE', 502); }
}

const length = (value: string) => Array.from(value).length;
function outputText(value: unknown, min: number, max: number): string {
  if (typeof value !== 'string' || length(value.trim()) < min || length(value.trim()) > max) throw new AiServiceError('INVALID_AI_RESPONSE', 502);
  return value.trim();
}
export function validateModelOutput(value: unknown, input: GenerateApiRequest): FullCopyResult | SellingPointResult {
  if (!record(value)) throw new AiServiceError('INVALID_AI_RESPONSE', 502);
  if (input.action === 'regen_point') {
    const sellingPoint = outputText(value.sellingPoint, 20, 40);
    if (input.existingPoints?.some(point => point.trim() === sellingPoint)) throw new AiServiceError('INVALID_AI_RESPONSE', 502);
    return { sellingPoint };
  }
  if (!Array.isArray(value.sellingPoints) || value.sellingPoints.length !== 3 || !Array.isArray(value.warnings) || value.warnings.length > 8) throw new AiServiceError('INVALID_AI_RESPONSE', 502);
  const sellingPoints = value.sellingPoints.map(point => outputText(point, 20, 40));
  if (new Set(sellingPoints).size !== 3) throw new AiServiceError('INVALID_AI_RESPONSE', 502);
  const warnings = value.warnings.map(warning => outputText(warning, 1, 200));
  // Fill missing-information reminders even when the model overlooks them.
  const missing = [['material', '材质'], ['specs', '颜色与规格'], ['audience', '目标人群']].filter(([key]) => !input.product[key as keyof GenerateApiRequest['product']]?.trim()).map(([, label]) => label);
  if (missing.length && !warnings.length) warnings.push(`尚未填写${missing.join('、')}，建议补充后再生成更精准的内容。`);
  return { seoTitle: outputText(value.seoTitle, 22, 30), posterTitle: outputText(value.posterTitle, 6, 12), sellingPoints, warnings };
}

function requestIdFrom(headers: Headers, body: unknown, apiKey: string): string | undefined {
  const bodyId = record(body) ? (body.request_id ?? (record(body.error) ? body.error.request_id : undefined)) : undefined;
  const candidate = headers.get('x-request-id') || headers.get('request-id') || (typeof bodyId === 'string' ? bodyId : '');
  return candidate && !candidate.includes(apiKey) && /^[\w.:/-]{1,120}$/.test(candidate) ? candidate : undefined;
}
function retryDelay(headers: Headers): number | undefined {
  const value = headers.get('retry-after');
  if (!value) return undefined;
  const seconds = /^\d+$/.test(value) ? Number(value) : Math.ceil((Date.parse(value) - Date.now()) / 1000);
  return Number.isFinite(seconds) ? Math.max(1, Math.min(3600, seconds)) : undefined;
}

export async function generateAiCopy(payload: unknown, config: AiConfiguration, options: { fetcher?: typeof fetch; timeoutMs?: number; signal?: AbortSignal } = {}): Promise<AiServiceResult> {
  const input = validateGenerateRequest(payload);
  if (!isAiConfigured(config)) throw new AiServiceError('NOT_CONFIGURED', 503);
  const controller = new AbortController();
  let timedOut = false;
  const onAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onAbort, { once: true });
  if (options.signal?.aborted) controller.abort();
  // AIOP includes GLM reasoning in max_tokens; 800 truncates before the answer.
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, options.timeoutMs ?? 90000);
  const started = performance.now();
  try {
    const response = await (options.fetcher ?? fetch)(`${config.baseUrl}/chat/completions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages: buildMessages(input), temperature: 0.7, max_tokens: 4096, reasoning_effort: 'low', stream: false }), signal: controller.signal,
    });
    let envelope: unknown;
    try { envelope = await response.json(); } catch { envelope = null; }
    const requestId = requestIdFrom(response.headers, envelope, config.apiKey);
    if (!response.ok) {
      const code = [401, 403].includes(response.status) ? 'UNAUTHORIZED' : response.status === 429 ? 'RATE_LIMITED' : 'UPSTREAM_ERROR';
      throw new AiServiceError(code, [401, 403, 429].includes(response.status) ? response.status : 502, { requestId, retryAfter: retryDelay(response.headers) });
    }
    if (!record(envelope) || !Array.isArray(envelope.choices) || !record(envelope.choices[0]) || !record(envelope.choices[0].message)) throw new AiServiceError('INVALID_AI_RESPONSE', 502, { requestId });
    const content = envelope.choices[0].message.content;
    const raw = Array.isArray(content) ? content.filter(record).map(part => typeof part.text === 'string' ? part.text : '').join('') : content;
    // Never forward reflected credentials, even if an upstream response contains them.
    if (typeof raw === 'string' && raw.includes(config.apiKey)) throw new AiServiceError('INVALID_AI_RESPONSE', 502, { requestId });
    let data: FullCopyResult | SellingPointResult;
    try { data = validateModelOutput(parseModelJson(raw), input); }
    catch { throw new AiServiceError('INVALID_AI_RESPONSE', 502, { requestId }); }
    const usage: AiMetadata['usage'] = {};
    if (record(envelope.usage)) for (const key of ['prompt_tokens', 'completion_tokens', 'total_tokens'] as const) { const value = envelope.usage[key]; if (typeof value === 'number' && Number.isFinite(value) && value >= 0) usage[key] = value; }
    return { data, meta: { httpStatus: response.status, elapsedMs: Math.round(performance.now() - started), requestId, ...(Object.keys(usage).length ? { usage } : {}) } };
  } catch (error) {
    if (timedOut) throw new AiServiceError('TIMEOUT', 504);
    if (options.signal?.aborted) throw new AiServiceError('CANCELLED', 499);
    if (error instanceof AiServiceError) throw error;
    throw new AiServiceError('NETWORK_ERROR', 502);
  } finally { clearTimeout(timer); options.signal?.removeEventListener('abort', onAbort); }
}
