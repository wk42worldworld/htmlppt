# Human Tutorial

This tutorial is for people who do not want to write code. The goal is to create a `.ppt.html` deck that can be presented, shared, and edited again.

## Table of Contents

1. Understand the PPT.html workflow
2. Open the editor
3. Start from a template
4. Edit deck information and theme
5. Edit slide content
6. Manage slide order
7. Add images, data, charts, tables, and code
8. Draft with AI JSON
9. Repair issues with validation reports
10. Present the deck
11. Save, share, and edit again
12. Troubleshooting

## 1. Understand the PPT.html Workflow

PPT.html Studio separates a deck into three layers:

- Content: titles, subtitles, body text, lists, images, metrics, charts, tables, and code.
- Layout: stable slide templates such as cover, comparison, cards, data, charts, and tables.
- Playback: the app renders structured content into browser-ready HTML slides.

You do not need to write HTML. You also do not need to manually drag dozens of text boxes like in a traditional slide editor. Edit content, choose layouts, validate the deck, and save one `.ppt.html` file.

## 2. Open the Editor

There are two ways to use PPT.html Studio.

Desktop app:

1. Download the package for your system from GitHub Releases.
2. Launch PPT.html Studio.
3. Use the desktop app for serious editing because it supports open, save, and save as.

Browser development version:

```bash
npm install
npm run serve
```

Open:

```text
http://localhost:5173
```

The browser version is useful for previewing and development. Saving from the browser downloads a new file.

## 3. Start From a Template

Click `Templates` in the top bar and choose one starter:

- AI Director Camera: a product demo example.
- Product Pitch: for product introductions, launches, and pitches.
- Lesson: for classes and training materials.
- Project Update: for status reports, milestones, risks, and decisions.

After you choose a template, slides appear on the left, the current slide appears in the center, and editable fields appear on the right.

For a first test, choose `Project Update`. It includes a cover, data slide, table, comparison, and closing slide.

## 4. Edit Deck Information and Theme

Use the `Deck` section in the right panel:

- Title: used as the default file name when saving.
- Theme: controls the visual style of the whole deck.

Available themes:

- `Paper`: light and clean, good for lessons and document-like reports.
- `Launch`: dark and high-contrast, good for demos and presentations.
- `Studio`: modern tool-like style, good for product and design work.
- `Boardroom`: formal and restrained, good for business updates.

The canvas updates immediately when you change the theme.

## 5. Edit Slide Content

Click any slide in the left rail. The `Slide` section shows fields for the current slide:

- Layout: decides how the slide is arranged.
- Kicker: a small label such as `Problem`, `Plan`, or `Demo`.
- Title: the most important sentence on the slide.
- Subtitle: supporting copy.
- Body: longer explanation.
- Notes: private speaker notes.

Different layouts reveal different fields:

- `compare` shows left and right titles and text.
- `threeCards` shows card content.
- `data` shows metrics.
- `chart` shows chart kind, labels, series, and unit.
- `table` shows columns and rows.
- `code` shows a code field.

Editing tips:

- Keep one main point per slide.
- Keep titles short.
- Use 3 to 6 list items.
- Use 1 to 3 metrics on data slides.
- Use 2 to 8 labels on chart slides.
- Split overloaded slides into multiple slides.

Direct canvas editing:

- Double-click titles, subtitles, body text, list items, cards, metrics, table cells, chart legends, or code blocks on the canvas to edit text in place.
- Press `Enter` to save single-line edits. For multi-line content, use line breaks and press `Ctrl+Enter` or `Cmd+Enter` to save.
- Press `Esc` to cancel the current canvas edit.
- Click editable text or content blocks on the canvas to show a selection frame.
- After selection, the right `Element Style` panel becomes active. Use it to adjust font size, text color, alignment, bold, italic, background, border color, border width, radius, and opacity.
- Drag the selected element for light position tweaks. Drag the frame's corner or side handles to change width and height.
- With an element selected, press arrow keys to nudge by 1 pixel. Hold `Shift` while pressing an arrow key to move by 10 pixels.
- Click `Reset` on the selection frame to clear the selected element's saved position and size. Press `Delete` / `Backspace` to delete the selected element; table cells are cleared instead of removing the table.
- Position and size are saved in the current slide's `canvas` data, so exported `.ppt.html` files keep the adjustment.
- Element style is saved in the current slide's `styles` data. `Clear style` restores visual overrides without deleting text content or position changes.
- Use `Undo` if a drag lands in the wrong place.
- Use dragging for small refinements. For major layout changes, switch layouts or split content into more slides so the deck stays friendly to both AI and human editing.

## 6. Manage Slide Order

The left slide rail supports:

- `+`: add a new slide after the current one.
- `Duplicate`: copy the current slide.
- `Move Up` / `Move Down`: reorder slides.
- `Delete`: remove the current slide.
- Click a thumbnail: switch slides.
- Drag a thumbnail: reorder slides directly.

Delete is disabled when only one slide remains, so the deck cannot become empty.

## 7. Add Images, Video, Audio, Data, Charts, Tables, and Code

The main editor now includes an `Insert` component palette beside the canvas. You can click a component or drag it onto the canvas. When the list feels long, use the search field at the top of the palette or press `/` to focus it:

- `Text`: adds a visible text box to the current slide; double-click to edit it or drag it to a specific canvas position.
- `Image`: inserts an image object into the current slide and opens the local image picker. If you cancel, the placeholder object remains so you can add a URL later.
- `Video`: inserts a video object into the current slide and opens the local video picker. If you cancel, the placeholder object remains.
- `Audio`: inserts an audio object into the current slide and opens the local audio picker. If you cancel, the placeholder object remains.
- `Before` and `Decision`: add comparison slides for before/after stories or option decisions.
- `Bars`, `Trend`, and `Share`: insert chart objects into the current slide for category comparison, trend changes, or composition share.
- `Plan`, `Compare`, and `Checklist`: insert table objects into the current slide for project plans, option comparison, or launch checks.
- `3 Points`, `Features`, `Pros`, `KPI`, `Progress`, `Roadmap`, `Process`, `Milestones`, `Quote`, and `Code`: insert matching components into the current slide without creating a new slide or overwriting existing content.

To create a whole new layout slide, click the `+` button in the left slide rail, then choose a cover, chart, table, video, or other slide layout.

After inserting a component, continue editing it in the right panel, or double-click text, drag components, and resize them directly on the canvas.

When a canvas object is selected, the `Object` panel shows position, size, and layer controls. Image, video, audio, chart, table, card, metric, timeline, compare, quote, code, and shape objects also show typed editors:

- Media objects: edit media URL / Data URI, caption, alt text, poster, and fit mode.
- Chart objects: edit chart type, labels, series, and unit.
- Table objects: edit headers and rows, or use add/delete row and column buttons.
- Structured component objects: bulk-edit with `Title | Body`, `Value | Label | Detail`, or raw code text without touching JSON.

The `Object data JSON (advanced)` field remains available for AI or power users. Normal users should prefer the typed fields above it.

Images:

1. Change the layout to `hero`, `imageRight`, `imageLeft`, `imageFull`, or `imageBackground`.
2. Click `Choose local image`.
3. The image is embedded into the `.ppt.html` file as a Data URI.
4. Use `Fit` to choose cropped fill or full containment.
5. Add alt text and an optional caption.

You can also drag an image file onto the center canvas. If the current slide is not an image layout, the app switches it to `imageRight` and embeds the image into the current `.ppt.html` file.

Video and audio:

1. Click `Video` or `Audio` in the insert palette and choose a local file.
2. The app converts the media to a Data URI and stores it inside the same `.ppt.html`.
3. You can also paste a URL in the right panel. Before saving or downloading, the app tries to package reachable URLs into the single file. If a resource cannot be read, saving stops and the missing resource is listed.

Data slides:

In the `data` layout, write one metric per line:

```text
72% | Progress | Core workflow is complete
2 | Key risks | Resources and release window
1 | Decision | Whether to expand the pilot
```

Chart slides:

Switch the layout to `chart`, then choose `bar`, `line`, or `donut`.

Labels use `|` separators:

```text
Q1 | Q2 | Q3 | Q4
```

Each series uses one line:

```text
Revenue | 12 | 20 | 31 | 42
Cost | 8 | 11 | 18 | 24
```

For donut charts, the first series is used as the segments.

Tables:

Columns use `|` separators:

```text
Stage | Time | Status
```

Rows use the same format:

```text
Requirements | Week 1 | Done
Prototype | Week 2 | In progress
Pilot | Week 4 | Not started
```

Code:

Switch the layout to `code` and paste code into the code field.

## 8. Draft With AI JSON

Click `AI JSON`, paste deck JSON generated by an AI model, then click `Load from text`.

PPT.html Studio accepts raw JSON:

```json
{
  "version": "0.1",
  "title": "My Deck",
  "theme": "launch",
  "aspectRatio": "16:9",
  "slides": [
    {
      "id": "slide-1",
      "layout": "hero",
      "title": "First Slide",
      "subtitle": "This is a PPT.html deck"
    }
  ]
}
```

It also accepts fenced `json` code blocks:

````markdown
```json
{
  "version": "0.1",
  "title": "My Deck",
  "theme": "launch",
  "slides": []
}
```
````

Useful prompt for AI:

```text
Generate deck JSON for PPT.html Studio.
Topic: my project update
Length: 5 slides
Tone: formal and concise
Use version 0.1. Do not output free-form HTML.
```

## 9. Repair Issues With Validation Reports

After importing AI JSON, click `Check`.

The validation report tells you:

- Whether the deck can be shared.
- How many errors, warnings, and tips were found.
- Which field needs attention.
- How an AI model should repair it.

If the report contains `ERROR`:

1. Click `Copy Report`.
2. Paste the report back to the AI model.
3. Ask it to repair the deck and return full deck JSON.
4. Load the fixed JSON in the `AI JSON` panel.

The faster path is `Copy AI Repair Prompt`. It includes the current deck JSON, validation report, and repair rules, so you can paste one complete prompt into an AI model.

If the report only contains `WARNING` or `TIP`, the deck usually still plays, but it is worth improving.

## 10. Present the Deck

Click `Present` in the top bar. The desktop app enters full-screen presentation; in the browser, the app requests full screen when the browser allows it. If the browser blocks the request, click `Full Screen` inside the player.

In the right `Deck` panel, choose the default transition: `None`, `Fade`, `Slide`, `Push`, or `Zoom`. In the `Slide` panel, each slide can follow the deck default or override it. Exported single-file players keep these transition settings.

During presentation:

- Press `F5` to start from the first slide.
- Press `Shift+F5` to start from the current slide.
- Click `Previous` / `Next`.
- Use arrow keys, `PageUp`, and `PageDown` to move.
- Press Space, `Enter`, or `N` to advance.
- Press `P` or `Backspace` to go back.
- Press `Home` / `End` to jump to the first or last slide.
- Click `Fit` / `Fill`, or press `M`, to switch between showing the full slide and filling the window. Portrait phones keep the full-slide mode to avoid cropping the page.
- Click `Shortcuts` or press `?` to view presentation shortcuts.
- Press `F` to toggle full screen.
- Press `B` for black screen or `W` for white screen.
- Click `Exit` or press `Esc` to return to the editor.

The presentation controls hide automatically when the mouse is idle. Move the mouse to show them again.

Before sharing a deck, play through it once from beginning to end.

## 11. Save, Share, and Edit Again

Browser version:

- Click `Save / Download`.
- The browser downloads a `.ppt.html` file.
- Before saving, external images, videos, audio, video posters, and player dependencies are packaged into the HTML. If saving succeeds, sharing that one file is enough.

Desktop app:

- `Save`: save to the current file.
- `Save As`: choose a new location.
- Shortcut: `Ctrl/Cmd+S`.
- The desktop app uses the same packaging step. If a URL or local path cannot be read, fix that asset and save again.

Sharing:

- Send the `.ppt.html` file to another person.
- They can open it directly in a browser.
- They can also open it again in PPT.html Studio for editing.

## 12. Troubleshooting

### Can the file be opened by double-clicking?

Yes. A `.ppt.html` file is an HTML file and can be opened by a browser.

### Why not generate PPTX directly?

PPTX is complex internally. AI output is often fragile and hard to edit again. PPT.html uses structured JSON, which is easier for AI and humans to maintain together.

### What if AI-generated content fails to import?

Check that:

- The JSON is complete.
- `version` is `"0.1"`.
- `slides` is an array.
- Every slide has `layout` and `title`.

Then use `Check` or paste the error message back to AI.

### Will images be lost?

Images selected with `Choose local image` are embedded into the `.ppt.html` file. If you manually enter an image URL, the receiver must be able to access that URL.

### When should I split a slide?

Split a slide when it has a long title, more than 6 list items, more than 3 core metrics, or a table that feels too wide.

## Final Checklist

- Every slide has a clear title.
- The slide order supports the story.
- Metrics and tables are not placeholders.
- `Check` has been run.
- The deck has been presented once.
- The final deck has been saved as `.ppt.html`.
