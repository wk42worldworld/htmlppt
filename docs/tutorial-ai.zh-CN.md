# AI 生成指南

这份指南面向 AI 模型、Agent、脚本和开发者。目标是生成 PPT.html Studio 可以稳定读取、播放和再次编辑的 deck JSON。

## 目录

1. 输出契约
2. Deck 基础结构
3. Slide 基础结构
4. 主题和版式选择
5. 常用字段格式
6. 推荐生成流程
7. 检查报告修复流程
8. 完整示例
9. 可直接复用的提示词
10. 常见错误清单

## 1. 输出契约

AI 应输出结构化 deck JSON，而不是自由 HTML。

必须遵守：

- `version` 必须是 `"0.1"`。
- 顶层必须包含 `title` 和 `slides`。
- `slides` 必须是非空数组。
- 每页必须包含 `layout` 和 `title`。
- 使用 `schema/ppt-html-v0.1.schema.json` 作为数据结构参考。
- 不要生成 CSS、脚本、绝对定位文本框或 PPTX XML。

推荐输出方式：

- 如果用户要直接粘贴到编辑器，可以输出纯 JSON。
- 如果在聊天中展示，可以放进 ```json 代码块，编辑器也能识别。
- 不要在 JSON 后面追加解释文字，除非用户明确要求。

## 2. Deck 基础结构

最小 deck：

```json
{
  "version": "0.1",
  "title": "产品介绍",
  "theme": "launch",
  "aspectRatio": "16:9",
  "slides": []
}
```

字段说明：

- `version`：当前固定为 `"0.1"`。
- `title`：文稿标题，也会影响默认文件名。
- `theme`：可选 `paper`、`launch`、`studio`、`boardroom`。
- `aspectRatio`：当前固定使用 `"16:9"`。
- `slides`：幻灯片数组。

主题建议：

| 主题 | 适合场景 |
| --- | --- |
| `paper` | 课程、知识分享、文档型汇报 |
| `launch` | 发布会、产品演示、强叙事演示 |
| `studio` | 产品方案、设计方案、工具介绍 |
| `boardroom` | 项目汇报、商业计划、管理层汇报 |

## 3. Slide 基础结构

通用 slide：

```json
{
  "id": "slide-1",
  "layout": "hero",
  "kicker": "Product",
  "title": "PPT.html",
  "subtitle": "AI 写结构，人类做编辑，浏览器负责播放",
  "body": "",
  "notes": ""
}
```

字段说明：

- `id`：稳定 ID，建议使用 `slide-1`、`slide-2`。
- `layout`：版式名称。
- `kicker`：短标签，可为空。
- `title`：页面标题。
- `subtitle`：页面副标题。
- `body`：正文段落。
- `notes`：演讲备注，给演讲者看。

写作建议：

- 标题控制在 20 到 36 个汉字或等量英文以内。
- 副标题不要写成长段落。
- 长解释放入 `body` 或拆成列表。
- 每页表达一个重点。

## 4. 主题和版式选择

支持的 layout：

| layout | 用途 | 关键字段 |
| --- | --- | --- |
| `hero` | 封面、开场 | `title`、`subtitle`、`image` |
| `section` | 章节页 | `title`、`body` |
| `text` | 正文和列表 | `title`、`body`、`items` |
| `imageRight` | 左文右图 | `title`、`body`、`items`、`image` |
| `imageLeft` | 左图右文 | `title`、`body`、`items`、`image` |
| `imageFull` | 全屏图片 | `title`、`subtitle`、`image` |
| `imageBackground` | 背景图文 | `title`、`subtitle`、`body`、`items`、`image` |
| `compare` | 左右对比 | `left`、`right` |
| `threeCards` | 三个观点 | `cards` |
| `quote` | 引用或观点 | `quote`、`author` |
| `timeline` | 流程、路线图 | `items` |
| `data` | 关键指标 | `metrics` |
| `chart` | 趋势、分组数值、占比 | `chart.kind`、`chart.labels`、`chart.series` |
| `table` | 对照表、计划表 | `table.columns`、`table.rows` |
| `code` | 代码展示 | `code` |
| `ending` | 结束页 | `title`、`subtitle` |

选择规则：

- 需要开场冲击：用 `hero`。
- 需要解释段落：用 `text`。
- 需要展示差异：用 `compare`。
- 需要表达三个卖点：用 `threeCards`。
- 需要讲时间顺序：用 `timeline`。
- 需要突出数字：用 `data`。
- 需要展示趋势、分组数值或占比：用 `chart`。
- 需要列明计划和状态：用 `table`。

## 5. 常用字段格式

图片：

```json
"image": {
  "src": "https://example.com/image.png",
  "alt": "产品界面截图",
  "caption": "可选图片说明",
  "fit": "cover"
}
```

`src` 可以是 URL，也可以是 `data:image/...;base64,...`。`fit` 使用 `cover` 表示填充裁切，使用 `contain` 表示完整显示。如果不确定图片来源，可以先留空，让人类在编辑器中选择本地图片。

列表或时间线：

```json
"items": [
  { "title": "第 1 周", "text": "确认需求和演示目标" },
  { "title": "第 2 周", "text": "完成原型并收集反馈" }
]
```

卡片：

```json
"cards": [
  { "title": "结构清晰", "text": "AI 生成 JSON，人类继续编辑。" },
  { "title": "单文件分享", "text": "一个 .ppt.html 文件即可播放。" },
  { "title": "稳定渲染", "text": "版式由渲染器统一处理。" }
]
```

指标：

```json
"metrics": [
  { "value": "3x", "label": "起稿速度", "detail": "从空白到可演示初稿。" },
  { "value": "1 file", "label": "交付文件", "detail": "无需额外资源目录。" }
]
```

图表：

```json
"chart": {
  "kind": "bar",
  "labels": ["Q1", "Q2", "Q3", "Q4"],
  "series": [
    { "name": "收入", "values": [12, 20, 31, 42] },
    { "name": "成本", "values": [8, 11, 18, 24] }
  ],
  "unit": "万元"
}
```

`bar` 适合对比，`line` 适合趋势，`donut` 适合占比。环形图会使用第一个数据系列作为分组。

对比：

```json
"left": {
  "title": "传统 PPT",
  "text": "格式复杂\nAI 难以稳定生成\n二次编辑成本高"
},
"right": {
  "title": "PPT.html",
  "text": "结构清晰\nAI 容易生成\n人类可以继续编辑"
}
```

表格：

```json
"table": {
  "columns": ["阶段", "时间", "状态"],
  "rows": [
    ["需求确认", "第 1 周", "完成"],
    ["原型验证", "第 2 周", "进行中"]
  ]
}
```

## 6. 推荐生成流程

1. 先理解用户目标、受众、场景和语气。
2. 生成 5 到 10 页大纲。
3. 为每页选择一个 layout。
4. 写短标题和必要的结构化字段。
5. 检查每页是否只表达一个重点。
6. 输出完整 deck JSON。
7. 如果用户返回检查报告，按报告修复。

建议默认页序：

1. `hero`：主题和一句话价值。
2. `section` 或 `text`：背景或问题。
3. `compare`：旧方式 vs 新方式。
4. `threeCards`：解决方案或能力。
5. `data` 或 `chart`：关键结果。
6. `timeline` 或 `table`：计划。
7. `ending`：总结和下一步。

## 7. 检查报告修复流程

当用户粘贴 PPT.html Validation Report 时，按以下顺序处理：

1. 读取 `Status`。
2. 优先修复所有 `ERROR`。
3. 再修复 `WARNING`。
4. 最后根据需要处理 `TIP`。
5. 保持原有 deck 意图，不要重写成另一份内容。
6. 输出完整修复后的 deck JSON。

路径示例：

- `version`：修改顶层 `version`。
- `slides[2].layout`：修改第 3 页的版式。
- `slides[4].metrics`：修改第 5 页的数据指标。
- `slides[1].image.src`：补充或删除图片字段。

修复时不要：

- 输出 HTML。
- 只输出局部片段。
- 删除用户已有重要内容。
- 把 `version` 改成其他值。

## 8. 完整示例

```json
{
  "version": "0.1",
  "title": "PPT.html Studio 产品介绍",
  "theme": "studio",
  "aspectRatio": "16:9",
  "slides": [
    {
      "id": "slide-1",
      "layout": "hero",
      "kicker": "Product",
      "title": "PPT.html Studio",
      "subtitle": "AI 写结构，人类编辑，浏览器播放",
      "notes": "开场强调这不是 PPTX 替代品，而是 AI 时代的新格式。"
    },
    {
      "id": "slide-2",
      "layout": "compare",
      "kicker": "Problem",
      "title": "传统 PPT 与 AI 的错位",
      "left": {
        "title": "传统 PPT",
        "text": "文件结构复杂\n坐标和样式碎片化\nAI 难以稳定维护"
      },
      "right": {
        "title": "PPT.html",
        "text": "JSON 结构清楚\n模板负责排版\n人类可以继续编辑"
      }
    },
    {
      "id": "slide-3",
      "layout": "threeCards",
      "kicker": "Workflow",
      "title": "三步完成演示",
      "cards": [
        { "title": "生成结构", "text": "AI 输出 deck JSON。" },
        { "title": "可视化编辑", "text": "人类调整内容、图片和顺序。" },
        { "title": "单文件分享", "text": "导出一个可播放的 .ppt.html。" }
      ]
    },
    {
      "id": "slide-4",
      "layout": "data",
      "kicker": "Value",
      "title": "为什么值得使用",
      "metrics": [
        { "value": "1 file", "label": "交付形态", "detail": "没有资源目录也能播放。" },
        { "value": "4", "label": "平台构建", "detail": "Linux、macOS arm64、macOS x64、Windows。" },
        { "value": "0.1", "label": "稳定格式", "detail": "结构简单，容易被 AI 生成和修复。" }
      ]
    },
    {
      "id": "slide-5",
      "layout": "ending",
      "title": "让 AI 和人类共同编辑演示文稿",
      "subtitle": "下一步：用模板生成你的第一份 .ppt.html"
    }
  ]
}
```

## 9. 可直接复用的提示词

生成新文稿：

```text
请为 PPT.html Studio 生成完整 deck JSON。
要求：
- version 必须是 "0.1"
- 输出 6 页
- 主题使用 boardroom
- 每页必须有 id、layout、title
- 优先使用 hero、compare、threeCards、data、chart、table、ending
- 不要输出自由 HTML
- 不要解释，直接输出 JSON

演示主题：
{在这里写主题}

受众：
{在这里写受众}

语气：
{正式 / 轻松 / 产品发布 / 教学}
```

根据检查报告修复：

```text
下面是 PPT.html Validation Report。
请按报告修复 deck JSON：
- 先修 ERROR
- 再修 WARNING
- 保持 version 为 "0.1"
- 不要输出 HTML
- 输出完整修复后的 deck JSON
```

## 10. 常见错误清单

生成前自检：

- `version` 是否是 `"0.1"`。
- `theme` 是否是 `paper`、`launch`、`studio`、`boardroom` 之一。
- `slides` 是否至少有 1 页。
- 每页是否有有效 `layout`。
- 每页是否有 `title`。
- `threeCards` 是否不超过 3 张卡片。
- `data` 是否不超过 3 个指标。
- `chart` 是否包含标签和数字数据系列。
- `timeline` 是否不超过 5 个条目。
- 图片是否有 `alt`。
- 是否没有输出自由 HTML。

如果不确定某页用什么 layout，优先使用 `text`，因为它最通用。
