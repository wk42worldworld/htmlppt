# PPT.html v0.1 Format

PPT.html v0.1 的目标是成为一种 AI 友好、人类可编辑、浏览器可播放的演示文稿单文件格式。

## 文件约定

推荐文件名：

```text
project-name.ppt.html
```

文件本质是 HTML，必须包含：

```html
<html data-format="ppt.html" data-version="0.1">
  <script id="ppt-html-data" type="application/vnd.ppt-html+json">
    {...deck json...}
  </script>
</html>
```

编辑器通过 `#ppt-html-data` 读取结构化数据；浏览器通过内置播放器播放页面。

## Deck

```json
{
  "version": "0.1",
  "title": "AI 导演相机",
  "theme": "launch",
  "transition": "fade",
  "aspectRatio": "16:9",
  "slides": []
}
```

字段：

- `version`：格式版本，当前为 `0.1`。
- `title`：演示文稿标题。
- `theme`：主题名称。
- `transition`：默认切换动效，可选 `none`、`fade`、`slide`、`push`、`zoom`。
- `aspectRatio`：当前固定支持 `16:9`。
- `slides`：幻灯片数组。

## Slide

```json
{
  "id": "slide-1",
  "layout": "hero",
  "transition": "inherit",
  "kicker": "PRODUCT LAUNCH",
  "title": "AI 导演相机",
  "subtitle": "让普通人像导演一样设计镜头",
  "body": "用于长段落正文。",
  "image": {
    "src": "",
    "alt": "",
    "caption": "",
    "fit": "cover"
  },
  "video": {
    "src": "",
    "poster": "",
    "caption": "",
    "fit": "cover",
    "controls": true
  },
  "audio": {
    "src": "",
    "caption": "",
    "controls": true
  },
  "textBoxes": [],
  "items": [],
  "cards": [],
  "metrics": [],
  "chart": {
    "kind": "bar",
    "labels": [],
    "series": [],
    "unit": ""
  },
  "table": {
    "columns": [],
    "rows": []
  },
  "quote": "",
  "author": "",
  "code": "",
  "notes": "",
  "canvas": {}
}
```

## Layouts

v0.1 支持这些版式：

- `hero`：封面页
- `section`：章节页
- `text`：文本页
- `imageRight`：左文右图
- `imageLeft`：左图右文
- `imageFull`：全屏图片
- `imageBackground`：背景图文
- `compare`：对比页
- `threeCards`：三卡片页
- `quote`：引用页
- `timeline`：时间线页
- `data`：数据页
- `chart`：图表页
- `video`：视频页
- `audio`：音频页
- `table`：表格页
- `code`：代码页
- `ending`：结束页

## Transitions

切换动效用于演示模式和导出的单文件播放器。

- Deck 级 `transition` 是全局默认值，默认 `fade`。
- Slide 级 `transition` 可以覆盖当前页进入时的动效，默认 `inherit`。
- 支持值：`none`、`fade`、`slide`、`push`、`zoom`。
- Slide 级额外支持 `inherit`，表示跟随 deck 默认值。
- 播放器会尊重系统的 `prefers-reduced-motion: reduce`，此时自动禁用切换动画。

## 单文件资源约定

`.ppt.html` 的分享形态是一个完整 HTML 文件。导出时，渲染器 CSS、播放器 JavaScript 和 deck JSON 都会写入同一个文件；编辑器保存前会尝试把外部媒体资源打包为 Data URI：

- `image.src`
- `video.src`
- `video.poster`
- `audio.src`

AI 可以输出可访问的 URL 或 Data URI。无法确定资源时应留空，让人类在编辑器里选择本地文件。不要输出只在某台机器上有效的临时路径。

## Image Fields

`image` 支持：

- `src`：图片 URL 或 data URI。
- `alt`：替代文字，便于无障碍和 AI 理解图片内容。
- `caption`：图片说明，会显示在图片上。
- `fit`：图片适配方式，`cover` 表示填充裁切，`contain` 表示完整显示。

## Video Fields

`video` 支持：

- `src`：视频 URL 或 `data:video/...` Data URI。
- `poster`：封面图 URL 或 `data:image/...` Data URI。
- `caption`：视频说明。
- `fit`：视频适配方式，`cover` 或 `contain`。
- `controls`：是否显示浏览器原生播放控件。
- `autoplay`、`loop`、`muted`：可选播放行为。

## Audio Fields

`audio` 支持：

- `src`：音频 URL 或 `data:audio/...` Data URI。
- `caption`：音频说明。
- `controls`：是否显示浏览器原生播放控件。
- `autoplay`、`loop`、`muted`：可选播放行为。

## Text Boxes

`textBoxes` 是可选字段，用于保存人类在画布上插入的少量自由文本框。它适合标注、临时补充说明和局部强调；AI 生成主内容时仍应优先使用结构化字段和版式。

```json
"textBoxes": [
  {
    "id": "textbox-1",
    "text": "双击直接编辑",
    "x": 450,
    "y": 270,
    "w": 380,
    "h": 96
  }
]
```

字段：

- `text`：文本框内容。
- `x`、`y`：文本框左上角在 1280 × 720 幻灯片坐标中的位置。
- `w`：文本框宽度。
- `h`：文本框最小高度。
- 人类拖动或缩放文本框后，编辑器会直接更新该文本框的 `x`、`y`、`w`、`h`。旧文件中如果存在 `canvas["textBoxes.0.text"]`，播放器仍会兼容渲染。

## Chart Fields

`chart` 支持柱状图、折线图和环形图：

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

字段：

- `kind`：图表类型，支持 `bar`、`line`、`donut`。
- `labels`：横轴标签或环形图分组标签，建议 2-8 个。
- `series`：数据系列数组。柱状图和折线图可使用多个系列；环形图使用第一个系列。
- `unit`：可选单位，会显示在图例或环形图中心。

## Canvas Offsets

`canvas` 是可选字段，用于保存人类在编辑器画布上拖动元素后的轻量位置微调。它不是自由布局系统，而是结构化版式之上的小范围偏移。

```json
"canvas": {
  "title": { "x": 24, "y": 36, "w": 720, "h": 96 },
  "cards.0.title": { "x": -12, "y": 8 },
  "table.rows.1.2": { "x": 8, "y": 0 }
}
```

约定：

- 键名是结构化字段路径，例如 `title`、`subtitle`、`cards.0.title`、`metrics.1.value`。
- `x` 和 `y` 使用 1280 × 720 幻灯片坐标中的像素偏移。
- `w` 和 `h` 是可选字段，用于保存编辑器画布缩放后的宽度和最小高度。
- AI 修改内容时应保留已有 `canvas`，除非用户要求重置布局。
- 大范围排版变化仍应通过切换 `layout`、拆页或修改结构字段完成。

## AI 输出建议

AI 应优先输出 deck JSON，而不是自由 HTML。最小可用格式：

```json
{
  "version": "0.1",
  "title": "演示标题",
  "theme": "launch",
  "aspectRatio": "16:9",
  "slides": [
    {
      "id": "slide-1",
      "layout": "hero",
      "title": "标题",
      "subtitle": "副标题"
    }
  ]
}
```

编辑器会把 deck JSON 导出为可播放的 `.ppt.html` 单文件。

## 编辑器工作流

PPT.html Studio v0.2 在不改变 v0.1 数据结构的前提下增加了产品工作流：

- 模板：从产品发布、课程课件、项目汇报或 demo deck 生成初稿。
- 文件：桌面端可以打开、保存、另存为 `.ppt.html`。
- 图片：本地图片可以转成 `data:image/...` 写入 `image.src`，并可设置 `image.fit` 与 `image.caption`。
- 图表：图表页可以用结构化 `chart.labels` 和 `chart.series` 渲染柱状、折线或环形图。
- 画布：标题、卡片、指标、表格等可双击直接编辑，也可拖动、缩放并保存为轻量 `canvas` 几何数据。
- 检查：编辑器会输出 PPT.html Validation Report，供人类阅读或交给 AI 修复。

检查报告不是文件格式的一部分；它是编辑器围绕 v0.1 JSON 生成的诊断文本。
