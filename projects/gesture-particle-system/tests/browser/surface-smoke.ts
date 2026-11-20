import { ParticleEngine } from '../../src/particles/ParticleEngine.ts';
import { REFERENCE_HAND } from '../../src/hand/HandTopology.ts';
import { palmCenter } from '../../src/vision/types.ts';
import type { HandFrame } from '../../src/vision/types.ts';

const host = document.querySelector<HTMLDivElement>('#host')!;
const run = document.querySelector<HTMLButtonElement>('#run')!;
const bend = document.querySelector<HTMLButtonElement>('#bend')!;
const mirror = document.querySelector<HTMLInputElement>('#mirror')!;
const spread = document.querySelector<HTMLInputElement>('#spread')!;
const summary = document.querySelector<HTMLParagraphElement>('#summary')!;
const results = document.querySelector<HTMLOListElement>('#results')!;
let engine: ParticleEngine | null = null;
let current: HandFrame[] = [];
let animation = 0;
let bent = false;
let running = false;

function pose(curled = false): HandFrame[] {
  return [0, 1].map((side): HandFrame => {
    const points = REFERENCE_HAND.map((p) => ({ ...p }));
    if (curled) {
      points[6] = { x: .39, y: .43, z: -.06 }; points[7] = { x: .40, y: .52, z: -.12 }; points[8] = { x: .42, y: .62, z: -.1 };
      points[10] = { x: .50, y: .38, z: -.07 }; points[11] = { x: .51, y: .49, z: -.13 }; points[12] = { x: .52, y: .63, z: -.1 };
    }
    const scale = side === 0 ? .66 : .55, center = side === 0 ? .29 : .72;
    const landmarks = points.map((p) => {
      const x = (p.x - .5) * scale * (side ? -1 : 1);
      return { x: center + x, y: .18 + p.y * scale, z: p.z * scale + x * (side ? .38 : -.15) };
    });
    const handedness = side === 0 ? 'Left' : 'Right';
    return { id: `fixture-${side}`, handedness, observedHandedness: handedness, confidence: 1, landmarks, palmCenter: palmCenter(landmarks), timestamp: performance.now() };
  });
}

function pixels(): { bytes: Uint8Array; width: number; colored: number; centroid: number; error: number; span: number } {
  const canvas = host.querySelector('canvas')!, gl = canvas.getContext('webgl2')!;
  const width = gl.drawingBufferWidth, height = gl.drawingBufferHeight;
  const bytes = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
  let colored = 0, weightedX = 0, minX = width, maxX = -1;
  for (let i = 0; i < width * height; i++) {
    if (bytes[i * 4] + bytes[i * 4 + 1] + bytes[i * 4 + 2] > 10) { colored++; weightedX += i % width; minX = Math.min(minX, i % width); maxX = Math.max(maxX, i % width); }
  }
  return { bytes, width, colored, centroid: colored ? weightedX / colored : 0, error: gl.getError(), span: maxX - minX };
}
function record(ok: boolean, message: string): void {
  if (!ok) throw new Error(message);
  const item = document.createElement('li'); item.textContent = `PASS · ${message}`; results.append(item);
}
function draw(): void {
  if (!running || !engine) return;
  try { engine.render(current, 640, 480, mirror.checked, performance.now(), Number(spread.value) / 100); animation = requestAnimationFrame(draw); }
  catch (error) { running = false; summary.textContent = `FAIL · ${error instanceof Error ? error.message : String(error)}`; }
}

run.addEventListener('click', async () => {
  running = false; cancelAnimationFrame(animation); run.disabled = true; bend.disabled = true; results.replaceChildren();
  summary.textContent = '正在验证实际 WebGL2 绘制…';
  try {
    engine?.dispose(); engine = new ParticleEngine(host);
    const open = pose(), stats = engine.render(open, 640, 480, false, 1000, 0);
    const first = pixels();
    record(stats.surface === 20_000 && stats.joints === 42 && stats.drawCalls === 4, '双手 20,000 表面粒子 + 42 高亮点，4 次绘制');
    record(first.error === 0 && first.colored > 1000, 'Shader 成功绘制实际像素，WebGL 无错误');
    engine.render([open[1], open[0]], 640, 480, false, 1017, 0);
    const reordered = pixels();
    record(first.bytes.every((byte, i) => byte === reordered.bytes[i]), '输入数组换序后画面不变，双手独立身份保留');
    engine.render(open, 640, 480, true, 1034, 0);
    const mirrored = pixels();
    record(Math.abs(first.centroid + mirrored.centroid - (first.width - 1)) < 2.5, 'Shader 镜像的粒子质心严格对称');
    const curled = pose(true);
    for (let i = 0; i < 12; i++) engine.render(curled, 640, 480, false, 1051 + i * 17, 0);
    const moved = pixels();
    let changed = 0;
    for (let i = 0; i < first.bytes.length; i += 4) if (Math.abs(first.bytes[i + 2] - moved.bytes[i + 2]) > 15) changed++;
    record(changed > 300, '弯指后表面实际变形，粒子继续跟随');
    const emptyStats = engine.render([], 640, 480, false, 1300, 0), empty = pixels();
    record(emptyStats.surface === 0 && emptyStats.joints === 0 && empty.colored === 0, '无手时计数归零，旧粒子完全清空');
    engine.render(open, 640, 480, false, 1317, 0);
    const restored = pixels();
    record(first.bytes.every((byte, i) => byte === restored.bytes[i]), '同一身份重现时采样保持稳定，无随机重生');
    engine.render(open, 640, 480, false, 1317, 1);
    const expanded = pixels();
    record(expanded.span > first.span + 10 && expanded.error === 0, '外散扩大手部轮廓，主体与悬浮层一起绘制');
    engine.render([open[1], open[0]], 640, 480, false, 1317, 1);
    const expandedReordered = pixels();
    record(expanded.bytes.every((byte, i) => byte === expandedReordered.bytes[i]), '悬浮层保留稳定身份，不随输入换序重生');
    engine.render(open, 640, 480, true, 1317, 1);
    const expandedMirror = pixels();
    record(Math.abs(expanded.centroid + expandedMirror.centroid - (first.width - 1)) < 2.5, '外散与漂浮也遵循同一显示镜像');
    const oldCanvas = host.querySelector('canvas')!, oldGl = oldCanvas.getContext('webgl2')!;
    engine.dispose();
    record(!host.querySelector('canvas'), '停止时移除粒子画布并销毁渲染资源');
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    record(oldGl.isContextLost(), '旧 WebGL 上下文已主动释放');
    engine = new ParticleEngine(host); current = pose();
    const restarted = engine.render(current, 640, 480, false, performance.now(), .65);
    record(restarted.surface === 20_000 && pixels().error === 0, '释放后可重新创建双手粒子渲染器');
    summary.textContent = `${results.children.length} 项 GPU 集成检查通过 · 合成关键点，未开启摄像头`;
    running = true; bent = false; mirror.checked = false; spread.value = '65'; bend.disabled = false; draw();
  } catch (error) {
    engine?.dispose(); engine = null;
    summary.textContent = `FAIL · ${error instanceof Error ? error.message : String(error)}`;
    console.error('Surface GPU integration test failed:', error);
  } finally { run.disabled = false; }
});
bend.addEventListener('click', () => { bent = !bent; current = pose(bent); });
window.addEventListener('pagehide', () => { running = false; cancelAnimationFrame(animation); engine?.dispose(); });
