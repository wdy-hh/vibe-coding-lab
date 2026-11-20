export function createAppView(root: HTMLElement) {
  root.innerHTML = `
    <main class="lab">
      <header class="masthead">
        <div><p class="eyebrow">GESTURE PARTICLE SYSTEM</p><h1>手部表面粒子实验台</h1></div>
        <span class="phase-tag">PHASE 02 <span>/ HAND SURFACE</span></span>
      </header>
      <div class="workspace">
        <section class="capture-panel" aria-label="摄像头与手部粒子视图">
          <div class="panel-heading"><span>HAND SURFACE <small>实时粒子 · 2.5D 近似</small></span><span id="camera-state">未启动</span></div>
          <div id="stage" class="stage mirrored">
            <video id="camera-video" muted playsinline aria-label="摄像头实时视频"></video>
            <div id="particle-layer" class="particle-layer"></div>
            <canvas id="skeleton" aria-label="双手21关键点与骨骼覆盖"></canvas>
            <div id="empty-state" class="empty-state"><div class="capture-mark" aria-hidden="true">＋</div><p id="empty-title">等待双手进入</p><span id="empty-description">点击 Start Camera，用真实双手驱动掌面与五指粒子。</span></div>
            <span class="feed-label">LOCAL PROCESSING · RGB</span>
          </div>
          <div class="controls">
            <div class="camera-actions"><button id="start" type="button" class="primary">Start Camera</button><button id="stop" type="button" disabled>Stop Camera</button></div>
            <div class="debug-toggles">
              <label><input id="mirror" type="checkbox" checked />镜像显示</label>
              <label><input id="smoothing" type="checkbox" checked />坐标平滑</label>
              <label><input id="particles-enabled" type="checkbox" checked />表面粒子</label>
              <label><input id="skeleton-enabled" type="checkbox" />骨骼调试</label>
              <label><input id="video-reference" type="checkbox" checked />视频参考</label>
              <label><input id="indices" type="checkbox" />关键点编号</label>
            </div>
          </div>
          <div class="particle-tuning">
            <label for="particle-spread">悬浮外散</label>
            <input id="particle-spread" type="range" min="0" max="100" step="5" value="65" />
            <output id="spread-value" for="particle-spread">65%</output>
            <span>外层漂浮 · 主体持续跟随</span>
          </div>
        </section>
        <aside class="telemetry" aria-label="追踪状态">
          <section class="readout">
            <p class="eyebrow">TRACKING STATUS</p>
            <div class="hand-total"><strong id="hand-count">0</strong><span>/ 2 双手</span></div>
            <p id="hand-summary" class="muted">等待摄像头启动</p>
            <div class="side-status"><span>左手 <b id="left-state">—</b></span><span>右手 <b id="right-state">—</b></span></div>
            <div id="hand-details" class="hand-details"></div>
          </section>
          <section class="readout metrics" aria-label="运行信息">
            <dl><div><dt>摄像头输出</dt><dd id="resolution">—</dd></div><div><dt>推理后端</dt><dd id="delegate">—</dd></div><div><dt>识别频率</dt><dd id="inference-fps">—</dd></div><div><dt>推理耗时</dt><dd id="inference-time">—</dd></div><div><dt>世界坐标</dt><dd id="world-state">等待数据</dd></div><div><dt>表面粒子</dt><dd id="surface-count">0</dd></div><div><dt>关节高亮</dt><dd id="joint-count">0</dd></div><div><dt>粒子渲染</dt><dd id="particle-backend">未启动</dd></div></dl>
          </section>
          <p class="coordinate-note">每只手 10,000 个表面粒子，固定身份跟随手指弯曲。厚度为程序化近似；世界坐标为模型估计值。</p>
        </aside>
      </div>
      <p id="status" class="status" role="status" aria-live="polite">就绪。摄像头尚未开启，模型将在点击后加载。</p>
      <p id="error" class="error" role="alert" hidden></p>
      <p id="particle-warning" class="particle-warning" role="status" hidden></p>
      <footer><span>视频仅在本机处理，不上传、不录制。</span><span>PHASE 02 · 2.5D 近似表面，不是真实深度扫描。</span></footer>
    </main>
  `;
  const get = <T extends HTMLElement>(selector: string): T => {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing application element: ${selector}`);
    return element;
  };
  return {
    root, get,
    video: get<HTMLVideoElement>('#camera-video'), canvas: get<HTMLCanvasElement>('#skeleton'),
    particleHost: get<HTMLDivElement>('#particle-layer'), particlesEnabled: get<HTMLInputElement>('#particles-enabled'),
    skeletonEnabled: get<HTMLInputElement>('#skeleton-enabled'), videoReference: get<HTMLInputElement>('#video-reference'),
    particleWarning: get<HTMLParagraphElement>('#particle-warning'),
    spread: get<HTMLInputElement>('#particle-spread'), spreadValue: get<HTMLOutputElement>('#spread-value'),
    stage: get<HTMLDivElement>('#stage'), start: get<HTMLButtonElement>('#start'), stop: get<HTMLButtonElement>('#stop'),
    mirror: get<HTMLInputElement>('#mirror'), smoothing: get<HTMLInputElement>('#smoothing'), indices: get<HTMLInputElement>('#indices'),
    status: get<HTMLParagraphElement>('#status'), error: get<HTMLParagraphElement>('#error'), empty: get<HTMLDivElement>('#empty-state'),
    emptyTitle: get<HTMLParagraphElement>('#empty-title'), emptyDescription: get<HTMLSpanElement>('#empty-description'), cameraState: get<HTMLSpanElement>('#camera-state'),
  };
}

export type AppView = ReturnType<typeof createAppView>;
