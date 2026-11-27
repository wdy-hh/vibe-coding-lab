import { Archive, BookOpen, Box, Check, CheckCheck, ChevronRight, CircleHelp, FolderOpen, Layers3, LayoutDashboard, Menu, RotateCcw, ShieldCheck, Sparkles, WandSparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Studio } from '../hooks/useStudio';

const navItems = [
  { id: 'studio' as const, label: '素材生成台', icon: WandSparkles },
  { id: 'templates' as const, label: '模板资产库', icon: Layers3 },
  { id: 'history' as const, label: '历史批次 / 草稿箱', icon: Archive },
];
const viewNames = { studio: '素材生成台', templates: '模板资产库', history: '历史批次 / 草稿箱' };

export function Layout({ studio, onReset, onHelp, children }: { studio: Studio; onReset: () => void; onHelp: () => void; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [offlineReady, setOfflineReady] = useState(!import.meta.env.PROD);
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    let active = true;
    navigator.serviceWorker.ready.then(() => { if (active) setOfflineReady(true); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return <div className="app-shell">
    {mobileOpen && <button className="sidebar-scrim" aria-label="收起导航" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <a href="#" className="brand" onClick={event => { event.preventDefault(); if (!studio.busy) studio.setView('studio'); }}><span className="brand-mark"><Sparkles size={23} strokeWidth={1.8} /></span><span><strong>E-Com Studio<span className="brand-dot">.</span></strong><small>电商内容工作台</small></span></a>
      <button className="mobile-close icon-button" aria-label="收起导航" onClick={() => setMobileOpen(false)}><X size={20} /></button>
      <div className="workspace-switch"><span className="workspace-icon"><Box size={18} /></span><div><strong>我的工作空间</strong><small>个人内容创作</small></div><span className="workspace-plan">FREE</span></div>
      <p className="nav-section-label">工作台</p>
      <nav aria-label="主导航">{navItems.map(({ id, label, icon: Icon }) => <button key={id} disabled={studio.busy} className={`nav-item ${studio.view === id ? 'active' : ''}`} onClick={() => { studio.setView(id); setMobileOpen(false); }} aria-current={studio.view === id ? 'page' : undefined}>
        <Icon size={19} strokeWidth={1.8} /><span>{label}</span>{id !== 'studio' && <span className="nav-count">{id === 'templates' ? studio.state.templates.length : studio.state.history.length}</span>}
      </button>)}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip"><span className="tip-icon"><BookOpen size={19} /></span><strong>让好方案，持续复用</strong><p>把每次灵感存为模板，<br />下一次上新，快人一步。</p><button disabled={studio.busy} onClick={() => studio.setView('templates')}>探索我的模板 <Layers3 size={14} /></button></div>
        <div className="local-workspace"><span className="local-symbol"><FolderOpen size={16} /></span><div><strong>本地工作空间</strong><small>数据安全存储在当前浏览器</small></div><ShieldCheck size={15} /></div>
        <button className="reset-button" disabled={studio.busy} onClick={onReset}><RotateCcw size={15} />恢复默认演示数据</button>
        <span className="sidebar-version">E-Com Studio <span>v1.1 · AI</span></span>
      </div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" aria-label="展开导航" onClick={() => setMobileOpen(true)}><Menu size={21} /></button><LayoutDashboard size={17} /><span>工作空间</span><ChevronRight size={13} /><strong>{viewNames[studio.view]}</strong></div><div className="topbar-right"><span className={`save-indicator ${studio.saveStatus === 'error' ? 'has-error' : ''}`}><CheckCheck size={15} />{studio.saveStatus === 'saving' ? '正在保存' : studio.saveStatus === 'error' ? '保存失败' : '已自动保存'}</span><span className="offline-label" title={studio.aiMode === 'real' ? '使用 GLM-5.3-Flash 生成文字，商品图片保留在本地' : offlineReady ? '模拟模式离线可用，图片与草稿保存在浏览器' : '当前为本地模拟模式'}><span />{studio.aiChecking ? '检测 AI 中' : studio.aiMode === 'real' ? 'GLM-5.3-Flash' : '模拟演示模式'}</span><div className="topbar-divider" /><button className="icon-button help-button" aria-label="使用指南" onClick={onHelp}><CircleHelp size={19} /></button><span className="avatar" title="本地创作者">OP</span></div></header>
      <main className="main-content">{studio.storageError && <div className="storage-warning" role="alert">{studio.storageError}</div>}{children}<footer className="page-footer"><span><ShieldCheck size={13} />图片本地合成 · 草稿自动保存</span><span>用更少的时间，创作更好的内容 <Check size={13} /></span></footer></main>
    </div>
  </div>;
}
