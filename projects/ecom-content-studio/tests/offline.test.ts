import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { createServiceWorkerSource } from '../scripts/service-worker.mjs';

function workerHarness({ online = true, varyAssets = false } = {}) {
  const scope = 'https://studio.test/shop/';
  const prefix = `ecom-studio-v1:${scope}:`;
  const stores = new Map<string, Map<string, Response>>();
  const events: Record<string, (event: any) => void> = {};
  const urlOf = (request: Request | string) => typeof request === 'string' ? request : request.url;
  const calls: Request[] = [];
  const caches = {
    open: async (name: string) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const data = stores.get(name)!;
      return { match: async (request: Request | string) => data.get(urlOf(request)), addAll: async (requests: Request[]) => { calls.push(...requests); for (const request of requests) data.set(request.url, new Response('preloaded')); } };
    },
    match: async (request: Request | string, options?: { ignoreVary?: boolean }) => {
      if (varyAssets && urlOf(request).includes('/assets/') && !options?.ignoreVary) return undefined;
      for (const data of stores.values()) if (data.has(urlOf(request))) return data.get(urlOf(request));
      return undefined;
    },
    keys: async () => [...stores.keys()],
    delete: async (name: string) => stores.delete(name),
  };
  runInNewContext(createServiceWorkerSource('current', ['./', './index.html', './assets/current.js']), {
    self: { registration: { scope }, location: { origin: 'https://studio.test' }, addEventListener: (name: string, handler: (event: any) => void) => { events[name] = handler; }, clients: { claim: async () => {} }, skipWaiting: async () => {} },
    caches, URL, Request, Response, AbortController, setTimeout, clearTimeout,
    fetch: async () => { if (!online) throw new Error('offline'); return new Response('fresh HTML'); },
  });
  const navigate = (query = '') => new Promise<Response>(resolve => events.fetch({ request: { url: scope + query, method: 'GET', mode: 'navigate' }, respondWith: (response: Promise<Response>) => resolve(response) }));
  const asset = (name: string) => new Promise<Response>(resolve => events.fetch({ request: { url: scope + name, method: 'GET', mode: 'cors' }, respondWith: (response: Promise<Response>) => resolve(response) }));
  const intercepts = (name: string) => { let handled = false; events.fetch({ request: { url: scope + name, method: 'GET', mode: 'cors' }, respondWith: () => { handled = true; } }); return handled; };
  const lifecycle = (name: string) => new Promise<void>(resolve => events[name]({ waitUntil: (work: Promise<void>) => { work.then(resolve); } }));
  return { stores, prefix, scope, calls, navigate, asset, intercepts, lifecycle };
}

test('online navigation fetches fresh HTML rather than a stale bundle manifest', async () => {
  const worker = workerHarness();
  worker.stores.set(worker.prefix + 'current', new Map([[worker.scope, new Response('stale HTML')]]));
  assert.equal(await (await worker.navigate()).text(), 'fresh HTML');
});

test('offline navigation serves the cached entry for query URLs too', async () => {
  const worker = workerHarness({ online: false });
  worker.stores.set(worker.prefix + 'current', new Map([[worker.scope + 'index.html', new Response('offline HTML')]]));
  assert.equal(await (await worker.navigate('?batch=1')).text(), 'offline HTML');
});

test('activation retains previous assets and only cleans caches belonging to this app scope', async () => {
  const worker = workerHarness();
  for (const name of ['very-old', 'previous', 'current']) worker.stores.set(worker.prefix + name, new Map());
  worker.stores.set('another-app', new Map());
  await worker.lifecycle('activate');
  assert.equal(worker.stores.has(worker.prefix + 'very-old'), false);
  assert.equal(worker.stores.has(worker.prefix + 'previous'), true);
  assert.equal(worker.stores.has('another-app'), true);
});

test('precache bypasses HTTP cache and resolves assets under a deployment subpath', async () => {
  const worker = workerHarness();
  await worker.lifecycle('install');
  assert.equal(worker.calls.length, 3);
  assert.equal(worker.calls[2].url, worker.scope + 'assets/current.js');
  assert.ok(worker.calls.every(request => request.cache === 'reload'));
});

test('offline module requests find precached assets even when Origin headers vary', async () => {
  const worker = workerHarness({ online: false, varyAssets: true });
  worker.stores.set(worker.prefix + 'current', new Map([[worker.scope + 'assets/current.js', new Response('cached script')]]));
  assert.equal(await (await worker.asset('assets/current.js')).text(), 'cached script');
});

test('AI health requests bypass service-worker caches', () => {
  const worker = workerHarness();
  assert.equal(worker.intercepts('api/ai-health'), false);
});
