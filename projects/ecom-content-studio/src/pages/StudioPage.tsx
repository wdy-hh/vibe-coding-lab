import { useRef, useState } from 'react';
import { AlertCircle, Check, ChevronDown, Download, FileSpreadsheet, FolderOpen, Layers3, Plus, Save, Sparkles, Upload, X } from 'lucide-react';
import type { Studio } from '../hooks/useStudio';
import { downloadCsvTemplate, importProducts } from '../utils/csvHelper';
import { ProductEditor } from '../components/ProductEditor';
import { PosterPreview } from '../components/PosterPreview';
import { CopyEditor } from '../components/CopyEditor';
import { Spinner } from '../components/Common';

export function StudioPage({ studio, onSaveBatch, onSaveTemplate, onLoadDemo }: { studio: Studio; onSaveBatch: () => void; onSaveTemplate: () => void; onLoadDemo: () => void }) {
  const csvInput = useRef<HTMLInputElement>(null);
  const [csvError, setCsvError] = useState('');
  const [importing, setImporting] = useState(false);
  const [csvMenuOpen, setCsvMenuOpen] = useState(false);
  const generated = studio.state.workspace.items.filter(item => item.status === 'generated' || item.status === 'approved').length;
  const approved = studio.state.workspace.items.filter(item => item.status === 'approved').length;
  const downloadTemplate = () => { downloadCsvTemplate(); studio.notify('CSV 导入模板已下载，支持 Excel 中文打开'); setCsvMenuOpen(false); };
  const handleCsv = async (file?: File) => {
    if (!file || studio.busy) return;
    setCsvError(''); setCsvMenuOpen(false);
    if (!/\.csv$/i.test(file.name)) { const message = '请选择 .csv 文件。你可以先下载标准导入模板。'; setCsvError(message); studio.notify(message, 'error'); return; }
    if (file.size > 2 * 1024 * 1024) { const message = 'CSV 文件不能超过 2 MB，请拆分后导入。'; setCsvError(message); studio.notify(message, 'error'); return; }
    setImporting(true);
    try {
      const bytes = await file.arrayBuffer();
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      const items = importProducts(text);
      studio.appendProducts(items);
    } catch (error) {
      const message = error instanceof DOMException
        ? '浏览器无法读取所选文件，请重新选择本地 CSV 文件或检查文件访问权限。'
        : error instanceof TypeError ? '文件编码不是 UTF-8，请在 Excel 中另存为「CSV UTF-8」后重试。' : error instanceof Error ? error.message : 'CSV 导入失败，请检查文件格式。';
      setCsvError(message); studio.notify(message, 'error');
    } finally { setImporting(false); }
  };
  return <>
    <div className="page-heading"><div><div className="eyebrow"><span />CONTENT WORKSPACE</div><h1>素材生成台 <span className="heading-badge">创作，从这里开始</span></h1><p>从一个商品，到一套好内容。让每一次上新都更轻松。</p></div><div className="page-heading-actions"><button className="button button-secondary" disabled={studio.busy} onClick={onLoadDemo}><Sparkles size={16} />加载示例批次</button><div className="dropdown-wrap"><button className="button button-secondary" disabled={studio.busy || importing} aria-expanded={csvMenuOpen} onClick={() => setCsvMenuOpen(!csvMenuOpen)}>{importing ? <Spinner size={16} /> : <Upload size={16} />}批量导入 CSV<ChevronDown size={13} /></button>{csvMenuOpen && <><button className="dropdown-dismiss" aria-label="关闭 CSV 菜单" onClick={() => setCsvMenuOpen(false)} /><div className="dropdown-menu"><button onClick={() => { csvInput.current?.click(); setCsvMenuOpen(false); }}><FileSpreadsheet size={16} /><span>上传 CSV 文件<small>保留已有商品，追加导入</small></span></button><button onClick={downloadTemplate}><Download size={16} /><span>下载 CSV 导入模板<small>UTF-8 · Excel 中文兼容</small></span></button></div></>}</div><button className="button button-primary" disabled={studio.busy} onClick={studio.addProduct}><Plus size={17} />新建商品</button></div></div>
    <div className="csv-template-shortcut"><button className="text-button" disabled={studio.busy} onClick={downloadTemplate}><Download size={14} />下载 CSV 导入模板</button><span>批量上新，从一份清晰的商品表开始</span></div>
    <input ref={csvInput} type="file" className="sr-only" accept=".csv,text/csv" aria-label="上传 CSV 文件" onChange={event => { void handleCsv(event.target.files?.[0]); event.target.value = ''; }} />
    {csvError && <div className="inline-error" role="alert"><AlertCircle size={18} /><div><strong>导入未完成，原有商品已保留</strong><p>{csvError}</p></div><button className="text-button" onClick={downloadTemplate}>下载标准模板</button><button className="icon-button" aria-label="关闭导入错误" onClick={() => setCsvError('')}><X size={16} /></button></div>}
    <div className="workflow-strip"><div className="workflow-step current"><span>1</span><strong>录入商品</strong><small>基础信息与图片</small></div><div className="workflow-line" /><div className={`workflow-step ${generated ? 'current' : ''}`}><span>2</span><strong>生成与编辑</strong><small>主图 + 标题 + 卖点</small></div><div className="workflow-line" /><div className={`workflow-step ${approved ? 'current' : ''}`}><span>{approved ? <Check size={13} /> : '3'}</span><strong>导出与复用</strong><small>好内容，一键带走</small></div><span className="workflow-extra"><Layers3 size={15} />一个工作台，完成上新素材</span></div>
    <div className="batch-bar"><div className="batch-meta"><span className="batch-folder"><FolderOpen size={19} /></span><div><strong>{studio.state.workspace.batchName}</strong><span>{studio.state.workspace.items.length} 款商品 <i />已生成 {generated} 款 {approved > 0 && ` · 已定稿 ${approved} 款`}</span></div><span className="draft-chip">{studio.state.workspace.items.length > 0 && approved === studio.state.workspace.items.length ? '全部定稿' : '当前批次'}</span></div><div className="batch-actions"><button className="button button-ghost" disabled={studio.busy || !studio.state.workspace.items.length} onClick={onSaveBatch}><Save size={15} /><span>保存当前批次到历史</span></button><div className="batch-action-divider" /><button className="button button-soft" disabled={studio.busy || !studio.state.workspace.items.length || importing} onClick={() => { void studio.generateAll(); }}>{studio.busy ? <Spinner size={16} /> : <Sparkles size={16} />}{studio.batchProgress ? `正在生成 ${studio.batchProgress.current} / ${studio.batchProgress.total}` : '批量生成全部商品'}</button></div></div>
    <div className="studio-grid"><ProductEditor studio={studio} /><PosterPreview studio={studio} /><CopyEditor studio={studio} onSaveTemplate={onSaveTemplate} /></div>
    <div className="workspace-hint"><span><span className="hint-spark"><Sparkles size={15} /></span><strong>创作小贴士</strong>补充材质、场景与核心亮点，生成的内容会更懂你的商品。</span><button className="text-button" onClick={downloadTemplate}><Download size={13} />下载 CSV 导入模板</button></div>
  </>;
}
