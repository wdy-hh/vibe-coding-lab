import { CheckCheck, Copy, FileText, Lightbulb, Plus, RefreshCw, RotateCw, Save, Sparkles, Trash2 } from 'lucide-react';
import type { Studio } from '../hooks/useStudio';
import { EmptyState, Spinner, StatusBadge } from './Common';

async function copyToClipboard(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(value); return; } catch { /* Fallback for non-secure static hosting. */ }
  }
  const previous = document.activeElement as HTMLElement | null;
  const textarea = document.createElement('textarea');
  textarea.value = value; textarea.style.position = 'fixed'; textarea.style.opacity = '0';
  document.body.appendChild(textarea); textarea.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } finally { textarea.remove(); previous?.focus(); }
  if (!copied) throw new Error('浏览器未允许复制，请选中文案后手动复制');
}

export function CopyEditor({ studio, onSaveTemplate }: { studio: Studio; onSaveTemplate: () => void }) {
  const { selected, busy } = studio;
  const generated = selected?.generated;
  const titleLength = Array.from(generated?.seoTitle ?? '').length;
  const copy = async (all: boolean) => {
    if (!generated) return;
    const value = all ? `${generated.seoTitle}\n\n${generated.sellingPoints.filter(point => point.trim()).map((point, index) => `${index + 1}. ${point}`).join('\n')}` : generated.seoTitle;
    if (!value.trim()) { studio.notify('请先填写需要复制的文案', 'error'); return; }
    try { await copyToClipboard(value); studio.notify(all ? '全部文案已复制到剪贴板' : 'SEO 标题已复制'); }
    catch (error) { studio.notify(error instanceof Error ? error.message : '复制失败，请手动复制', 'error'); }
  };
  const points = generated?.sellingPoints ?? [];
  return <section className="panel copy-panel" aria-label="文案编辑">
    <div className="panel-heading"><span className="section-symbol"><FileText size={18} /></span><h2>文案工作区</h2><span className="editable-label">自由编辑</span></div>
    {selected && generated ? <div className="copy-content">
      <div className="copy-section-heading"><label htmlFor="seo-title"><span className="mini-label">SEO</span> 商品标题</label><button className="icon-button" title="复制标题" aria-label="复制标题" onClick={() => { void copy(false); }}><Copy size={15} /></button></div>
      <textarea id="seo-title" className={`seo-input ${titleLength > 30 ? 'input-error' : ''}`} value={generated.seoTitle} maxLength={120} rows={3} disabled={busy} placeholder="生成后可在这里修改商品标题" onChange={event => studio.patchGenerated(selected.id, { seoTitle: event.target.value })} />
      <div className="title-counter"><span>建议控制在 30 字以内</span><strong className={titleLength > 30 ? 'text-error' : ''}>{titleLength}<span> / 30</span></strong></div>
      {titleLength > 30 && <p className="field-error">标题已超出电商常见 30 字上限，建议精简后使用。</p>}
      <div className="copy-section-heading selling-heading"><h3><Lightbulb size={16} />核心卖点</h3><span>{points.length} 条文案</span></div>
      <div className="selling-points">{points.map((point, index) => <div className="selling-point" key={`${selected.id}-${index}`}><div className="point-heading"><span className="point-number">{String(index + 1).padStart(2, '0')}</span><span>{['材质与工艺', '场景与体验', '价值与情绪'][index] ?? '补充卖点'}</span><div className="point-actions"><button className="icon-button" disabled={busy} aria-label={`重新生成第${index + 1}条卖点`} title="换一种表达" onClick={() => { void studio.generate(index); }}><RotateCw size={13} /></button><button className="icon-button danger-hover" disabled={busy} aria-label={`删除第${index + 1}条卖点`} title="删除卖点" onClick={() => studio.patchGenerated(selected.id, { sellingPoints: points.filter((_, position) => position !== index) })}><Trash2 size={13} /></button></div></div><textarea aria-label={`第${index + 1}条卖点文案`} value={point} disabled={busy} maxLength={500} rows={3} onChange={event => studio.patchGenerated(selected.id, { sellingPoints: points.map((value, position) => position === index ? event.target.value : value) })} /></div>)}</div>
      <button className="add-point" disabled={busy || points.length >= 8} onClick={() => studio.patchGenerated(selected.id, { sellingPoints: [...points, ''] })}><Plus size={14} />{points.length >= 8 ? '最多添加 8 条卖点' : '添加一条卖点'}</button>
      <div className="copy-actions"><button className="button button-secondary" disabled={busy || !generated.seoTitle.trim()} onClick={() => { void copy(true); }}><Copy size={15} />一键复制全部文案</button><button className="button button-secondary regenerate-copy" disabled={busy} onClick={() => { void studio.generate('copy'); }}>{busy ? <Spinner size={15} /> : <RefreshCw size={15} />}重新生成文案</button></div>
      <div className="copy-divider" />
      <button className="button save-template-button" disabled={busy} onClick={onSaveTemplate}><Save size={16} />存为复用模板<span>保存好灵感</span></button>
      <button className={`button approve-button ${selected.status === 'approved' ? 'is-approved' : ''}`} disabled={busy || selected.status === 'approved'} onClick={studio.approve}><CheckCheck size={17} />{selected.status === 'approved' ? '当前商品已定稿' : '标记为已定稿'}</button>
      <p className="copy-note"><Sparkles size={12} />好的文案，来自你的最后一点灵感</p>
    </div> : <div className="copy-empty">{selected && <StatusBadge status={selected.status} />}<EmptyState icon={<FileText size={30} />} title="好文案，即将就绪" description="补全商品信息并点击生成，SEO 标题与核心卖点会出现在这里，随时可以自由修改。" action={selected ? <button className="button button-secondary" disabled={busy} onClick={() => { void studio.generate(); }}>{busy ? <Spinner size={16} /> : <Sparkles size={16} />}生成商品文案</button> : undefined} /></div>}
  </section>;
}
