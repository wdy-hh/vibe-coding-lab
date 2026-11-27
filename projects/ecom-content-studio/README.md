# 电商内容工作台 · E-Com Studio

React 18 + TypeScript + Vite + Tailwind CSS 内容工作台。支持商品批量录入、800×800 Canvas 主图导出、SEO 标题与卖点编辑、模板复用及历史草稿，现已接入学校 AIOP 平台的 **GLM-5.3-Flash**。

[GitHub Pages 演示](https://wdy-hh.github.io/vibe-coding-lab/projects/ecom-content-studio/) · [GitHub 源码](https://github.com/wdy-hh/vibe-coding-lab/tree/main/projects/ecom-content-studio)

## 本地启动

使用 **Node.js 24**（推荐 24.12+）。在项目目录打开 PowerShell：

```powershell
cd projects/ecom-content-studio
npm install
npm run dev
```

打开终端显示的地址，默认 **http://127.0.0.1:5173**。仓库内的项目目录为 `projects/ecom-content-studio/`。

## 配置真实 AI

首次配置时，将 `.env.example` 复制为 `.env.local`，然后填入服务端配置：

```dotenv
AIOP_BASE_URL=https://aiop.whu.edu.cn/api/v1
AIOP_MODEL_ID=b0c5a237-a5fe-46fb-9007-f1cf17c5382b
AIOP_API_KEY=
```

密钥只填写在 `.env.local` 的最后一行。不要使用 `VITE_` 前缀，也不要将密钥填入页面、源码、命令行参数或提交到 GitHub。`.env`、`.env.local` 和 `.env.*.local` 已加入忽略规则。

先单独验证真实接口：

```powershell
npm run test:ai
```

脚本使用固定商品直接调用 AIOP，输出 HTTP 状态、耗时、token 用量和解析后的商品 JSON，不输出密钥。未配置、401/403、429、超时和模型格式异常会给出不同的排查提示。该命令会消耗少量真实模型额度，普通 `npm test` 使用模拟响应，不调用真实接口。

验证通过后运行 `npm run dev`。页面通过 `GET /api/ai-health` 检测配置，自动启用「真实 AI · GLM-5.3-Flash」。配置变化后请重启本地服务，再点击页面的「重新检测 AI 服务」。

AIOP 实测会将 GLM 的思考过程计入输出额度，800 tokens 会在正文输出前被截断。因此服务端使用 `max_tokens: 4096`、`reasoning_effort: low`，请求超时为 90 秒，浏览器等待上限为 95 秒。已测完整生成约需 36–65 秒；页面会保留原有画布和文字，可随时停止生成。

## 工作流与降级

- 单条生成、批量生成、重新生成全部文案和单条卖点刷新均可使用真实 AI。单条刷新只替换对应卖点，保留其他手动编辑的标题、风格与文案。
- 批量生成顺序执行。单条失败不会终止其余商品，失败项保留输入、旧素材及错误提示，可单独重试。
- 模型返回的资料补充建议会显示在「AI 核对提醒」中。提示词要求基于已知信息写作，使用前仍可自行编辑与核对。
- 顶部可切换真实 AI / 模拟模式。服务端不存在、未配置或离线时自动使用模拟模式；真实请求失败会明确提示，保留素材，不会悄悄用模拟内容冒充真实生成。
- 商品图片始终留在浏览器，真实 AI 只接收名称、类目、材质、规格、人群、亮点、角标和模板结构等文字资料。

## 检查与构建

```powershell
npm test
npm run build
npm run preview
```

构建依次执行 TypeScript 检查、Vite 打包、离线缓存生成和前端密钥扫描。也可单独运行 `npm run check:secrets`。输出目录为 `dist/`，默认生产预览地址为 **http://127.0.0.1:4173**；本地预览同样支持服务端 AI 代理。

## 线上部署

**GitHub Pages** 仅托管静态文件，线上演示会自动使用模拟模式。真实 AI 需要服务端运行环境。

**Vercel** 可直接使用仓库内的 `api/generate.ts` 与 `api/ai-health.ts`：

1. 导入 GitHub 仓库，将 Root Directory 设为 `projects/ecom-content-studio`。
2. 选择 Vite，Node.js 24，构建命令 `npm run build`，输出目录 `dist`。
3. 在 Vercel 的服务端 Environment Variables 中配置上面的三项 `AIOP_*` 变量，然后部署。
4. 打开 `/api/ai-health`，确认仅返回 `configured` 与 `model`；页面会自动切换到真实 AI。

`vercel.json` 将生成函数最大运行时间设为 105 秒，给上游 90 秒超时留出处理余量。后端带请求体限制、来源检查及进程内轻量限流；该限流不跨多实例共享。

Vite 使用 `base: './'`，适配子目录静态部署。Service Worker 缓存本地素材，跳过 `/api/`；在 localhost 或 HTTPS 首次加载完成后可离线重开并使用模拟模式。

## CSV、图片与草稿

CSV 模板在顶部和工作台底部均可下载，包含 UTF-8 BOM，支持带引号、逗号和换行的字段。表头为：

```text
商品名称,商品类目,材质,颜色规格,目标人群,核心卖点,角标文案
```

导入失败不会清空现有商品；单次最多 100 款、文件不超过 2 MB。CSV 不包含图片，导入后需补充 JPG / PNG / WebP，单张不超过 5 MB。示例图片为本地 SVG Data URL，可离线导出 PNG。

当前批次、模板和历史保存在 `ecom_studio_v1_state` 的 `localStorage` 中。清除站点数据、更换浏览器或地址不会迁移草稿。存储不足时页面会提示，当前素材仍可编辑和导出；侧边栏可恢复默认演示数据。

## 代码结构

- `server/aiService.ts`：鉴权、超时、JSON 解析、业务校验与错误归一化。
- `server/promptBuilder.ts`：事实约束、四种文案语气及两种结构化生成动作。
- `server/httpHandler.ts`：健康检查、请求校验、限流与统一响应。
- `server/viteAiPlugin.ts`：本地开发 / 预览代理。
- `api/`：Vercel Functions 入口，仅在服务端读取密钥。
- `shared/ai.ts`：不含密钥的请求类型和可读错误信息。
- `src/utils/aiClient.ts`：同源客户端请求与静态环境检测。
- `src/utils/mockGenerator.ts`：离线模拟生成兜底。
- `src/hooks/useStudio.ts`：编辑状态、逐条生成、取消、重试与本地保存。
- `tests/`：代理协议、解析、限流、单条合并、队列顺序和原有核心功能回归测试。

原始规格保存在 `SPEC.md`，本次 AI 迭代要求保存在 `AI_SPEC.md`。
