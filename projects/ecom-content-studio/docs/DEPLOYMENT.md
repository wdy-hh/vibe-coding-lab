# 部署与真实 AI

源码目录为 `projects/ecom-content-studio/`。应用支持静态模拟演示，以及带服务端代理的真实 GLM-5.3-Flash 模式。

## GitHub Pages

[在线演示](https://wdy-hh.github.io/vibe-coding-lab/projects/ecom-content-studio/)

沿用仓库的 `.github/workflows/deploy-pages.yml`。相关代码推送至 `main` 后，工作流使用 Node.js 24，为演示项目安装锁定依赖、运行测试、构建，再将本项目 `dist/` 复制到 `build/pages/projects/ecom-content-studio/`，统一发布至 Pages。

Pages 只提供静态资源，没有 `/api/` 服务。应用检测后自动启用模拟模式，不需要配置任何密钥。真实请求失败时会显示错误，不会用模拟结果冒充真实 AI。

`base: './'` 保证子目录资源加载；Service Worker 的作用域限制在本应用目录，并跳过 API 请求。首次加载后可离线使用模拟模式。草稿保存在当前浏览器，不能自动迁移到其他域名。

## 本地真实 AI

在本项目目录使用 Node.js 24：

```bash
npm install
```

首次配置时复制 `.env.example` 为 `.env.local`，在本地文件填写 `AIOP_API_KEY`。保留示例中的 `AIOP_BASE_URL`、`AIOP_MODEL_ID`，然后运行：

```bash
npm run test:ai
npm run dev
```

`test:ai` 会消耗少量真实模型额度。页面健康检查只返回配置状态及模型 ID，不返回密钥。本地开发与 `npm run preview` 都通过服务端代理请求 AIOP。

## Vercel 真实 AI

1. 导入本仓库，Root Directory 选择 `projects/ecom-content-studio`。
2. 使用 Vite / Node.js 24，Build Command 为 `npm run build`，Output Directory 为 `dist`。
3. 在服务端 Environment Variables 中配置 `AIOP_BASE_URL`、`AIOP_MODEL_ID`、`AIOP_API_KEY`，值参考本项目 `.env.example` 和自己的私有密钥。
4. 部署后检查 `/api/ai-health`，应仅返回 `configured`、`model`。页面自动启用真实 AI。

`api/generate.ts` 和 `api/ai-health.ts` 读取服务端环境变量。`vercel.json` 为生成函数预留 105 秒，上游超时 90 秒，浏览器等待上限 95 秒。该 GLM 接口的思考 tokens 计入输出预算，实测使用 4096 输出预算才能完整返回 JSON。

代理提供请求体校验、同源检查、并发上限和进程内限流；多实例之间的限流状态不共享。图片不上传至模型，只发送商品文字信息。

## 发布检查

```bash
npm test
npm run build
```

普通测试通过模拟上游响应运行，无需密钥，也不消耗模型额度。构建包含 TypeScript、Vite、Service Worker 生成和前端密钥扫描，发现泄漏会终止构建。

提交代码时只包含 `.env.example`，不包含 `.env.local`、`node_modules/`、`dist/` 或临时测试文件。生产密钥通过托管平台的服务端环境变量配置，不使用 `VITE_` 前缀。
