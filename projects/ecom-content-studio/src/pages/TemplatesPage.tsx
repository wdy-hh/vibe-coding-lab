import { useMemo, useState } from 'react';
import { Check, Copy, Edit3, Layers3, Search, SlidersHorizontal, Sparkles, Tag, Trash2 } from 'lucide-react';
import type { Studio } from '../hooks/useStudio';
import type { TemplateAsset } from '../types';
import { backpackImage, cupImage, VISUAL_STYLES } from '../data/demoData';
import { EmptyState } from '../components/Common';

function TemplatePreview({ template }: { template: TemplateAsset }) {
  const visual = VISUAL_STYLES.find(style => style.id === template.visualStyle);
  return <div className={`template-art template-art-${template.visualStyle}`}><span className="art-eyebrow">E-COM STUDIO / COLLECTION</span><div className="template-art-text"><small>{visual?.subtitle}</small><strong>{template.visualStyle === 'promo-red' ? <>好物上新<br />人气之选</> : template.visualStyle === 'luxury-black' ? <>用心之选<br />质感随行</> : template.visualStyle === 'fresh-green' ? <>小小好物<br />日常欢喜</> : <>轻装上阵<br />自在通勤</>}</strong><span>{template.badgeDefault || '日常好物'}</span></div><img src={template.visualStyle === 'luxury-black' ? cupImage : backpackImage} alt="模板风格示意" /><span className="template-art-line" /></div>;
}

export function TemplatesPage({ studio, onEdit, onDelete }: { studio: Studio; onEdit: (template: TemplateAsset) => void; onDelete: (template: TemplateAsset) => void }) {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('全部');
  const tags = useMemo(() => ['全部', ...new Set(studio.state.templates.flatMap(template => template.tags))], [studio.state.templates]);
  const filtered = studio.state.templates.filter(template => (tag === '全部' || template.tags.includes(tag)) && `${template.name} ${template.tags.join(' ')} ${template.description} ${template.titleFormulaHint}`.toLowerCase().includes(search.toLowerCase().trim()));
  return <>
    <div className="page-heading"><div><div className="eyebrow"><span />YOUR CREATIVE ASSETS</div><h1>模板资产库 <span className="number-badge">{studio.state.templates.length}</span></h1><p>把有效的创作变成模板，让每一次上新都有好起点。</p></div><button className="button button-primary" onClick={() => studio.setView('studio')}><Sparkles size={16} />前往生成台创作</button></div>
    <div className="library-banner"><span className="library-banner-icon"><Layers3 size={30} strokeWidth={1.5} /></span><div><strong>一次好创作，下次直接复用。</strong><p>主图风格、标题公式、卖点语气，一起存进你的内容资产库。</p></div><span className="banner-decoration"><Copy size={56} strokeWidth={.8} /><Sparkles size={22} /></span></div>
    <div className="library-filters"><div className="filter-tags" aria-label="模板标签筛选">{tags.map(value => <button key={value} className={tag === value ? 'selected' : ''} aria-pressed={tag === value} onClick={() => setTag(value)}>{value}{value === '全部' && <span>{studio.state.templates.length}</span>}</button>)}</div><label className="search-field"><Search size={17} /><input placeholder="搜索模板名称、标签…" value={search} onChange={event => setSearch(event.target.value)} aria-label="搜索模板" /></label></div>
    <div className="results-bar"><span><SlidersHorizontal size={14} />共 {filtered.length} 个模板</span><span>你的每个灵感，都有迹可循</span></div>
    {filtered.length ? <div className="template-grid">{filtered.map(template => <article className="template-card" key={template.id}><TemplatePreview template={template} /><div className="template-card-body"><div className="template-card-title"><h2>{template.name}</h2><span className={`template-type ${template.id.startsWith('preset-') ? '' : 'is-custom'}`}>{template.id.startsWith('preset-') ? '系统精选' : '我的模板'}</span></div><div className="template-tags">{template.tags.map(value => <span key={value}>{value}</span>)}</div><div className="template-formula"><span><Tag size={13} />标题公式</span><p>{template.titleFormulaHint}</p></div><p className="template-description">{template.description}</p><div className="template-card-actions"><button className={`button ${studio.state.workspace.templateId === template.id ? 'button-soft' : 'button-secondary'}`} onClick={() => studio.applyTemplate(template.id)}>{studio.state.workspace.templateId === template.id ? <Check size={15} /> : <Sparkles size={15} />}{studio.state.workspace.templateId === template.id ? '当前使用 · 前往生成台' : '应用到生成台'}</button><button className="icon-button" aria-label={`编辑${template.name}`} title="编辑模板信息" onClick={() => onEdit(template)}><Edit3 size={16} /></button><button className="icon-button danger-hover" aria-label={`删除${template.name}`} title="删除模板" onClick={() => onDelete(template)}><Trash2 size={16} /></button></div></div></article>)}</div> : <div className="panel"><EmptyState icon={<Layers3 size={32} />} title={studio.state.templates.length ? '还没有匹配的模板' : '把第一份灵感存进来'} description={studio.state.templates.length ? '试试其他关键词或切换标签，寻找你的创作起点。' : '在生成台完成一次创作，点击「存为复用模板」，下次就能一键使用。'} action={<button className="button button-secondary" onClick={() => { setSearch(''); setTag('全部'); if (!studio.state.templates.length) studio.setView('studio'); }}>{studio.state.templates.length ? '清除筛选' : '前往生成台'}</button>} /></div>}
  </>;
}
