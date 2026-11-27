import { useEffect, useRef, useState } from 'react';
import { Check, Download, Image, Maximize2, ScanLine, Sparkles } from 'lucide-react';
import type { Studio } from '../hooks/useStudio';
import { VISUAL_STYLES } from '../data/demoData';
import { exportPoster, renderProductPoster } from '../utils/canvasRenderer';
import { EmptyState, Modal, Spinner } from './Common';

export function PosterPreview({ studio }: { studio: Studio }) {
  const { selected, busy } = studio;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expandedUrl, setExpandedUrl] = useState('');
  const style = selected?.generated?.visualStyle ?? studio.activeTemplate?.visualStyle ?? 'minimal-white';
  useEffect(() => {
    if (!selected || !canvasRef.current) return;
    let cancelled = false;
    const offscreen = document.createElement('canvas');
    setRendering(true); setRenderError('');
    renderProductPoster(offscreen, selected, style).then(() => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = canvas.height = 800;
      canvas.getContext('2d')?.drawImage(offscreen, 0, 0);
    }).catch(error => { if (!cancelled) setRenderError(error instanceof Error ? error.message : '画布渲染失败'); }).finally(() => { if (!cancelled) setRendering(false); });
    return () => { cancelled = true; };
  }, [selected?.id, selected?.name, selected?.imageUrl, selected?.highlights, selected?.badgeText, selected?.generated?.posterTitle, style]);
  const exportImage = async () => {
    if (!selected || exporting || busy) return;
    if (!selected.imageUrl) { studio.notify('请先上传商品图片再导出主图', 'error'); return; }
    setExporting(true);
    try { await exportPoster(selected); studio.notify('800 × 800 高清主图已导出'); }
    catch (error) { studio.notify(error instanceof Error ? error.message : '导出失败，请重试', 'error'); }
    finally { setExporting(false); }
  };
  return <section className="panel poster-panel" aria-label="实时主图预览">
    <div className="panel-heading"><span className="section-symbol"><ScanLine size={18} /></span><h2>主图设计</h2><span className="live-label"><span />实时预览</span></div>
    {selected ? <>
      <div className="canvas-area"><div className="canvas-toolbar"><span><Image size={13} />商品主图</span><span>1:1 <span className="toolbar-dot">·</span> 800 × 800 px</span></div>
        <div className="canvas-wrap"><canvas ref={canvasRef} width={800} height={800} role="img" aria-label={`${selected.name || '商品'}的800乘800主图预览`} />
          {rendering && <div className="canvas-loading" aria-live="polite"><Spinner size={21} /><span>正在更新画布…</span></div>}
          {selected.status === 'generating' && <div className="canvas-generation-label" aria-live="polite"><Spinner size={15} /><span>{studio.aiMode === 'real' ? 'AI 生成中，当前预览已保留' : '正在生成模拟素材…'}</span></div>}
          {renderError && <div className="canvas-error" role="alert">{renderError}</div>}
          <button className="canvas-expand" title="查看原尺寸主图" aria-label="放大查看主图" disabled={rendering || !!renderError} onClick={() => { if (canvasRef.current) { setExpandedUrl(canvasRef.current.toDataURL('image/png')); setExpanded(true); } }}><Maximize2 size={15} /></button>
        </div><div className="canvas-caption"><span>所见即所得，导出高清原图</span><span className="resolution-tag">PNG</span></div>
      </div>
      <div className="poster-controls"><div className="control-section-label"><h3>选择视觉风格</h3><span>4 套精选设计</span></div>
        <div className="style-grid">{VISUAL_STYLES.map(visual => <button key={visual.id} className={`style-option ${style === visual.id ? 'selected' : ''}`} aria-label={visual.name} aria-pressed={style === visual.id} disabled={busy} onClick={() => studio.patchGenerated(selected.id, { visualStyle: visual.id })}><span className={`style-swatch swatch-${visual.id}`}><span className="swatch-bar" /><span className="swatch-product" /><span className="swatch-line" />{style === visual.id && <span className="swatch-check"><Check size={10} /></span>}</span><strong>{visual.short}</strong></button>)}</div>
        <div className="control-section-label fine-tune-heading"><h3>主图文案微调</h3><span>输入即更新</span></div>
        <fieldset disabled={busy}><label className="field-label" htmlFor="poster-title">主图大字短标题 <span>{Array.from(selected.generated?.posterTitle ?? '').length} / 建议 6–12 字</span></label><input id="poster-title" maxLength={80} value={selected.generated?.posterTitle ?? ''} placeholder="如：轻装上阵，自在通勤" onChange={event => studio.patchGenerated(selected.id, { posterTitle: event.target.value })} />
          <label className="field-label" htmlFor="poster-badge">利益点角标 <span>建议 12 字以内</span></label><input id="poster-badge" value={selected.badgeText} maxLength={30} placeholder="如：新品立减50" onChange={event => studio.patchProduct(selected.id, { badgeText: event.target.value })} /></fieldset>
        <button className="button button-dark export-button" disabled={busy || exporting || rendering || !!renderError || !selected.imageUrl} onClick={() => { void exportImage(); }}>{exporting ? <Spinner size={17} /> : <Download size={17} />}{exporting ? '正在导出…' : '一键导出高清主图 PNG'}<span>800 × 800</span></button>
      </div>
    </> : <div className="canvas-empty"><EmptyState icon={<Sparkles size={32} />} title="下一张好主图，从这里开始" description="添加你的商品，或加载示例批次，体验从商品信息到完整素材的创作流程。" action={<button className="button button-primary" onClick={studio.loadDemo}><Sparkles size={16} />一键加载 3 款示例商品体验</button>} /></div>}
    {expanded && <Modal title="高清主图预览" description="800 × 800 px · PNG" onClose={() => setExpanded(false)} className="image-modal"><img src={expandedUrl} alt={`${selected?.name}主图原尺寸预览`} className="expanded-poster" /></Modal>}
  </section>;
}
