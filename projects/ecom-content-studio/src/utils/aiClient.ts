import { AI_ERROR_MESSAGES } from '../../shared/ai';
import type { AiErrorCode, AiErrorInfo, AiHealth, FullCopyResult, GenerateApiRequest, SellingPointResult } from '../../shared/ai';
import type { ProductItem, TemplateAsset } from '../types';

export class AiClientError extends Error implements AiErrorInfo {
  code: AiErrorCode;
  retryAfter?: number;
  requestId?: string;
  constructor(code: AiErrorCode, details: { retryAfter?: number; requestId?: string } = {}) { super(AI_ERROR_MESSAGES[code]); this.name = 'AiClientError'; this.code = code; this.retryAfter = details.retryAfter; this.requestId = details.requestId; }
}
interface ClientOptions { fetcher?: typeof fetch; timeoutMs?: number; signal?: AbortSignal; baseUrl?: string }
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
function apiUrl(path: string, baseUrl?: string): string {
  const origin = baseUrl ?? globalThis.location?.href ?? 'http://localhost/';
  return new URL(`api/${path}`, new URL(import.meta.env?.BASE_URL ?? './', origin)).href;
}

/** Deliberate field selection keeps images, keys and unrelated local data off the network. */
export function createGeneratePayload(item: ProductItem, template?: TemplateAsset, pointIndex?: number): GenerateApiRequest {
  const { name, category, material, specs, audience, highlights, badgeText } = item;
  return {
    action: pointIndex === undefined ? 'full' : 'regen_point', product: { name, category, material, specs, audience, highlights, badgeText },
    ...(template ? { template: { name: template.name, copyTone: template.copyTone, titleFormulaHint: template.titleFormulaHint } } : {}),
    ...(pointIndex === undefined ? {} : { targetPointIndex: pointIndex, existingPoints: [...item.generated?.sellingPoints ?? []] }),
  };
}

function errorFromResponse(status: number, body: unknown): AiClientError {
  const info = record(body) && record(body.error) ? body.error : {};
  const defaultCode = [401, 403].includes(status) ? 'UNAUTHORIZED' : status === 429 ? 'RATE_LIMITED' : status === 504 ? 'TIMEOUT' : status === 400 ? 'INVALID_REQUEST' : 'UPSTREAM_ERROR';
  const code = typeof info.code === 'string' && Object.hasOwn(AI_ERROR_MESSAGES, info.code) ? info.code as AiErrorCode : defaultCode;
  return new AiClientError(code, { ...(typeof info.retryAfter === 'number' && Number.isFinite(info.retryAfter) ? { retryAfter: Math.max(1, Math.min(3600, info.retryAfter)) } : {}), ...(typeof info.requestId === 'string' && /^[\w.:/-]{1,120}$/.test(info.requestId) ? { requestId: info.requestId } : {}) });
}

async function requestJson(path: string, payload: unknown | undefined, options: ClientOptions = {}): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, options.timeoutMs ?? 95000);
  try {
    const response = await (options.fetcher ?? fetch)(apiUrl(path, options.baseUrl), { method: payload === undefined ? 'GET' : 'POST', cache: 'no-store', credentials: 'same-origin', ...(payload === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }), signal: controller.signal });
    let body: unknown;
    try { body = await response.json(); } catch { if (response.ok) throw new AiClientError('INVALID_AI_RESPONSE'); }
    if (!response.ok) throw errorFromResponse(response.status, body);
    return body;
  } catch (error) {
    if (timedOut) throw new AiClientError('TIMEOUT');
    if (options.signal?.aborted) throw new AiClientError('CANCELLED');
    if (error instanceof AiClientError) throw error;
    throw new AiClientError('NETWORK_ERROR');
  } finally { clearTimeout(timer); options.signal?.removeEventListener('abort', abort); }
}

export async function generateProductCopy(payload: GenerateApiRequest, options?: ClientOptions): Promise<FullCopyResult> {
  const response = await requestJson('generate', payload, options);
  const value = record(response) ? response.data : undefined;
  if (!record(value) || typeof value.seoTitle !== 'string' || !value.seoTitle.trim() || typeof value.posterTitle !== 'string' || !value.posterTitle.trim() || !Array.isArray(value.sellingPoints) || value.sellingPoints.length !== 3 || !value.sellingPoints.every(point => typeof point === 'string' && point.trim()) || !Array.isArray(value.warnings) || !value.warnings.every(warning => typeof warning === 'string')) throw new AiClientError('INVALID_AI_RESPONSE');
  return { seoTitle: value.seoTitle, posterTitle: value.posterTitle, sellingPoints: value.sellingPoints, warnings: value.warnings };
}

export async function regenerateSellingPoint(payload: GenerateApiRequest, options?: ClientOptions): Promise<SellingPointResult> {
  const response = await requestJson('generate', payload, options);
  const value = record(response) ? response.data : undefined;
  if (!record(value) || typeof value.sellingPoint !== 'string' || !value.sellingPoint.trim()) throw new AiClientError('INVALID_AI_RESPONSE');
  return { sellingPoint: value.sellingPoint };
}

export interface AiAvailability { status: 'checking' | 'ready' | 'unconfigured' | 'unavailable'; model: string }
export async function checkAiHealth(options: ClientOptions = {}): Promise<AiAvailability> {
  try {
    const body = await requestJson('ai-health', undefined, { timeoutMs: 4000, ...options });
    if (!record(body) || typeof body.configured !== 'boolean' || typeof body.model !== 'string' || !body.model.trim()) throw new AiClientError('INVALID_AI_RESPONSE');
    const health = body as unknown as AiHealth;
    return { status: health.configured ? 'ready' : 'unconfigured', model: health.model };
  } catch { return { status: 'unavailable', model: '' }; }
}
