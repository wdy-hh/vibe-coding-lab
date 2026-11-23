# GitHub 在线体验

直接打开 [Gesture Particle System](https://wdy-hh.github.io/vibe-coding-lab/projects/gesture-particle-system/)，点击 Start Camera 并允许摄像头。建议使用电脑端 Chrome / Edge。

源码页用于浏览文件；在线演示由 GitHub Pages 提供 HTTPS 页面。首次进入新域名时需要单独允许摄像头，视频仍在访问者的浏览器本机处理。

## 自动部署

仓库根目录的 `.github/workflows/deploy-pages.yml` 在 main 分支的项目、部署工作流或 site 文件更新后运行，也可以在 Actions 手动运行。

构建任务安装锁定依赖、运行 38 项单元测试、校验模型、同步本地 WASM，再执行 Vite 生产构建。`npm run pages:package` 将构建结果整理为：

```text
build/pages/
├── index.html
├── .nojekyll
└── projects/gesture-particle-system/
    ├── index.html
    ├── assets/
    ├── models/
    ├── wasm/
    └── licenses/
```

上传该目录后，部署任务使用 GitHub Pages 的短期令牌发布。无需在仓库中保存个人令牌或额外服务密钥。官方 Actions 版本以完整提交 SHA 固定。

Vite 保留相对 base，使 JS、模型和 WASM 能在 `/vibe-coding-lab/projects/gesture-particle-system/` 子路径正确加载。

## 查看与排查

- [部署记录](https://github.com/wdy-hh/vibe-coding-lab/actions/workflows/deploy-pages.yml)：最近一次工作流应为绿色成功。
- [Pages 设置](https://github.com/wdy-hh/vibe-coding-lab/settings/pages)：Source 为 GitHub Actions。
- 修改提交后需等待工作流完成；旧页面可尝试刷新。
- 摄像头权限拒绝时，在浏览器地址栏的网站权限中重新允许，再点击 Start Camera。
- 如果只有源码可看，确认访问的是 github.io 在线演示地址。
