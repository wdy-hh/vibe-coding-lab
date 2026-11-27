import type { IncomingMessage, ServerResponse } from 'node:http';
import { AiServiceError, generateAiCopy, isAiConfigured, readAiConfiguration } from './aiService.ts';
import type { AiConfiguration } from './aiService.ts';

export interface ApiRequest extends IncomingMessage { body?: unknown }
const MAX_BODY_BYTES = 16 * 1024;

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  if (response.destroyed || response.writableEnded) return;
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(body));
}

async function readBody(request: ApiRequest): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(String(request.headers['content-type'] ?? ''))) throw new AiServiceError('UNSUPPORTED_MEDIA_TYPE', 415);
  if (request.body !== undefined) {
    let serialized: string;
    try { serialized = typeof request.body === 'string' ? request.body : JSON.stringify(request.body); }
    catch { throw new AiServiceError('INVALID_REQUEST', 400); }
    if (typeof serialized !== 'string') throw new AiServiceError('INVALID_REQUEST', 400);
    if (Buffer.byteLength(serialized) > MAX_BODY_BYTES) throw new AiServiceError('PAYLOAD_TOO_LARGE', 413);
    try { return JSON.parse(serialized); } catch { throw new AiServiceError('INVALID_REQUEST', 400); }
  }
  const raw = await new Promise<string>((resolve, reject) => {
    let total = 0;
    const chunks: Buffer[] = [];
    const cleanup = () => { request.off('data', onData); request.off('end', onEnd); request.off('error', onError); request.off('aborted', onAborted); };
    const onError = () => { cleanup(); reject(new AiServiceError('INVALID_REQUEST', 400)); };
    const onAborted = () => { cleanup(); reject(new AiServiceError('CANCELLED', 499)); };
    const onData = (chunk: Buffer | string) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += buffer.length;
      if (total > MAX_BODY_BYTES) { cleanup(); request.resume(); reject(new AiServiceError('PAYLOAD_TOO_LARGE', 413)); return; }
      chunks.push(buffer);
    };
    const onEnd = () => { cleanup(); resolve(Buffer.concat(chunks).toString('utf8')); };
    request.on('data', onData); request.on('end', onEnd); request.on('error', onError); request.on('aborted', onAborted);
  });
  try { return JSON.parse(raw); } catch { throw new AiServiceError('INVALID_REQUEST', 400); }
}

function checkOrigin(request: IncomingMessage): void {
  const origin = request.headers.origin;
  if (!origin) return; // CLI smoke tests and server-to-server calls have no Origin.
  const forwarded = request.headers['x-forwarded-host'];
  const host = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : request.headers.host;
  try { if (new URL(origin).host === host) return; } catch { /* Rejected below. */ }
  throw new AiServiceError('ORIGIN_NOT_ALLOWED', 403);
}

export function createAiHandler(getConfig: () => AiConfiguration = () => readAiConfiguration(), options: { fetcher?: typeof fetch; timeoutMs?: number; fixedRoute?: string; rateLimit?: number } = {}) {
  const clients = new Map<string, { since: number; count: number; active: number }>();
  return async function handle(request: ApiRequest, response: ServerResponse): Promise<boolean> {
    const pathname = options.fixedRoute ?? new URL(request.url ?? '/', 'http://localhost').pathname;
    if (!['/api/generate', '/api/ai-health'].includes(pathname)) return false;
    let release: (() => void) | undefined;
    const controller = new AbortController();
    const onClose = () => { if (!response.writableEnded) controller.abort(); };
    response.once('close', onClose);
    try {
      if (pathname === '/api/ai-health') {
        if (request.method !== 'GET') { response.setHeader('Allow', 'GET'); throw new AiServiceError('METHOD_NOT_ALLOWED', 405); }
        const config = getConfig();
        sendJson(response, 200, { configured: isAiConfigured(config), model: config.model });
        return true;
      }
      if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); throw new AiServiceError('METHOD_NOT_ALLOWED', 405); }
      checkOrigin(request);
      const payload = await readBody(request);
      const now = Date.now();
      for (const [key, client] of clients) if (now - client.since > 60000 && !client.active) clients.delete(key);
      const forwarded = request.headers['x-forwarded-for'];
      const clientId = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : request.socket.remoteAddress) ?? 'local';
      const client = clients.get(clientId) ?? { since: now, count: 0, active: 0 };
      if (client.count >= (options.rateLimit ?? 12) || client.active >= 2) throw new AiServiceError('RATE_LIMITED', 429, { retryAfter: Math.max(1, Math.ceil((60000 - (now - client.since)) / 1000)) });
      if (clients.size >= 2000 && !clients.has(clientId)) throw new AiServiceError('RATE_LIMITED', 429, { retryAfter: 10 });
      client.count++; client.active++; clients.set(clientId, client);
      release = () => { client.active--; };
      const result = await generateAiCopy(payload, getConfig(), { fetcher: options.fetcher, timeoutMs: options.timeoutMs, signal: controller.signal });
      sendJson(response, 200, { data: result.data });
    } catch (error) {
      const failure = error instanceof AiServiceError ? error : new AiServiceError('UPSTREAM_ERROR', 500);
      if (failure.retryAfter) response.setHeader('Retry-After', String(failure.retryAfter));
      // Only normalized codes and request IDs are logged; upstream bodies and keys stay private.
      if (!['INVALID_REQUEST', 'CANCELLED', 'METHOD_NOT_ALLOWED', 'UNSUPPORTED_MEDIA_TYPE', 'PAYLOAD_TOO_LARGE', 'ORIGIN_NOT_ALLOWED'].includes(failure.code)) console.warn('[ai]', JSON.stringify({ code: failure.code, status: failure.status, requestId: failure.requestId }));
      sendJson(response, failure.status, { error: { code: failure.code, message: failure.message, ...(failure.requestId ? { requestId: failure.requestId } : {}), ...(failure.retryAfter ? { retryAfter: failure.retryAfter } : {}) } });
    } finally { release?.(); response.off('close', onClose); }
    return true;
  };
}
