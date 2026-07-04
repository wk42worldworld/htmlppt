# PPT.html Studio

PPT.html Studio 是一个面向 AI 时代的演示文稿工具。它不让 AI 直接写复杂 PPTX，也不要求人类写 HTML，而是使用一种结构化的 `.ppt.html` 文件：AI 生成 JSON，软件渲染成漂亮幻灯片，人类继续可视化编辑。

## 新版介绍

v0.2.0 开始，PPT.html Studio 不只是一个格式原型，而是一条完整的创作流程：从模板起稿，用可视化编辑器调整内容，把 AI 生成的 JSON 直接粘贴进来，运行质量检查，再保存成一个可以分享和再次编辑的 `.ppt.html` 文件。

它的核心定位是：AI 写结构，人类做判断，渲染器负责稳定排版。

## 适合谁

- 用 AI 生成汇报、课程、路演和产品介绍的人
- 希望文件能离线播放、直接分享、再次编辑的人
- 不想手工调整一堆文本框和坐标的团队

## 核心能力

- 单文件 `.ppt.html` 分享和播放
- 桌面端打开、保存、另存为 `.ppt.html`
- 产品发布、课程课件、项目汇报等起稿模板
- 可视化编辑标题、正文、图片、对比、卡片、数据、表格、代码
- AI JSON 导入
- 质量检查报告，可直接复制给 AI 修复
- 12 种基础版式和 4 套主题
- GitHub Actions 自动构建 Linux、macOS arm64、macOS x64、Windows 程序，并支持 macOS 签名与公证配置

## 快速开始

```bash
npm install
npm run serve
```

打开 `http://localhost:5173`。

## 五分钟教程

1. 打开 PPT.html Studio。
2. 点击 `模板`，选择产品发布、课程课件、项目汇报或 demo deck。
3. 在右侧面板修改标题、副标题、数据、表格和备注。
4. 需要 AI 起稿时，点击 `AI JSON`，直接粘贴 AI 输出的 JSON 或带 `json` 围栏的代码块。
5. 点击 `检查`，把检查报告复制给 AI 修复错误或警告。
6. 点击 `演示` 预览播放效果。
7. 浏览器版点击 `保存 / 下载`；桌面版使用 `保存` 或 `另存为`，得到一个可分享的 `.ppt.html` 文件。

更完整的说明见：

- [普通用户教程](tutorial-human.zh-CN.md)
- [AI 生成指南](tutorial-ai.zh-CN.md)
- [产品路线图](roadmap.zh-CN.md)
- [macOS 签名与公证指南](macos-notarization.zh-CN.md)
