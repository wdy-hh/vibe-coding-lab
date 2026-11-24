import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProductErrors, ProductItem, StudioState, TemplateAsset, ToastKind, ToastItem, ViewId } from '../types';
import { createDemoProducts, createInitialState } from '../data/demoData';
import { loadState, saveState } from '../utils/storage';
import { createId } from '../utils/id';
import { mockGenerate } from '../utils/mockGenerator';

export function validateProduct(item: ProductItem): ProductErrors {
  const errors: ProductErrors = {};
  if (!item.name.trim()) errors.name = '请输入商品名称';
  if (!item.category.trim()) errors.category = '请选择商品类目';
  if (!item.imageUrl) errors.imageUrl = '请上传商品图片（JPG / PNG / WebP）';
  return errors;
}

export type GenerationMode = 'full' | 'copy' | number;
const hasGeneratedCopy = (item: ProductItem) => Boolean(item.generated?.seoTitle.trim() && item.generated.sellingPoints.some(point => point.trim()));

export function useStudio() {
  const [initial] = useState(loadState);
  const [state, setState] = useState<StudioState>(initial.state);
  const [view, setView] = useState<ViewId>('studio');
  const [workspaceRevision, setWorkspaceRevision] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [errors, setErrors] = useState<ProductErrors>({});
  const [busy, setBusy] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved');
  const [storageError, setStorageError] = useState(initial.error ?? '');
  const stateRef = useRef(state);
  stateRef.current = state;
  const busyRef = useRef(false);
  const toastTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const notify = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = createId('toast');
    setToasts(previous => [...previous.slice(-3), { id, message, kind }]);
    toastTimers.current.push(setTimeout(() => setToasts(previous => previous.filter(toast => toast.id !== id)), 4200));
  }, []);
  useEffect(() => () => toastTimers.current.forEach(clearTimeout), []);
  useEffect(() => {
    setSaveStatus('saving');
    const timeout = setTimeout(() => {
      const error = saveState(state);
      setSaveStatus(error ? 'error' : 'saved');
      setStorageError(error ?? '');
    }, 350);
    return () => clearTimeout(timeout);
  }, [state]);
  // A synchronous pagehide flush covers refreshes before the debounce finishes.
  useEffect(() => {
    const flush = () => { saveState(stateRef.current); };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, []);

  const selected = state.workspace.items.find(item => item.id === state.workspace.activeId) ?? null;
  const activeTemplate = state.templates.find(template => template.id === state.workspace.templateId);

  const updateProduct = useCallback((id: string, updater: (item: ProductItem) => ProductItem) => {
    setState(previous => ({ ...previous, workspace: { ...previous.workspace, items: previous.workspace.items.map(item => item.id === id ? updater(item) : item) } }));
  }, []);
  const patchProduct = (id: string, patch: Partial<ProductItem>) => {
    updateProduct(id, item => ({ ...item, ...patch, status: hasGeneratedCopy(item) ? 'generated' : 'draft' }));
    setErrors(previous => Object.fromEntries(Object.entries(previous).filter(([key]) => !(key in patch))));
  };
  const patchGenerated = (id: string, patch: Partial<NonNullable<ProductItem['generated']>>) => {
    updateProduct(id, item => {
      const generated = { seoTitle: '', posterTitle: item.name, sellingPoints: [], visualStyle: activeTemplate?.visualStyle ?? 'minimal-white', ...item.generated, ...patch, updatedAt: new Date().toISOString() };
      return { ...item, generated, status: generated.seoTitle.trim() && generated.sellingPoints.some(point => point.trim()) ? 'generated' : 'draft' };
    });
  };
  const selectProduct = (id: string) => {
    if (busyRef.current) return;
    setState(previous => ({ ...previous, workspace: { ...previous.workspace, activeId: id } }));
    setErrors({});
  };
  const addProduct = () => {
    if (busyRef.current) return;
    const item: ProductItem = { id: createId('product'), name: '', category: '', material: '', specs: '', audience: '', highlights: '', badgeText: '', imageUrl: '', status: 'draft' };
    setState(previous => ({ ...previous, workspace: { ...previous.workspace, items: [...previous.workspace.items, item], activeId: item.id } }));
    setErrors({}); setView('studio');
    notify('已添加空白商品，填写基础信息即可开始', 'info');
  };
  const deleteProduct = (id: string) => {
    if (busyRef.current) return;
    setState(previous => {
      const items = previous.workspace.items.filter(item => item.id !== id);
      return { ...previous, workspace: { ...previous.workspace, items, activeId: previous.workspace.activeId === id ? (items[0]?.id ?? '') : previous.workspace.activeId } };
    });
    setErrors({}); notify('商品已从当前批次移除');
  };
  const loadDemo = () => {
    if (busyRef.current) return;
    const items = createDemoProducts();
    setWorkspaceRevision(previous => previous + 1);
    setState(previous => ({ ...previous, workspace: { items, activeId: items[0].id, templateId: previous.templates.some(template => template.id === 'preset-minimal') ? 'preset-minimal' : '', batchName: '日常上新 · 通勤好物', batchId: null, batchCreatedAt: null } }));
    setErrors({}); setView('studio'); notify('已加载 3 款示例商品，可以开始体验了');
  };
  const reset = () => { if (busyRef.current) return; setState(createInitialState()); setWorkspaceRevision(previous => previous + 1); setErrors({}); setView('studio'); notify('已恢复默认演示数据'); };

  const generate = async (mode: GenerationMode = 'full') => {
    if (busyRef.current) return;
    const snapshot = stateRef.current;
    const item = snapshot.workspace.items.find(product => product.id === snapshot.workspace.activeId);
    if (!item) return;
    const validation = validateProduct(item);
    if (Object.keys(validation).length) { setErrors(validation); notify('请先补全商品名称、类目和图片', 'error'); return; }
    busyRef.current = true; setBusy(true);
    updateProduct(item.id, product => ({ ...product, status: 'generating' }));
    try {
      const result = await mockGenerate(item, snapshot.templates.find(template => template.id === snapshot.workspace.templateId));
      updateProduct(item.id, product => {
        let generated = result;
        if (product.generated && mode === 'copy') generated = { ...product.generated, seoTitle: result.seoTitle, sellingPoints: result.sellingPoints, updatedAt: result.updatedAt };
        if (product.generated && typeof mode === 'number') generated = { ...product.generated, sellingPoints: product.generated.sellingPoints.map((point, index) => index === mode ? result.sellingPoints[mode % 3] : point), updatedAt: result.updatedAt };
        return { ...product, status: 'generated', generated };
      });
      notify(typeof mode === 'number' ? '已为这条卖点换一种表达' : mode === 'copy' ? '已生成新一版文案' : '商品素材已生成，试试切换主图风格');
    } catch (error) {
      updateProduct(item.id, product => ({ ...product, status: product.generated ? 'generated' : 'draft' }));
      notify(error instanceof Error ? error.message : '生成失败，请重试', 'error');
    } finally { busyRef.current = false; setBusy(false); }
  };

  const generateAll = async () => {
    if (busyRef.current || !stateRef.current.workspace.items.length) return;
    const snapshot = stateRef.current;
    const invalid = snapshot.workspace.items.find(item => Object.keys(validateProduct(item)).length);
    if (invalid) { selectProduct(invalid.id); setErrors(validateProduct(invalid)); notify(`请先补全「${invalid.name || '未命名商品'}」的必填信息`, 'error'); return; }
    busyRef.current = true; setBusy(true);
    const template = snapshot.templates.find(asset => asset.id === snapshot.workspace.templateId);
    let processing: ProductItem | null = null;
    try {
      for (let index = 0; index < snapshot.workspace.items.length; index++) {
        const item = snapshot.workspace.items[index]; processing = item;
        setBatchProgress({ current: index + 1, total: snapshot.workspace.items.length });
        setState(previous => ({ ...previous, workspace: { ...previous.workspace, activeId: item.id } }));
        updateProduct(item.id, product => ({ ...product, status: 'generating' }));
        const generated = await mockGenerate(item, template);
        updateProduct(item.id, product => ({ ...product, generated, status: 'generated' }));
      }
      notify(`已完成 ${snapshot.workspace.items.length} 款商品的批量生成`);
    } catch {
      if (processing) updateProduct(processing.id, product => ({ ...product, status: product.generated ? 'generated' : 'draft' }));
      notify('批量生成中断，已完成的素材已保留，请重试', 'error');
    } finally { busyRef.current = false; setBusy(false); setBatchProgress(null); }
  };

  const applyTemplate = (templateId: string) => {
    if (busyRef.current) return;
    const template = state.templates.find(asset => asset.id === templateId);
    setState(previous => ({ ...previous, workspace: { ...previous.workspace, templateId, items: previous.workspace.items.map(item => item.id === previous.workspace.activeId && template ? {
      ...item, badgeText: template.badgeDefault, status: hasGeneratedCopy(item) ? 'generated' : 'draft',
      generated: item.generated ? { ...item.generated, visualStyle: template.visualStyle, updatedAt: new Date().toISOString() } : undefined,
    } : item) } }));
    setView('studio');
    if (template) notify(`已应用「${template.name}」，生成时将使用此文案风格`);
  };
  const saveTemplate = (template: TemplateAsset) => {
    setState(previous => ({ ...previous, templates: previous.templates.some(asset => asset.id === template.id) ? previous.templates.map(asset => asset.id === template.id ? template : asset) : [...previous.templates, template] }));
    notify('模板已保存至资产库');
  };
  const deleteTemplate = (id: string) => {
    setState(previous => ({ ...previous, templates: previous.templates.filter(asset => asset.id !== id), workspace: { ...previous.workspace, templateId: previous.workspace.templateId === id ? '' : previous.workspace.templateId } }));
    notify('模板已删除');
  };
  const saveBatch = (name: string) => {
    const workspace = stateRef.current.workspace;
    if (!workspace.items.length) { notify('请先添加商品再保存批次', 'error'); return; }
    const id = workspace.batchId ?? createId('batch');
    const createdAt = workspace.batchCreatedAt ?? new Date().toISOString();
    const batch = { id, batchName: name.trim(), createdAt, status: workspace.items.every(item => item.status === 'approved') ? 'completed' as const : 'reviewing' as const, items: structuredClone(workspace.items) };
    setState(previous => ({ ...previous, workspace: { ...previous.workspace, batchId: id, batchCreatedAt: createdAt, batchName: batch.batchName }, history: previous.history.some(record => record.id === id) ? previous.history.map(record => record.id === id ? batch : record) : [batch, ...previous.history] }));
    notify('当前批次已保存到历史草稿箱');
  };
  const openBatch = (id: string) => {
    if (busyRef.current) return;
    const batch = state.history.find(record => record.id === id);
    if (!batch) return;
    setWorkspaceRevision(previous => previous + 1);
    setState(previous => ({ ...previous, workspace: { ...previous.workspace, batchName: batch.batchName, batchId: batch.id, batchCreatedAt: batch.createdAt, items: structuredClone(batch.items), activeId: batch.items[0]?.id ?? '' } }));
    setErrors({}); setView('studio'); notify('已恢复历史批次，可继续编辑');
  };
  const deleteBatch = (id: string) => {
    setState(previous => ({ ...previous, history: previous.history.filter(batch => batch.id !== id), workspace: previous.workspace.batchId === id ? { ...previous.workspace, batchId: null, batchCreatedAt: null } : previous.workspace }));
    notify('历史批次已删除');
  };
  const appendProducts = (items: ProductItem[]) => {
    if (busyRef.current) return;
    setState(previous => ({ ...previous, workspace: { ...previous.workspace, items: [...previous.workspace.items, ...items], activeId: items[0]?.id ?? previous.workspace.activeId } }));
    setErrors({}); notify(`成功导入 ${items.length} 款商品，请逐一补充图片`, 'success');
  };
  const approve = () => {
    if (!selected?.generated || busyRef.current) return;
    const validation = validateProduct(selected);
    if (!selected.generated.seoTitle.trim() || !selected.generated.posterTitle.trim() || !selected.generated.sellingPoints.some(point => point.trim())) { notify('请先补全标题、主图标题和至少一条卖点', 'error'); return; }
    if (Object.keys(validation).length) { setErrors(validation); notify('请补全商品必填信息后再定稿', 'error'); return; }
    updateProduct(selected.id, item => ({ ...item, status: 'approved' }));
    notify('商品已定稿，记得保存当前批次到历史');
  };
  return { state, view, setView, workspaceRevision, selected, activeTemplate, toasts, setToasts, notify, errors, busy, batchProgress, saveStatus, storageError, patchProduct, patchGenerated, selectProduct, addProduct, deleteProduct, loadDemo, reset, generate, generateAll, applyTemplate, saveTemplate, deleteTemplate, saveBatch, openBatch, deleteBatch, appendProducts, approve };
}

export type Studio = ReturnType<typeof useStudio>;
