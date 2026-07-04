# PPT.html Studio / htmlppt

PPT.html Studio is an AI-friendly, human-editable presentation editor. It turns structured deck data into a single `.ppt.html` file that can be opened in a browser, edited again in the app, and shared like an ordinary HTML file.

## New in v0.2.5

PPT.html Studio now has a cleaner, more modern desktop UI inspired by OpenHuman-style local-first app surfaces: a dark compact top bar, lighter panels, refined slide thumbnails, polished form controls, a calmer canvas grid, softer shadows, and better responsive behavior on narrow screens.

## New in v0.2.4

PPT.html Studio now borrows the best direct-manipulation ideas from open-source visual editors while keeping the file AI-friendly. Click any editable slide element to show a canvas selection frame, drag it for precise placement, resize it with eight handles, nudge it with arrow keys, use `Shift` for faster nudges, and reset element geometry without touching the slide content. These edits are saved as structured `canvas` `x/y/w/h` data and survive standalone `.ppt.html` export.

## New in v0.2.3

PPT.html Studio now has a first canvas-style editing layer. Double-click rendered text, cards, metrics, table cells, chart legends, and code blocks to edit them in place; drag editable slide elements for light visual adjustments that are saved as structured `canvas` offsets; drag images onto the stage; and drag slide thumbnails to reorder pages.

## New in v0.2.2

PPT.html Studio now uses true full-window presentation scaling. The editor and exported `.ppt.html` player no longer reserve hidden margins for controls or cap presentation zoom, so 16:9 displays fill cleanly without the old black border.

## New in v0.2.1

PPT.html Studio now includes structured chart slides. Create bar, line, and donut charts from labels and series in the editor, or let AI generate the same `chart` JSON for a shareable `.ppt.html` file.

v0.2 also added the complete creation workflow: start from a template, edit the deck visually, paste AI-generated JSON directly from a code block, run a validation report, then save a single `.ppt.html` file from the desktop app.

The key idea stays the same: AI writes clean structure, humans make judgment calls, and the renderer keeps layout deterministic.

## Languages

- [中文首页](docs/home.zh-CN.md)
- [English Home](docs/home.en-US.md)
- [日本語ホーム](docs/home.ja-JP.md)
- [한국어 홈](docs/home.ko-KR.md)

## Detailed Tutorials

The tutorial pages are written as clear, chaptered guides in four languages.

Human-friendly manuals cover installation, templates, visual editing, AI JSON import, validation, presentation, saving, sharing, and troubleshooting:

- [中文教程](docs/tutorial-human.zh-CN.md)
- [English Tutorial](docs/tutorial-human.en-US.md)
- [日本語チュートリアル](docs/tutorial-human.ja-JP.md)
- [한국어 튜토리얼](docs/tutorial-human.ko-KR.md)

AI and agent authoring guides cover the JSON contract, deck structure, layout selection, field formats, validation-report repair flow, complete examples, reusable prompts, and common mistakes:

- [中文 AI 指南](docs/tutorial-ai.zh-CN.md)
- [English AI Guide](docs/tutorial-ai.en-US.md)
- [日本語 AI ガイド](docs/tutorial-ai.ja-JP.md)
- [한국어 AI 가이드](docs/tutorial-ai.ko-KR.md)

Product roadmap:

- [中文路线图](docs/roadmap.zh-CN.md)
- [HTML 画布编辑项目调研与实施计划](docs/canvas-editor-research.zh-CN.md)

Release operations:

- [macOS 签名与公证指南](docs/macos-notarization.zh-CN.md)
- [macOS Signing and Notarization Guide](docs/macos-notarization.en-US.md)
- [macOS 署名と公証ガイド](docs/macos-notarization.ja-JP.md)
- [macOS 서명 및 공증 가이드](docs/macos-notarization.ko-KR.md)

## Quick Start

Run the browser editor:

```bash
npm install
npm run serve
```

Open:

```text
http://localhost:5173
```

Run the desktop app:

```bash
npm start
```

## Five-Minute Tutorial

1. Open PPT.html Studio.
2. Click `Templates` and choose Product Pitch, Lesson, Project Update, or the demo deck.
3. Edit the title, subtitle, metrics, charts, table rows, or slide order in the visual editor. You can also double-click text directly on the canvas, drag editable elements, resize them with handles, and nudge the selected element with arrow keys.
4. Click `AI JSON` to paste a deck from an AI model. Fenced `json` code blocks are accepted.
5. Click `Check` and copy the validation report back to AI if anything needs repair.
6. Click `Present` to preview the deck.
7. Use `Save / Download`, or desktop `Save As`, to create one shareable `.ppt.html` file.

Build the desktop app locally:

```bash
npm run dist
```

## What Is PPT.html?

A `.ppt.html` file is normal HTML with structured presentation data embedded inside:

```html
<script id="ppt-html-data" type="application/vnd.ppt-html+json">
{
  "version": "0.1",
  "title": "Demo",
  "theme": "launch",
  "slides": []
}
</script>
```

AI writes the JSON. The renderer turns it into slides. Humans can edit it in PPT.html Studio.

## Current Product Focus

- Start from built-in templates for product pitches, lessons, project updates, or the demo deck.
- Open, save, and save as `.ppt.html` files in the desktop app.
- Import local images into image slides as embedded data URIs.
- Double-click canvas text to edit in place, drag or resize editable slide elements for structured `canvas` geometry, nudge selection with arrow keys, reset a selected element, and drag thumbnails to reorder pages.
- Create bar, line, and donut charts from structured labels and series.
- Run `Check` to get a human-readable and AI-readable validation report.

## Release Builds

GitHub Actions builds release packages for:

- Linux x64
- macOS Apple Silicon arm64
- macOS Intel x64
- Windows x64

Release builds are triggered by tags such as:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

The release workflow validates that the tag matches `package.json` exactly. For notarized macOS assets, set the repository variable `ENABLE_APPLE_NOTARIZATION=true` and configure the Apple secrets documented in the macOS signing guide; otherwise macOS packages are still built as unsigned fallback artifacts.
