export type CopyTone = 'promo' | 'minimal' | 'lifestyle' | 'professional';
export type AiMode = 'real' | 'mock';
export type AiErrorCode = 'NOT_CONFIGURED' | 'UNAUTHORIZED' | 'RATE_LIMITED' | 'TIMEOUT' | 'NETWORK_ERROR' | 'INVALID_AI_RESPONSE' | 'UPSTREAM_ERROR' | 'INVALID_REQUEST' | 'PAYLOAD_TOO_LARGE' | 'METHOD_NOT_ALLOWED' | 'UNSUPPORTED_MEDIA_TYPE' | 'ORIGIN_NOT_ALLOWED' | 'CANCELLED';

export interface GenerateApiRequest {
  action: 'full' | 'regen_point';
  product: { name: string; category: string; material?: string; specs?: string; audience?: string; highlights?: string; badgeText?: string };
  template?: { name: string; copyTone: CopyTone; titleFormulaHint?: string };
  targetPointIndex?: number;
  existingPoints?: string[];
}

export interface FullCopyResult { seoTitle: string; posterTitle: string; sellingPoints: string[]; warnings: string[] }
export interface SellingPointResult { sellingPoint: string }
export interface AiErrorInfo { code: AiErrorCode; message: string; retryAfter?: number; requestId?: string }
export interface AiHealth { configured: boolean; model: string }

export const AI_ERROR_MESSAGES: Record<AiErrorCode, string> = {
  NOT_CONFIGURED: '真实 AI 尚未配置，请检查服务端环境变量（本地为 .env.local），或切换模拟模式。',
  UNAUTHORIZED: 'AI 密钥无效或没有此模型的调用权限，请检查服务端配置后重试。',
  RATE_LIMITED: '请求过于频繁，AI 接口暂时限流，请稍等几秒后重试。',
  TIMEOUT: 'AI 生成超时，商品信息已保留。请重试或切换模拟模式继续体验。',
  NETWORK_ERROR: 'AI 服务暂时连接不上，请检查网络，或切换模拟模式继续体验。',
  INVALID_AI_RESPONSE: 'AI 返回内容格式异常，商品信息已保留，请点击重试。',
  UPSTREAM_ERROR: 'AI 服务暂时不可用，商品信息已保留，请稍后重试。',
  INVALID_REQUEST: '商品资料不完整或超出长度限制，请检查后重试。',
  PAYLOAD_TOO_LARGE: '商品文字资料过长，请精简后重试。图片无需发送给 AI。',
  METHOD_NOT_ALLOWED: '当前请求方式不受支持，请刷新页面后重试。',
  UNSUPPORTED_MEDIA_TYPE: '请求格式不正确，请刷新页面后重试。',
  ORIGIN_NOT_ALLOWED: '请从工作台所在的网站发起生成请求。',
  CANCELLED: '本次生成已取消，商品信息已保留。',
};
