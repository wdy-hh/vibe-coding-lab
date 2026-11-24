export type VisualStyleId = 'promo-red' | 'minimal-white' | 'luxury-black' | 'fresh-green';
export type CopyTone = 'promo' | 'minimal' | 'lifestyle' | 'professional';
export type ViewId = 'studio' | 'templates' | 'history';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  material: string;
  specs: string;
  audience: string;
  highlights: string;
  badgeText: string;
  imageUrl: string;
  status: 'draft' | 'generating' | 'generated' | 'approved';
  generated?: {
    seoTitle: string;
    posterTitle: string;
    sellingPoints: string[];
    visualStyle: VisualStyleId;
    updatedAt: string;
  };
}

export interface TemplateAsset {
  id: string;
  name: string;
  tags: string[];
  visualStyle: VisualStyleId;
  copyTone: CopyTone;
  badgeDefault: string;
  titleFormulaHint: string;
  description: string;
  createdAt: string;
}

export interface BatchRecord {
  id: string;
  batchName: string;
  createdAt: string;
  status: 'reviewing' | 'completed';
  items: ProductItem[];
}

export interface Workspace {
  items: ProductItem[];
  activeId: string;
  templateId: string;
  batchName: string;
  batchId: string | null;
  batchCreatedAt: string | null;
}

export interface StudioState {
  workspace: Workspace;
  templates: TemplateAsset[];
  history: BatchRecord[];
}

export type ProductErrors = Partial<Record<'name' | 'category' | 'imageUrl', string>>;
export type ToastKind = 'success' | 'error' | 'info';
export interface ToastItem { id: string; message: string; kind: ToastKind }
