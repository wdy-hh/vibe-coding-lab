import type { AiMode, FullCopyResult, SellingPointResult } from '../../shared/ai';
import type { ProductItem, VisualStyleId } from '../types';

export type GenerationMode = 'full' | 'copy' | number;
export function mergeGeneratedCopy(item: ProductItem, mode: GenerationMode, result: FullCopyResult | SellingPointResult, source: AiMode, visualStyle: VisualStyleId): NonNullable<ProductItem['generated']> {
  const now = new Date().toISOString();
  if (typeof mode === 'number' && item.generated && 'sellingPoint' in result) {
    return { ...item.generated, source, sellingPoints: item.generated.sellingPoints.map((point, index) => index === mode ? result.sellingPoint : point), updatedAt: now };
  }
  if (!('seoTitle' in result)) throw new Error('Expected full copy');
  if (mode === 'copy' && item.generated) return { ...item.generated, seoTitle: result.seoTitle, sellingPoints: result.sellingPoints, warnings: result.warnings, source, updatedAt: now };
  return { ...result, visualStyle, source, updatedAt: now };
}

export async function processGenerationQueue<T>(items: T[], process: (item: T, index: number) => Promise<void>, onFailure: (item: T, error: unknown) => void, signal?: AbortSignal): Promise<{ success: number; failed: number; cancelled: boolean }> {
  let success = 0, failed = 0;
  for (let index = 0; index < items.length; index++) {
    if (signal?.aborted) break;
    try { await process(items[index], index); success++; }
    catch (error) { if (signal?.aborted) break; failed++; onFailure(items[index], error); }
  }
  return { success, failed, cancelled: Boolean(signal?.aborted) };
}
