# AI Agent 接入方案

这份文档面向要接入 PPT.html Studio 的 Codex、内容生成 agent、测试 agent、自动化脚本和外部开发者。目标是让 agent 能稳定生成、修改、验证和导出 `.ppt.html`，同时不破坏人类在画布里做过的编辑。

## 1. 产品定位

PPT.html Studio 不是让 AI 写自由 HTML，也不是复刻 PPTX 内部结构。它的核心是：

- AI 编辑结构化 deck JSON。
- 人类像 Keynote / PowerPoint 一样在画布上编辑。
- 软件把 JSON、资源、渲染器和播放器打包成一个 `.ppt.html` 文件。

因此所有 agent 都应该围绕 deck JSON 工作，而不是直接改最终 HTML 的 DOM。

## 2. Agent 类型

推荐把接入 agent 分成五类：

| Agent | 主要职责 | 默认入口 |
| --- | --- | --- |
| 内容生成 agent | 根据主题生成完整 deck JSON | `skills/htmlppt`、`docs/tutorial-ai.*` |
| 修复 agent | 根据 Validation Report 修复 deck | `npm run deck:validate -- --json` |
| 编辑 agent | 修改指定页面、对象、图表、表格或文案 | deck JSON + 保留 `id/canvas/styles/objects` |
| 测试 agent | 跑只读测试、导出回读、检查单文件资产 | `npm run test:readonly`、`deck:*` |
| 发布 agent | 检查版本、release、构建产物和文档链接 | `.github/workflows/**`、`README.md` |

多个 agent 并行时，按文件和职责拆分，不要让两个 agent 同时改同一块 UI 或同一个 schema 区域。

## 3. 接入层级

### 3.1 最轻接入：只读文档

外部 agent 只需要读取：

- `docs/tutorial-ai.zh-CN.md`
- `schema/ppt-html-v0.1.schema.json`
- `spec/ppt-html-v0.1.md`

适合一次性生成 deck JSON。

### 3.2 推荐接入：Skill + CLI

Codex 或兼容 skill 的 agent 使用：

- `skills/htmlppt/SKILL.md`
- `skills/htmlppt/references/*.md`
- `scripts/agent-deck.js`

安装到本机 Codex：

```bash
npm run skill:install -- --force
```

或手动复制：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/htmlppt "${CODEX_HOME:-$HOME/.codex}/skills/htmlppt"
```

### 3.3 自动化接入：CLI 管线

CLI 支持验证、抽取和构建：

```bash
npm run deck:validate -- path/to/deck.json
npm run deck:validate -- path/to/deck.ppt.html --json
npm run deck:extract -- path/to/deck.ppt.html path/to/deck.json
npm run deck:build -- path/to/deck.json path/to/deck.ppt.html
```

`--json` 给自动化 agent 使用，普通用户或人工调试用文本报告即可。

## 4. 标准工作流

### 4.1 生成新演示文稿

1. 读取用户主题、受众、页数和语言。
2. 输出完整 deck JSON。
3. 运行：

```bash
npm run deck:validate -- draft.json
```

4. 修复所有 `ERROR`。
5. 需要文件时运行：

```bash
npm run deck:build -- draft.json output.ppt.html
```

### 4.2 修改已有 `.ppt.html`

1. 抽取 JSON：

```bash
npm run deck:extract -- old.ppt.html old.deck.json
```

2. 按要求修改 JSON。
3. 保留已有 `id`、`canvas`、`styles`、`textBoxes`、`objects`、媒体 `src` 和 `notes`。
4. 验证并重新构建：

```bash
npm run deck:validate -- old.deck.json
npm run deck:build -- old.deck.json new.ppt.html
```

### 4.3 修复校验报告

1. 先修复 `ERROR`。
2. 再修复关键 `WARNING`。
3. `TIP` 只作为质量建议。
4. 输出完整修复后的 deck JSON，不输出局部片段。

### 4.4 最终交付检查

最终 `.ppt.html` 应该尽量无外部资源：

```bash
npm run deck:validate -- final.ppt.html --strict-assets
```

如果有外部资源，报告会列出 slide、字段路径和 `src`。桌面端保存会尝试把本地资源打包为 Data URI。

## 5. Agent 必须遵守的格式规则

- `version` 固定为 `"0.1"`。
- `aspectRatio` 固定为 `"16:9"`。
- `theme` 使用 `paper`、`launch`、`studio`、`boardroom`。
- deck 必须包含非空 `slides`。
- 每页至少有 `layout` 和 `title`。
- 不要输出自由 HTML/CSS/JS/PPTX XML。
- 不要写临时本地路径到 `image.src`、`video.src`、`audio.src`。
- 修改已有 deck 时，默认保留人类编辑产生的结构。

## 6. 功能使用方式

### 验证

```bash
npm run deck:validate -- deck.json
npm run deck:validate -- deck.json --json
```

文本报告适合人看，JSON 报告适合 agent 自动判断。

### 抽取

```bash
npm run deck:extract -- deck.ppt.html deck.json
```

支持纯 JSON、聊天里的 ```json 代码块，以及 `.ppt.html` 中的 `#ppt-html-data`。

### 构建

```bash
npm run deck:build -- deck.json deck.ppt.html
```

构建前会先验证原始 deck。验证失败时不会输出 standalone 文件。

### 只读测试

```bash
npm run test:readonly
```

这个命令不会重写示例文件，适合 agent 探索和并行验收。

### 完整测试

```bash
npm test
git diff -- examples/ai-camera.ppt.html
```

`npm test` 会重建示例。只有渲染器输出确实变化时，才应该保留示例 diff。

## 7. 多 Agent 并行计划

当前最值得继续完善的方向：

### P0 已开始落地

- Agent CLI：验证、抽取、构建。
- Codex Skill：统一生成、修复和维护规则。
- 仓库级 `AGENTS.md`：说明多人协作、测试和常见坑。
- 接入文档：说明其它 agent 怎么接进来。

### P0 下一步

- 对 `slide.objects[]` 做对象级校验：重复 id、越界、图表数据、表格行列、媒体资源。
- 给图片/视频/音频、图表、表格做 Typed Inspector，减少普通用户编辑 JSON 的需求。
- 增加“一键复制 AI 修复 Prompt”：当前 JSON + 校验报告 + 修复规则。
- 支持导出 `deck.json` 和校验报告文件。

### P1

- AI Patch 审阅：接受对象级或字段级修改，而不是整份替换。
- PDF/PNG 导出。
- 图层列表、锁定、组合、吸附参考线。
- 模块注册表，统一 UI、schema、docs、tests。

### P2

- 本地 MCP 或服务模式：`create_deck`、`validate_deck`、`export_deck`、`patch_slide_object`。
- PPTX/ODP 兼容导入导出。
- 品牌模板、母版、页码、统一字体和主题 tokens。

## 8. 示例 Prompt

生成新 deck：

```text
请使用 PPT.html Studio deck JSON 格式生成 8 页中文产品发布演示。
只输出完整 JSON，不输出 HTML/CSS/解释文字。
version 必须是 "0.1"，aspectRatio 必须是 "16:9"。
优先使用结构化 layout，不要滥用 textBoxes。
```

修复 deck：

```text
下面是 PPT.html Validation Report 和原始 deck JSON。
请修复所有 ERROR，再修复关键 WARNING。
保持原有 id、canvas、styles、textBoxes、objects、media src 和 notes。
只输出完整修复后的 deck JSON。
```
