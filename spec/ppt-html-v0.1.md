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
    "alt": ""
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
- `compare`：对比页
- `threeCards`：三卡片页
- `quote`：引用页
- `timeline`：时间线页
- `data`：数据页
- `table`：表格页
- `code`：代码页
- `ending`：结束页

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

