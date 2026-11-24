import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ImagePlus, Layers3, Package, Plus, Sparkles, Trash2, Upload, X } from 'lucide-react';
import type { Studio } from '../hooks/useStudio';
import { CATEGORIES } from '../data/demoData';
import { Spinner, StatusBadge } from './Common';

export function ProductEditor({ studio }: { studio: Studio }) {
  const { state, selected, busy, errors } = studio;
  const [moreOpen, setMoreOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [readingImage, setReadingImage] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  useEffect(() => { setUploadError(''); setDragging(false); }, [selected?.id]);

  const handleImage = async (file?: File) => {
    if (!file || !selected || busy) return;
    setUploadError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { const message = '请选择 JPG、PNG 或 WebP 格式的图片'; setUploadError(message); studio.notify(message, 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { const message = '图片不能超过 5 MB，请压缩后重新上传'; setUploadError(message); studio.notify(message, 'error'); return; }
    const id = selected.id;
    setReadingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('图片读取失败，请重新选择')); reader.readAsDataURL(file); });
      await new Promise<void>((resolve, reject) => { const image = new Image(); image.onload = () => image.naturalWidth && image.naturalHeight ? resolve() : reject(new Error('图片尺寸无效')); image.onerror = () => reject(new Error('图片文件已损坏，请重新选择')); image.src = dataUrl; });
      studio.patchProduct(id, { imageUrl: dataUrl });
      studio.notify('商品图片已上传，主图已更新');
    } catch (error) { const message = error instanceof Error ? error.message : '上传失败，请重试'; setUploadError(message); studio.notify(message, 'error'); }
    finally { setReadingImage(false); }
  };
  const field = (key: 'name' | 'category' | 'material' | 'specs' | 'audience' | 'highlights' | 'badgeText', value: string) => { if (selected) studio.patchProduct(selected.id, { [key]: value }); };

  return <section className="panel product-panel" aria-label="商品录入">
    <div className="panel-heading"><span className="section-symbol"><Package size={18} /></span><h2>商品信息</h2><span className="subtle-count">{state.workspace.items.length} 款商品</span><button className="icon-button" disabled={busy} title="新建空白商品" aria-label="新建空白商品" onClick={studio.addProduct}><Plus size={17} /></button></div>
    <div className="product-queue" aria-label="当前批次商品队列">{state.workspace.items.map((item, index) => <div className={`queue-row ${item.id === selected?.id ? 'is-selected' : ''}`} key={item.id}>
      <button className="queue-select" disabled={busy} onClick={() => { setUploadError(''); studio.selectProduct(item.id); }} aria-pressed={item.id === selected?.id}>
        <span className={`queue-thumb thumb-${index % 3}`}>{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <ImagePlus size={22} />}</span>
        <span className="queue-info"><strong>{item.name || '未命名商品'}</strong><StatusBadge status={item.status} /></span>
      </button><button className="queue-delete icon-button" disabled={busy} title={`删除${item.name || '商品'}`} aria-label={`删除${item.name || '未命名商品'}`} onClick={() => studio.deleteProduct(item.id)}><X size={14} /></button>
    </div>)}{!state.workspace.items.length && <div className="queue-empty">还没有商品，添加一个开始吧</div>}</div>
    {selected ? <div className="product-form" key={selected.id}>
      <div className="form-section-title"><span>基础信息</span><small><i /> 为必填项</small></div>
      <fieldset disabled={busy || readingImage}>
        <label className="field-label" htmlFor="product-name">商品名称 <i>*</i></label>
        <input id="product-name" className={errors.name ? 'input-error' : ''} value={selected.name} maxLength={100} placeholder="如：轻量防泼水通勤双肩包" onChange={event => field('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
        {errors.name && <p className="field-error" id="name-error">{errors.name}</p>}
        <label className="field-label" htmlFor="product-category">商品类目 <i>*</i></label>
        <select id="product-category" value={selected.category} className={errors.category ? 'input-error' : ''} onChange={event => field('category', event.target.value)} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? 'category-error' : undefined}><option value="">请选择商品类目</option>{!CATEGORIES.includes(selected.category) && selected.category && <option value={selected.category}>{selected.category}</option>}{CATEGORIES.map(category => <option key={category}>{category}</option>)}</select>
        {errors.category && <p className="field-error" id="category-error">{errors.category}</p>}
        <label className="field-label" htmlFor="product-image">商品图片 <i>*</i><span>本地上传</span></label>
        <input className="sr-only" id="product-image" ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { void handleImage(event.target.files?.[0]); event.target.value = ''; }} />
        <div className={`upload-area ${dragging ? 'is-dragging' : ''} ${errors.imageUrl || uploadError ? 'input-error' : ''}`} onDragOver={event => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); void handleImage(event.dataTransfer.files[0]); }}>
          {selected.imageUrl ? <><button className="uploaded-image" type="button" onClick={() => imageInput.current?.click()} aria-label="替换商品图片"><img src={selected.imageUrl} alt={selected.name || '商品图片'} /></button><div className="uploaded-details"><strong>商品原图</strong><span>已就绪 · 本地图片</span><button className="text-button" onClick={() => imageInput.current?.click()}><Upload size={13} />替换图片</button></div><button className="icon-button remove-image" title="移除图片" aria-label="移除图片" onClick={() => studio.patchProduct(selected.id, { imageUrl: '' })}><Trash2 size={14} /></button></> : <button className="upload-empty" type="button" onClick={() => imageInput.current?.click()}>{readingImage ? <Spinner size={24} /> : <ImagePlus size={24} />}<strong>点击上传<span> 或拖拽图片到这里</span></strong><small>支持 JPG / PNG / WebP，最大 5 MB</small></button>}
        </div>
        {(errors.imageUrl || uploadError) && <p className="field-error">{uploadError || errors.imageUrl}</p>}
        {selected.imageUrl && <p className="field-help">JPG / PNG / WebP · 最大 5 MB · 支持拖拽替换</p>}
        <button className="more-toggle" type="button" aria-expanded={moreOpen} onClick={() => setMoreOpen(!moreOpen)}>更多商品参数 <span>让生成更精准</span>{moreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
        {moreOpen && <div className="more-fields">
          <label className="field-label" htmlFor="material">商品材质</label><input id="material" value={selected.material} maxLength={100} placeholder="如：哑光高密尼龙" onChange={event => field('material', event.target.value)} />
          <label className="field-label" htmlFor="specs">颜色 / 规格</label><input id="specs" value={selected.specs} maxLength={100} placeholder="如：曜石黑 15.6寸" onChange={event => field('specs', event.target.value)} />
          <label className="field-label" htmlFor="audience">目标人群</label><input id="audience" value={selected.audience} maxLength={100} placeholder="如：职场通勤、大学生" onChange={event => field('audience', event.target.value)} />
          <label className="field-label" htmlFor="highlights">核心亮点关键词</label><textarea id="highlights" value={selected.highlights} maxLength={500} rows={3} placeholder="用顿号或逗号分隔，如：轻盈、独立电脑仓" onChange={event => field('highlights', event.target.value)} />
          <label className="field-label" htmlFor="badge-parameter">大促利益点角标</label><input id="badge-parameter" value={selected.badgeText} maxLength={30} placeholder="如：新品首发" onChange={event => field('badgeText', event.target.value)} />
        </div>}
        <div className="template-select-label"><label className="field-label" htmlFor="template-select"><Layers3 size={14} />文案生成模板</label><span>可复用</span></div>
        <select id="template-select" value={state.workspace.templateId} onChange={event => studio.applyTemplate(event.target.value)}><option value="">系统默认生成</option>{state.templates.map(template => <option value={template.id} key={template.id}>{template.name}</option>)}</select>
      </fieldset>
      <button className="button button-primary generate-button" onClick={() => { void studio.generate(); }} disabled={busy || readingImage}>{busy ? <Spinner /> : <Sparkles size={17} />}{busy ? '正在生成素材…' : '生成当前商品素材'}</button>
      <p className="generation-note">模拟智能生成 · 支持自由编辑与导出</p>
    </div> : <div className="product-form"><button className="button button-primary full-width" onClick={studio.addProduct}><Plus size={16} />添加第一个商品</button></div>}
  </section>;
}
