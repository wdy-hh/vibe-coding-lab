import type { ProductItem, StudioState, TemplateAsset, BatchRecord, Workspace } from '../types';
import { createInitialState } from '../data/demoData';

export const STORAGE_KEY = 'ecom_studio_v1_state';
const visualIds = new Set(['promo-red', 'minimal-white', 'luxury-black', 'fresh-green']);
const tones = new Set(['promo', 'minimal', 'lifestyle', 'professional']);
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const hasStrings = (value: Record<string, unknown>, keys: string[]) => keys.every(key => typeof value[key] === 'string');

function isProduct(value: unknown): value is ProductItem {
  if (!isRecord(value) || !hasStrings(value, ['id', 'name', 'category', 'material', 'specs', 'audience', 'highlights', 'badgeText', 'imageUrl', 'status'])) return false;
  if (!['draft', 'generating', 'generated', 'approved'].includes(String(value.status))) return false;
  if (value.imageUrl && !/^data:image\/(png|jpeg|webp|svg\+xml)[;,]/i.test(String(value.imageUrl))) return false;
  if (value.generated !== undefined) {
    const generated = value.generated;
    if (!isRecord(generated) || !hasStrings(generated, ['seoTitle', 'posterTitle', 'visualStyle', 'updatedAt']) || !visualIds.has(String(generated.visualStyle))) return false;
    if (!Array.isArray(generated.sellingPoints) || !generated.sellingPoints.every(point => typeof point === 'string')) return false;
  }
  return true;
}
function isTemplate(value: unknown): value is TemplateAsset {
  return isRecord(value) && hasStrings(value, ['id', 'name', 'visualStyle', 'copyTone', 'badgeDefault', 'titleFormulaHint', 'description', 'createdAt']) && visualIds.has(String(value.visualStyle)) && tones.has(String(value.copyTone)) && Array.isArray(value.tags) && value.tags.every(tag => typeof tag === 'string');
}
function isBatch(value: unknown): value is BatchRecord {
  return isRecord(value) && hasStrings(value, ['id', 'batchName', 'createdAt']) && Number.isFinite(Date.parse(String(value.createdAt))) && ['reviewing', 'completed'].includes(String(value.status)) && Array.isArray(value.items) && value.items.every(isProduct);
}
function isWorkspace(value: unknown): value is Workspace {
  return isRecord(value) && hasStrings(value, ['activeId', 'templateId', 'batchName']) && Array.isArray(value.items) && value.items.every(isProduct) && (value.batchId === null || typeof value.batchId === 'string') && (value.batchCreatedAt === null || typeof value.batchCreatedAt === 'string');
}
const recoverItem = (item: ProductItem): ProductItem => ({ ...item, status: item.status === 'generating' ? (item.generated ? 'generated' : 'draft') : item.status });

export function loadState(): { state: StudioState; error?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: createInitialState() };
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isWorkspace(parsed.workspace) || !Array.isArray(parsed.templates) || !parsed.templates.every(isTemplate) || !Array.isArray(parsed.history) || !parsed.history.every(isBatch)) throw new Error('invalid state');
    const workspace = parsed.workspace;
    return { state: {
      workspace: { ...workspace, items: workspace.items.map(recoverItem), activeId: workspace.items.some(item => item.id === workspace.activeId) ? workspace.activeId : workspace.items[0]?.id ?? '', templateId: parsed.templates.some(template => template.id === workspace.templateId) ? workspace.templateId : '' },
      templates: parsed.templates,
      history: parsed.history.map(batch => ({ ...batch, items: batch.items.map(recoverItem) })),
    } };
  } catch {
    return { state: createInitialState(), error: '无法读取本地草稿，已加载演示数据。浏览器存储可能不可用或数据已损坏。' };
  }
}

export function saveState(state: StudioState): string | null {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return null; }
  catch { return '本地自动保存失败：存储空间可能不足。请减少大图或历史批次后重试；当前内容仍可继续编辑和导出。'; }
}
