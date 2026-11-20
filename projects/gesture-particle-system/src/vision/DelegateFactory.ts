export type VisionDelegate = 'GPU' | 'CPU';

export async function createWithDelegateFallback<T>(
  create: (delegate: VisionDelegate) => Promise<T>,
  onFallback: () => void,
  cancelled: () => boolean = () => false,
): Promise<{ resource: T; delegate: VisionDelegate }> {
  try {
    return { resource: await create('GPU'), delegate: 'GPU' };
  } catch (gpuError) {
    if (cancelled()) throw new DOMException('Initialization cancelled', 'AbortError');
    console.warn('MediaPipe GPU delegate failed; trying CPU.', gpuError);
    onFallback();
    try {
      return { resource: await create('CPU'), delegate: 'CPU' };
    } catch (cpuError) {
      throw new Error('GPU 与 CPU 初始化均失败。请检查本地模型、WASM 文件及浏览器 WebAssembly 支持。', { cause: cpuError });
    }
  }
}
