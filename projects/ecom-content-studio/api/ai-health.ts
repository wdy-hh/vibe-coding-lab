import type { ServerResponse } from 'node:http';
import { createAiHandler } from '../server/httpHandler.ts';
import type { ApiRequest } from '../server/httpHandler.ts';

const handle = createAiHandler(undefined, { fixedRoute: '/api/ai-health' });
export default async function health(request: ApiRequest, response: ServerResponse): Promise<void> { await handle(request, response); }
