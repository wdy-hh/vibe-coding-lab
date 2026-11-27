import { loadEnv } from 'vite';
import type { Plugin, Connect } from 'vite';
import { createAiHandler } from './httpHandler.ts';
import { readAiConfiguration } from './aiService.ts';

export function aiPlugin(): Plugin {
  let env: Record<string, string> = {};
  const install = (middlewares: Connect.Server) => {
    const handle = createAiHandler(() => readAiConfiguration(env));
    middlewares.use((request, response, next) => {
      void handle(request, response).then(handled => { if (!handled) next(); }).catch(() => {
        if (!response.writableEnded) { response.statusCode = 500; response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ error: { code: 'UPSTREAM_ERROR', message: 'AI 服务暂时不可用，请稍后重试。' } })); }
      });
    });
  };
  return {
    name: 'ecom-ai-server-proxy',
    configResolved(config) { env = loadEnv(config.mode, config.root, ''); },
    configureServer(server) { install(server.middlewares); },
    configurePreviewServer(server) { install(server.middlewares); },
  };
}
