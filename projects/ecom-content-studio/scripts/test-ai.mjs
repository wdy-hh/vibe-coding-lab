import { readLocalEnv } from './local-env.mjs';
import { AiServiceError, generateAiCopy, readAiConfiguration, isAiConfigured } from '../server/aiService.ts';

try {
  const local = await readLocalEnv();
  if (!local && !process.env.AIOP_API_KEY) throw new Error('未找到 .env.local。请复制 .env.example 为 .env.local，并填写服务端密钥。');
  const config = readAiConfiguration({ ...local, ...process.env });
  if (!isAiConfigured(config)) throw new Error('AI 配置不完整。请检查 AIOP_BASE_URL、AIOP_MODEL_ID 和 AIOP_API_KEY；不要使用 VITE_ 前缀。');
  console.log('正在验证 GLM-5.3-Flash；仅向已配置的 AI 服务发送固定测试商品，密钥不会输出。');
  const result = await generateAiCopy({ action: 'full', product: { name: '轻量防泼水通勤双肩包', category: '箱包配饰', material: '黑色尼龙', specs: '黑色 15.6寸', audience: '职场通勤人群', highlights: '独立电脑仓、轻量收纳', badgeText: '' }, template: { name: '极简都市通勤', copyTone: 'minimal', titleFormulaHint: '材质关键词 + 商品名 + 使用场景' } }, config);
  console.log(JSON.stringify({ httpStatus: result.meta.httpStatus, elapsedMs: result.meta.elapsedMs, usage: result.meta.usage ?? null, requestId: result.meta.requestId ?? null, result: result.data }, null, 2));
} catch (error) {
  if (error instanceof AiServiceError) {
    console.error(JSON.stringify({ httpStatus: error.status, code: error.code, message: error.message, requestId: error.requestId ?? null }, null, 2));
    if (error.code === 'UNAUTHORIZED') console.error('排查：确认密钥完整、模型 ID 对应 GLM-5.3-Flash，并且当前账号有调用权限。');
    if (error.code === 'RATE_LIMITED') console.error('排查：等待几秒后重新运行，避免多个终端同时请求。');
    if (['TIMEOUT', 'NETWORK_ERROR'].includes(error.code)) console.error('排查：确认网络可访问学校 AI 服务；如有校园网或 VPN 访问要求，请在满足条件后重试。');
    if (error.code === 'INVALID_AI_RESPONSE') console.error('排查：模型没有返回符合格式与字数要求的完整 JSON，可重新运行一次。');
  } else console.error(error instanceof Error ? error.message : '测试失败，请检查本地配置。');
  process.exitCode = 1;
}
