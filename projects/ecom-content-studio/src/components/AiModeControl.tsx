import { RefreshCw, Sparkles, Square } from 'lucide-react';
import type { Studio } from '../hooks/useStudio';
import { Spinner } from './Common';

export function AiModeControl({ studio }: { studio: Studio }) {
  const { aiAvailability, aiMode, aiChecking, busy } = studio;
  const ready = aiAvailability.status === 'ready';
  const title = aiChecking ? '正在检测 AI 服务' : aiMode === 'real' ? '真实 AI · GLM-5.3-Flash' : ready ? '本地模拟演示模式' : aiAvailability.status === 'unconfigured' ? '模拟演示 · AI 尚未配置' : '模拟演示 · 当前站点未连接 AI 服务';
  const description = aiChecking ? '检测完成后会自动选择可用模式。' : aiMode === 'real' ? '仅发送商品文字资料，图片本地合成。生成约需半分钟至一分钟，可随时停止。' : ready ? '使用本地规则生成，不消耗 AI 额度，适合快速体验。' : '演示功能可完整使用。配置本地或线上 AI 服务后，点击重新检测。';
  return <section className={`ai-mode-bar ${aiMode === 'real' ? 'is-real' : ''}`} aria-label="AI 生成模式">
    <span className="ai-mode-icon">{aiChecking ? <Spinner size={20} /> : <Sparkles size={20} />}</span>
    <div className="ai-mode-description"><strong role="status">{title}</strong><p>{description}</p></div>
    <div className="ai-mode-actions">
      {busy && <button className="button stop-generation" onClick={studio.cancelGeneration}><Square size={13} />停止生成</button>}
      <div className="ai-mode-toggle" role="group" aria-label="选择生成模式">
        <button aria-pressed={aiMode === 'real'} disabled={busy || !ready} onClick={() => studio.changeAiMode('real')}>真实 AI</button>
        <button aria-pressed={aiMode === 'mock'} disabled={busy} onClick={() => studio.changeAiMode('mock')}>模拟模式</button>
      </div>
      <button className="icon-button" disabled={busy || aiChecking} aria-label="重新检测 AI 服务" title="重新检测 AI 服务" onClick={studio.refreshAiHealth}><RefreshCw size={16} /></button>
    </div>
  </section>;
}
