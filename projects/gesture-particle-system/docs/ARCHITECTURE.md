# 技术架构

当前范围是 Phase 2 的实时双手追踪与近似表面粒子化。

## 数据流与模块

```text
CameraService → HandTrackingService → HandIdentityManager → LandmarkSmoother
    → HandGeometryBuilder → HandSurfaceSampler → ParticleHand / ParticleEngine
```

- `CameraService` 管理视频流、异步启动取消与 Track 释放。权限迟到返回时也会关闭旧流。
- `HandTrackingService` 按需加载本地模型与 WASM，使用 VIDEO / numHands=2，优先 GPU，初始化失败后尝试 CPU。
- `adaptHandResult` 将 SDK 结果转成统一的 `HandObservation`；后续渲染不直接依赖 SDK 的原始对象。
- `HandIdentityManager` 综合掌心位置、短时运动与左右分类做一对一匹配，不将结果数组顺序当作身份。
- `LandmarkSmoother` 按手部 ID 独立执行时间自适应 EMA，运动较快时提高响应。
- `HandGeometryBuilder` 通过固定掌面三角形扇面、掌缘厚度和五指曲线管状表面近似手部。
- `HandSurfaceSampler` 在初始化时生成固定种子与局部参数，后续只用关键点变形。
- `ParticleHand` 维护每只手的独立 TypedArray、表面与关节 BufferGeometry，并执行短时位置插值。
- `ParticleEngine` 复用两个手部槽位，使用 Points / ShaderMaterial 绘制；停止后销毁几何、材质与上下文。
- `AppController` 负责摄像头、推理、粒子与骨骼覆盖层的调度。推理优先使用新视频帧，绘制独立更新。

## 坐标约定

内部使用未镜像视频坐标：左上角原点，x 向右，y 向下，z 为关键点估计的相对深度。几何生成将 y 按视频高宽比缩放，统一为以图像宽度为单位的空间。

显示层采用居中 contain。视频、骨骼和粒子共享镜像与留边约定，最终显示时才翻转 x，不改变内部距离计算或左右手标签。

worldLandmarks 是以每只手中心为参考的估计坐标，不能将两手的这些点直接当作同一个全局深度坐标系。当前厚度与表面来自程序化近似，不是真实皮肤重建。

SDK 的 `handedness` 分数表示左右分类概率，不冒充检测/存在置信度。

## 粒子身份与外散

掌面粒子保存三角形编号、重心坐标和前后面方向；手指粒子保存曲线区段、局部位置与环向参数。每只手的采样种子和索引稳定，避免每帧重新随机生成引起闪烁。

悬浮外散在 GPU 顶点 Shader 中叠加有界位移，方向结合掌心径向与局部表面法线，幅度按掌宽缩放。固定的粒子参数决定漂浮相位，基础表面仍随每帧手部动作更新。关节高亮保持在关键点上。

## 资源与降级

模型文件随项目提供，其固定版本和 SHA-256 位于 `vision-assets.lock.json`。WASM 在 dev/build 前从锁定的 npm SDK 生成，运行时从本地静态目录加载。

粒子模块按需加载。WebGL 初始化失败或上下文丢失时，回退到已保留的摄像头与骨骼调试。完全遮挡、长期离开或极快跳变时，几何身份匹配无法保证绝对不换 ID。

MediaPipe 当前同步运行在主线程。持续帧率、端到端延迟、Worker 方案和质量档位属于后续性能阶段。
