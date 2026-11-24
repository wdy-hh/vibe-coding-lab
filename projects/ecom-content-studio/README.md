# 电商内容工作台 · E-Com Studio

基于 React 18、TypeScript、Vite、Tailwind CSS 和 lucide-react 的纯前端电商内容创作工具。支持商品批量录入、模拟内容生成、800×800 Canvas 主图合成导出、模板复用和历史草稿。

[在线体验](https://wdy-hh.github.io/vibe-coding-lab/projects/ecom-content-studio/) · [返回演示首页](https://wdy-hh.github.io/vibe-coding-lab/) · [部署说明](docs/DEPLOYMENT.md)

## 本地启动

建议使用 Node.js 24，与仓库的 GitHub Actions 环境保持一致。在克隆后的仓库根目录执行：

```powershell
cd projects/ecom-content-studio
npm ci
npm run dev
```

打开终端显示的地址，默认是 **http://127.0.0.1:5173**。若端口被占用，Vite 会显示其他可用端口。

## 验证与生产预览

```powershell
npm test
npm run build
npm run preview
```

`npm run build` 先完成严格 TypeScript 检查，再将静态文件打包到 `dist/` 并生成离线缓存。生产预览默认地址为 **http://127.0.0.1:4173**。不要直接双击 `index.html`；请通过本地 HTTP 服务或静态托管访问。

Vite 配置使用 `base: './'`，可将 `dist/` 部署到 GitHub Pages 子路径或普通静态托管平台。

## 使用流程

1. 首次打开自动加载 3 款示例商品；第一款已生成素材，可立即体验编辑、切换风格和下载 PNG。
2. 新建空白商品，填写名称、类目，点击或拖拽上传 JPG / PNG / WebP（单张最大 5 MB）。展开「更多商品参数」可补充材质、规格、人群与亮点。
3. 选择模板后生成当前商品，或批量生成所有商品。每款模拟延迟 600–900ms；生成期间会禁用重复操作。
4. 直接编辑 SEO 标题、主图短标题、角标和卖点。支持单条卖点换写、增删、复制全文和定稿。
5. 点击「存为复用模板」保存视觉风格、文案语气、标题公式与标签。在资产库中筛选、搜索、修改、应用或删除模板。
6. 点击「保存当前批次到历史」保留完整快照；从草稿箱重新打开后再次保存，会更新同一条历史批次。

CSV 模板可从顶部「批量导入 CSV」菜单或工作台底部直接下载。表头为：

```text
商品名称,商品类目,材质,颜色规格,目标人群,核心卖点,角标文案
```

模板包含 UTF-8 BOM，支持 Excel 中文打开和带引号字段。导入以追加方式保留已有商品，导入失败不改动队列。CSV 不包含图片，导入后需逐款补充本地图片。单次最多导入 100 款，文件不超过 2 MB。

## 离线与数据

- 无后端、账号或真实 AI / 外部 API 调用。生成结果根据输入参数与模板规则在浏览器中动态拼装；实际使用前可自行编辑。
- 示例图片均为自包含 SVG Data URL；上传图片通过 FileReader 转为 Data URL，不依赖网络图床，不污染 Canvas。
- 当前批次、模板和历史使用 `ecom_studio_v1_state` 键保存到 `localStorage`，带读取校验、异常提示和刷新前保存保护。
- 浏览器存储容量有限。若保存失败，页面会提示；当前内容仍可编辑与导出，可删除不需要的历史或换用较小图片后重试。
- 生产版本通过 Service Worker 缓存完整应用。在 localhost 或 HTTPS 下首次访问成功后可离线重新打开。开发模式不注册缓存，以便即时查看代码变动。
- 数据仅存于当前浏览器及当前站点地址；清除站点数据、更换浏览器或端口不会自动迁移草稿。侧边栏可确认后恢复默认演示数据。

## 项目结构

```text
src/
  components/        通用弹窗、导航、商品表单、Canvas 预览、文案编辑
  pages/             生成台、模板资产库、历史批次
  hooks/useStudio.ts  状态、批量生成、自动保存与业务操作
  data/demoData.ts    示例商品、独立 SVG 图片、预设模板
  utils/
    mockGenerator.ts 参数驱动的模拟生成引擎
    canvasRenderer.ts 高清主图渲染、中文换行与 PNG 下载
    csvHelper.ts     CSV 解析、模板下载与文件工具
    storage.ts       版本化存储与数据恢复
  types.ts           规格要求的 TypeScript 数据模型
scripts/             构建后生成离线缓存
tests/               CSV、生成规则、中文换行等关键逻辑测试
```

`SPEC.md` 保存了用户提供的原始开发交接规格。
