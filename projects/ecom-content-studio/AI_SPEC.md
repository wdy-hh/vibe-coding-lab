# 迭代开发交接文档：接入真实 AI 能力（GLM-5.3-Flash）

## 1. 任务目标
在现有「电商内容工作台（E-Com Content Studio）」React + TypeScript + Vite 项目基础上，将原本依赖 `mockGenerator.ts` 的模拟文案生成逻辑，升级为调用真实大语言模型 **GLM-5.3-Flash**（OpenAI 兼容接口）。

核心遵循以下工程原则：
1. **密钥零泄露**：API Key 仅保存在服务端环境变量（`.env.local`），**严禁使用 `VITE_` 前缀，严禁出现在前端代码、请求头或构建产物 `dist/` 中**。
2. **先验通、再接入**：提供独立的终端冒烟测试脚本（`npm run test:ai`），验证接口地址、Model ID 与 Key 可正常返回。
3. **结构化稳定输出**：由服务端拼接业务系统提示词，要求模型输出严格 JSON（标题、主图短标题、3 条卖点、缺失信息提醒），并做容错解析，用户无需学习写提示词。
4. **优雅降级与完整交互态**：保留原有 `mockGenerator.ts` 作为「模拟演示模式」兜底；补齐生成中防连点、限流（429）提示、失败保留输入与重试机制。

---

## 2. 接口配置与环境变量规范

所有配置均从本地 `.env.local`（或部署平台环境变量）读取，不硬编码真实密钥：

| 环境变量名 | 示例 / 默认值 | 说明 |
|---|---|---|
| `AIOP_BASE_URL` | `https://aiop.whu.edu.cn/api/v1` | OpenAI 兼容协议基础地址，实际请求路径为 `${AIOP_BASE_URL}/chat/completions` |
| `AIOP_MODEL_ID` | `b0c5a237-a5fe-46fb-9007-f1cf17c5382b` | GLM-5.3-Flash 模型调用 ID |
| `AIOP_API_KEY` | `your_api_key_here` | 鉴权密钥（通过 `Authorization: Bearer <API_KEY>` 传入，仅在服务端使用） |

**仓库安全配置要求**：
- 检查并确保 `.gitignore` 包含 `.env`、`.env.local`、`.env.*.local`。
- 在根目录新增 `.env.example`，填写 `AIOP_BASE_URL`、`AIOP_MODEL_ID` 的默认值，并将 `AIOP_API_KEY=` 留空作为占位模板。

---

## 3. 服务端代理架构设计（兼顾本地开发与线上部署）

为了在不引入沉重后端框架的前提下隐藏 API Key，同时兼容本地 `npm run dev` 与 Vercel 部署，请按以下结构拆分服务端代码：

1. **核心服务模块 `server/aiService.ts`**：
   - 封装对 `${AIOP_BASE_URL}/chat/completions` 的 `fetch` 请求（设置合理超时，如 `30000ms`，使用 `AbortController`）。
   - 负责拼接业务提示词（见第 4 节）、解析模型返回 JSON、提取 `request_id`（若响应头或错误体包含）用于服务端日志排错，并将上游错误归一化为可读的业务错误码。
2. **本地开发代理插件 `server/viteAiPlugin.ts`**：
   - 在 `vite.config.ts` 中注册自定义 Vite 插件，使用 `loadEnv(mode, process.cwd(), '')` 在 Node 侧读取 `AIOP_*` 环境变量。
   - 拦截开发服务器路由 `POST /api/generate` 与 `GET /api/ai-health`（仅返回 `{ configured: boolean, model: string }`，**绝不返回密钥内容**）。
   - 解析请求体 JSON，调用 `server/aiService.ts`，返回统一 JSON 响应给前端。
3. **线上 Serverless 入口 `api/generate.ts` & `api/ai-health.ts`**（Vercel Functions 兼容格式）：
   - 复用 `server/aiService.ts`，确保项目推送到 GitHub 并连接 Vercel 配置环境变量后，线上同样能安全调用真实 AI。

---

## 4. 业务提示词与结构化输出规范（`server/promptBuilder.ts`）

### 4.1 支持的两种生成动作
`POST /api/generate` 请求体结构：
```ts
export interface GenerateApiRequest {
  action: 'full' | 'regen_point';
  product: {
    name: string;
    category: string;
    material?: string;
    specs?: string;
    audience?: string;
    highlights?: string;
    badgeText?: string;
  };
  template?: {
    name: string;
    copyTone: 'promo' | 'minimal' | 'lifestyle' | 'professional';
    titleFormulaHint?: string;
  };
  // 当 action === 'regen_point' 时传入
  targetPointIndex?: number;
  existingPoints?: string[];
}
```

### 4.2 提示词约束规则（必须写入 System Prompt）
- **角色定位**：资深中国电商运营文案专家（熟悉淘宝、抖音测款转化逻辑）。
- **事实约束（防编造）**：严格基于用户提供的商品信息生成，**禁止编造未提供的价格、折扣幅度、销量数据、质检认证或绝对化违禁词（如“全网第一”“100%有效”“最顶级”）**。
- **风格适配**：根据 `template.copyTone` 调整语气：
  - `promo`：大促冲量感、强利益点与行动号召；
  - `minimal`：克制极简、突出材质质感与现代审美；
  - `lifestyle`：场景种草感、贴近日常痛点与使用体验；
  - `professional`：参数清晰、强调工艺结构与实用性能。
- **字段格式要求**：
  - `action === 'full'` 时，要求模型**仅输出合法 JSON**（不要包裹额外解释文字）：
    ```json
    {
      "seoTitle": "22到30个汉字，包含核心搜索关键词的电商商品标题",
      "posterTitle": "6到12个汉字，适合放在商品主图上的精炼大字短标题",
      "sellingPoints": [
        "卖点1（材质/工艺角度，20-40字）",
        "卖点2（使用场景/痛点解决角度，20-40字）",
        "卖点3（核心体验/价值角度，20-40字）"
      ],
      "warnings": [
        "若缺少材质/规格/人群等关键字段，在此给出简短补充建议；信息齐全则为空数组"
      ]
    }
    ```
  - `action === 'regen_point'` 时，要求返回 `{ "sellingPoint": "与已有卖点不重复的新卖点文案（20-40字）" }`。
- **模型参数建议**：`temperature: 0.7`，`max_tokens: 800`（保留充足空间避免 JSON 被截断）。

### 4.3 健壮的 JSON 容错解析
- GLM / Flash 系列模型有时会输出 Markdown 代码块（` ```json ... ``` `）或思考标签（`<think>...</think>`）。
- 服务端解析函数必须先剔除 `<think>[\s\S]*?<\/think>` 与 Markdown 围栏，再截取首尾 `{ ... }` 执行 `JSON.parse`。
- 对解析结果进行字段类型校验：若 `seoTitle` 缺失或 `sellingPoints` 非非空字符串数组，返回明确的 `502` 解析异常错误供前端重试。

---

## 5. 终端冒烟测试脚本（`scripts/test-ai.mjs`）

在 `package.json` 中新增脚本 `"test:ai": "node scripts/test-ai.mjs"`：
- 零额外依赖读取根目录 `.env.local`（自行解析 `KEY=VALUE` 行）。
- 使用一组固定测试商品资料（如“轻量防泼水通勤双肩包，黑色尼龙材质”）直接向 `${AIOP_BASE_URL}/chat/completions` 发起真实请求。
- 在终端打印：HTTP 状态码、耗时（ms）、token 用量（若接口返回 `usage`）、以及解析后的结构化 JSON 结果。
- 若请求失败，打印清晰排查指引（区分：未创建 `.env.local`、401 鉴权失败、429 限流、网络超时）。

---

## 6. 前端接入与容错体验升级

### 6.1 服务调用层（`src/utils/aiClient.ts`）
- 新增 `generateProductCopy(payload)` 与 `regenerateSellingPoint(payload)`，请求自有接口 `POST /api/generate`。
- 页面初始化时请求 `GET /api/ai-health` 检测服务端密钥是否就绪：
  - 就绪时默认启用 **「真实 AI 模式（GLM-5.3-Flash）」**；
  - 若接口不可达（如部署在纯静态 GitHub Pages 环境）或未配置密钥，自动切换为 **「本地模拟演示模式」**，并在顶部状态栏给出清晰提示，保证页面随时可完整演示。
- 在顶部操作栏提供一个轻量开关，允许用户手动在「真实 AI（GLM-5.3-Flash）」与「模拟模式」之间切换。

### 6.2 批量生成与限流保护（防 429）
- 点击「批量生成全部商品」在真实 AI 模式下，**不要一次性并发发出所有请求**，改为**顺序逐条请求（或最大并发为 2）**，并在队列中实时更新每条商品的状态（`排队中` → `AI 生成中...` → `已生成` / `失败可重试`）。
- 某一条商品失败时，不中断其余商品，也不清空该商品已填表单，在对应卡片显示「重新生成」按钮。

### 6.3 四大交互状态与可读错误提示
1. **等待态**：点击「生成当前商品素材」或「单条重生成」后，按钮立即禁用并显示 `AI 生成中...`，同时保留左侧表单和中间 Canvas 预览，不闪烁清空。
2. **成功态**：生成的 `seoTitle`、`posterTitle`、`sellingPoints` 自动回填到右侧编辑区并**立刻触发中间 HTML5 Canvas 主图重绘**；若返回了 `warnings`，在文案区下方用温和的黄色提示条展示“AI 核对提醒”（例如：“未填写材质与尺寸，建议补充后再生成更精准卖点”）。
3. **失败态**：绝不向用户直接弹窗展示原始技术栈或 JSON 报错，按错误类型映射为自然中文提示并保留表单内容：
   - `401 / 403`：API Key 未配置或无效，请检查本地 `.env.local`。
   - `429`：请求过于频繁触发接口限流，请稍等几秒后重试。
   - `Timeout / Network`：AI 接口连接超时或网络异常，请检查网络或切换至“模拟模式”继续体验。
   - `Parse Error`：AI 返回内容格式异常，已保留你的商品信息，请点击重试。
4. **单条卖点重生成**：支持点击单条卖点旁的刷新图标，仅针对该条调用 `action: 'regen_point'` 替换，不覆盖其他已手动修改好的标题和卖点。

---

## 7. 执行与验收步骤
1. 更新 `.gitignore`，新建 `.env.example`。
2. 实现 `server/promptBuilder.ts`、`server/aiService.ts`、`server/viteAiPlugin.ts`、`api/generate.ts`、`api/ai-health.ts`，并在 `vite.config.ts` 中挂载代理插件。
3. 新增 `scripts/test-ai.mjs` 及 `package.json` 中的 `test:ai` 命令。
4. 新增 `src/utils/aiClient.ts`，将素材生成台的「单条生成」「批量生成」「单条卖点重生成」接入真实 AI 并保留模拟模式降级开关。
5. 运行 `npm run build` 确保 TypeScript 与 Vite 打包零报错，并检查 `dist/` 目录中**不包含** `AIOP_API_KEY` 任何明文。
6. 更新 `README.md`，补充 `.env.local` 配置方法与 `npm run test:ai` 验证步骤。