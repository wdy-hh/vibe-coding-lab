import type { ServerResponse } from 'node:http';
import { createAiHandler } from '../server/httpHandler.ts';
import type { ApiRequest } from '../server/httpHandler.ts';

const handle = createAiHandler(undefined, { fixedRoute: '/api/generate' });
export default async function generate(request: ApiRequest, response: ServerResponse): Promise<void> { await handle(request, response); }
