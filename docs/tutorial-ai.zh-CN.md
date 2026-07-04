# AI 生成指南

这个指南面向 AI、Agent、脚本和开发者。目标是生成 PPT.html Studio 可以稳定读取的 deck JSON。

## 核心原则

- 不要生成自由 HTML。
- 生成符合 `schema/ppt-html-v0.1.schema.json` 的 JSON。
- 每页必须有 `layout` 和 `title`。
- 文字尽量短，版式交给渲染器。
- 图片可以使用 URL 或 `data:image/...;base64,...`。

## 最小结构

```json
{
  "version": "0.1",
  "title": "产品介绍",
  "theme": "launch",
  "aspectRatio": "16:9",
  "slides": [
    {
      "id": "slide-1",
      "layout": "hero",
      "kicker": "Product",
      "title": "PPT.html",
      "subtitle": "AI 写内容，人类做编辑，浏览器负责播放"
    }
  ]
}
```

## 推荐生成流程

1. 先根据用户目标生成 5 到 10 页大纲。
2. 为每页选择一个 layout。
3. 填写标题、短正文、列表或数据。
4. 输出完整 JSON，不要加 Markdown 代码块以外的解释。
5. 用户把 JSON 粘贴到 `AI JSON` 面板导入。
6. 用户点击 `检查` 后，如果返回检查报告，先修复 `ERROR`，再处理 `WARNING` 和 `TIP`。

## 常用 layout

- `hero`：封面
- `section`：章节
- `text`：正文和列表
- `imageRight` / `imageLeft`：图文
- `compare`：左右对比
- `threeCards`：三个观点
- `timeline`：流程或路线图
- `data`：三个关键指标
- `table`：表格
- `code`：代码
- `ending`：结束页

## 对比页示例

```json
{
  "id": "slide-2",
  "layout": "compare",
  "kicker": "Why now",
  "title": "传统 PPT vs PPT.html",
  "left": {
    "title": "传统 PPT",
    "text": "格式复杂\nAI 难以稳定生成\n二次编辑成本高"
  },
  "right": {
    "title": "PPT.html",
    "text": "结构清晰\nAI 容易生成\n人类可以继续编辑"
  }
}
```

## 检查报告修复规则

当用户粘贴 PPT.html Validation Report 时：

- 保持 `version` 为 `"0.1"`。
- 不要改成自由 HTML。
- 按报告里的路径修复，例如 `slides[2].layout` 或 `slides[4].metrics`。
- 修复后输出完整 deck JSON。
