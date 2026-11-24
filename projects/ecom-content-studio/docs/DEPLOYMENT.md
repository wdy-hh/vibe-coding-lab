# GitHub Pages 部署

在线地址：https://wdy-hh.github.io/vibe-coding-lab/projects/ecom-content-studio/

源码位于 `projects/ecom-content-studio/`，使用仓库已有的 `.github/workflows/deploy-pages.yml` 与其他项目一起部署。

## 自动发布流程

推送 `main` 分支且修改本项目、粒子手项目、演示首页或工作流时，GitHub Actions 会：

1. 使用 Node.js 24 安装两个项目各自锁定的依赖，运行测试并构建。
2. 保留现有粒子手项目的打包流程，将演示首页与粒子手构建结果放入 `build/pages/`。
3. 将本项目的 `dist/` 复制到 `build/pages/projects/ecom-content-studio/`。
4. 上传统一的 Pages 产物并发布到 GitHub Pages。

也可以在 Actions 中手动运行「Deploy demos to GitHub Pages」。构建失败会阻止发布，现有线上版本会继续保留。

## 本地验证

在本项目目录执行：

```bash
npm ci
npm test
npm run build
npm run preview
```

`vite.config.ts` 中的 `base: './'` 保证脚本、样式和图标相对于当前项目子目录加载。Service Worker 的作用域限制在当前应用子目录，缓存名称也包含该作用域，不会接管演示首页或粒子手项目。

首次成功访问后，应用会缓存离线所需文件；顶部出现「离线可用」后可断网重新打开。所有自定义数据保存在当前浏览器的 `localStorage`，本地与线上地址的草稿互不迁移。

本项目使用模拟生成引擎，不需要服务端、API Key、GitHub Secrets 或其他外部服务配置。源代码入库时不包含 `node_modules/`、`dist/` 或本地测试文件。
