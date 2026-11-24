import { useState } from 'react';
import { AlertTriangle, Check, Layers3, Save, Sparkles } from 'lucide-react';
import type { Studio } from '../hooks/useStudio';
import type { CopyTone, TemplateAsset, VisualStyleId } from '../types';
import { createId } from '../utils/id';
import { Modal } from './Common';
import { VISUAL_STYLES } from '../data/demoData';

export function TemplateDialog({ studio, template, onClose }: { studio: Studio; template?: TemplateAsset; onClose: () => void }) {
  const [name, setName] = useState(template?.name ?? '');
  const [tags, setTags] = useState(template?.tags.join('、') ?? '通勤日用');
  const [tone, setTone] = useState<CopyTone>(template?.copyTone ?? studio.activeTemplate?.copyTone ?? 'lifestyle');
  const [style, setStyle] = useState<VisualStyleId>(template?.visualStyle ?? studio.selected?.generated?.visualStyle ?? 'minimal-white');
  const [formula, setFormula] = useState(template?.titleFormulaHint ?? studio.activeTemplate?.titleFormulaHint ?? '商品名 + 材质关键词 + 使用场景');
  const [description, setDescription] = useState(template?.description ?? studio.activeTemplate?.description ?? '从材质、使用场景与生活价值切入，表达自然、具体。');
  const [error, setError] = useState('');
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) { setError('请为模板填写一个名称'); return; }
    if (!formula.trim() || !description.trim()) { setError('请补全标题公式和卖点风格说明'); return; }
    studio.saveTemplate({ id: template?.id ?? createId('template'), name: name.trim(), tags: [...new Set(tags.split(/[、,，;；]+/).map(value => value.trim()).filter(Boolean))].slice(0, 6), copyTone: tone, visualStyle: style, badgeDefault: template?.badgeDefault ?? studio.selected?.badgeText ?? '', titleFormulaHint: formula.trim(), description: description.trim(), createdAt: template?.createdAt ?? new Date().toISOString() });
    onClose();
  };
  return <Modal title={template ? '编辑模板信息' : '把好灵感，存为复用模板'} description="视觉风格、标题结构与卖点语气，下次一键调用。" onClose={onClose}><form onSubmit={save} noValidate className="dialog-form"><label className="field-label" htmlFor="template-name">模板名称 <i>*</i></label><input id="template-name" data-autofocus value={name} maxLength={40} placeholder="如：春夏通勤新品模板" onChange={event => { setName(event.target.value); setError(''); }} />
    <label className="field-label" htmlFor="template-tags">模板标签</label><input id="template-tags" value={tags} maxLength={120} placeholder="使用顿号或逗号分隔，如：通勤日用、极简质感" onChange={event => setTags(event.target.value)} /><p className="field-help">最多保留 6 个标签，方便快速筛选。</p>
    <div className="dialog-two-columns"><div><label className="field-label" htmlFor="template-style">主图视觉风格</label><select id="template-style" value={style} onChange={event => setStyle(event.target.value as VisualStyleId)}>{VISUAL_STYLES.map(visual => <option value={visual.id} key={visual.id}>{visual.name}</option>)}</select></div><div><label className="field-label" htmlFor="template-tone">文案语气</label><select id="template-tone" value={tone} onChange={event => setTone(event.target.value as CopyTone)}><option value="promo">大促冲量型</option><option value="minimal">极简质感型</option><option value="lifestyle">生活种草型</option><option value="professional">专业参数型</option></select></div></div>
    <label className="field-label" htmlFor="template-formula">标题公式 <i>*</i></label><input id="template-formula" value={formula} maxLength={120} onChange={event => setFormula(event.target.value)} /><p className="field-help">可用字段：商品名、材质关键词、使用场景、核心功能、颜色规格、目标人群。用 + 连接。</p>
    <label className="field-label" htmlFor="template-description">卖点风格说明 <i>*</i></label><textarea id="template-description" value={description} maxLength={300} rows={3} onChange={event => setDescription(event.target.value)} />{error && <p className="field-error" role="alert">{error}</p>}
    <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>取消</button><button type="submit" className="button button-primary"><Layers3 size={16} />保存模板</button></div></form></Modal>;
}

export function BatchDialog({ studio, onClose }: { studio: Studio; onClose: () => void }) {
  const [name, setName] = useState(studio.state.workspace.batchName);
  const [error, setError] = useState('');
  return <Modal title="保存当前批次" description="商品信息、主图设置与编辑文案会一起保存在历史草稿箱。" onClose={onClose}><form className="dialog-form" noValidate onSubmit={event => { event.preventDefault(); if (!name.trim()) { setError('请输入批次名称'); return; } studio.saveBatch(name); onClose(); }}><label className="field-label" htmlFor="batch-name">批次名称 <i>*</i></label><input id="batch-name" data-autofocus value={name} maxLength={60} onChange={event => { setName(event.target.value); setError(''); }} placeholder="如：双十一测款 · 第一批" />{error && <p className="field-error">{error}</p>}<div className="batch-save-summary"><Check size={17} /><span>包含 {studio.state.workspace.items.length} 款商品 · {studio.state.workspace.items.filter(item => item.status === 'approved').length} 款已定稿</span></div><div className="modal-actions"><button className="button button-secondary" type="button" onClick={onClose}>取消</button><button className="button button-primary" type="submit"><Save size={16} />保存到历史</button></div></form></Modal>;
}

export function ConfirmDialog({ title, description, actionLabel = '确认', danger = false, onConfirm, onClose }: { title: string; description: string; actionLabel?: string; danger?: boolean; onConfirm: () => void; onClose: () => void }) {
  return <Modal title={title} onClose={onClose} className="confirm-modal"><div className="confirm-content"><span className={danger ? 'confirm-symbol danger' : 'confirm-symbol'}><AlertTriangle size={24} /></span><p>{description}</p></div><div className="modal-actions"><button className="button button-secondary" onClick={onClose}>取消</button><button className={`button ${danger ? 'button-danger' : 'button-primary'}`} onClick={() => { onConfirm(); onClose(); }}>{actionLabel}</button></div></Modal>;
}

export function HelpDialog({ onClose }: { onClose: () => void }) {
  return <Modal title="你的第一批好内容，从这里开始" description="三个步骤，完成一次商品内容创作。" onClose={onClose}><div className="help-steps"><div><span>1</span><section><h3>准备商品</h3><p>加载 3 款示例商品，或新建商品 / 导入 CSV。填写名称、类目并上传本地图片。</p></section></div><div><span>2</span><section><h3>生成与打磨</h3><p>选择文案模板，生成当前商品或批量生成。试试 4 套视觉风格，再微调标题、角标与卖点。</p></section></div><div><span>3</span><section><h3>导出与积累</h3><p>导出 800×800 PNG、复制文案，将好方案存为模板。保存批次后可从草稿箱继续编辑。</p></section></div></div><div className="help-note"><Sparkles size={17} /><p>这是纯前端模拟创作工具，数据保存在当前浏览器。清除浏览器站点数据会删除本地草稿。</p></div><div className="modal-actions"><button className="button button-primary" onClick={onClose}>开始创作</button></div></Modal>;
}
