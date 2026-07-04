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
  "aspectRatio": "16:9",
  "slides": []
}
```

字段：

- `version`：格式版本，当前为 `0.1`。
- `title`：演示文稿标题。
- `theme`：主题名称。
- `aspectRatio`：当前固定支持 `16:9`。
- `slides`：幻灯片数组。

## Slide

```json
{
  "id": "slide-1",
  "layout": "hero",
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
  "items": [],
  "cards": [],
  "metrics": [],
  "table": {
    "columns": [],
    "rows": []
  },
  "quote": "",
  "author": "",
  "code": "",
  "notes": ""
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
- `table`：表格页
- `code`：代码页
- `ending`：结束页

## Image Fields

`image` 支持：

- `src`：图片 URL 或 data URI。
- `alt`：替代文字，便于无障碍和 AI 理解图片内容。
- `caption`：图片说明，会显示在图片上。
- `fit`：图片适配方式，`cover` 表示填充裁切，`contain` 表示完整显示。

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
- 检查：编辑器会输出 PPT.html Validation Report，供人类阅读或交给 AI 修复。

检查报告不是文件格式的一部分；它是编辑器围绕 v0.1 JSON 生成的诊断文本。
