# AI Authoring Guide

This guide is for AI models, agents, scripts, and developers. The goal is to generate deck JSON that PPT.html Studio can reliably read, present, and edit again.

## Table of Contents

1. Output contract
2. Deck structure
3. Slide structure
4. Theme and layout selection
5. Common field formats
6. Recommended generation workflow
7. Repairing validation reports
8. Complete example
9. Reusable prompts
10. Common mistakes checklist

## 1. Output Contract

AI should output structured deck JSON, not free-form HTML.

Requirements:

- `version` must be `"0.1"`.
- The root object must include `title` and `slides`.
- `slides` must be a non-empty array.
- Every slide must include `layout` and `title`.
- Use `schema/ppt-html-v0.1.schema.json` as the structure reference.
- Do not generate CSS, scripts, absolute-positioned text boxes, or PPTX XML.

Recommended output:

- Output raw JSON when the user wants to paste directly into the editor.
- Use a fenced ```json code block when showing JSON in chat; the editor can read it.
- Do not add explanations after the JSON unless the user asks.

## 2. Deck Structure

Minimal deck:

```json
{
  "version": "0.1",
  "title": "Product Story",
  "theme": "launch",
  "aspectRatio": "16:9",
  "slides": []
}
```

Fields:

- `version`: currently fixed to `"0.1"`.
- `title`: deck title and default file-name source.
- `theme`: one of `paper`, `launch`, `studio`, `boardroom`.
- `aspectRatio`: currently `"16:9"`.
- `slides`: slide array.

Theme guide:

| Theme | Best For |
| --- | --- |
| `paper` | Lessons, knowledge sharing, document-like reports |
| `launch` | Product launches, demos, story-driven decks |
| `studio` | Product plans, design plans, tool introductions |
| `boardroom` | Project updates, business plans, executive reports |

## 3. Slide Structure

Generic slide:

```json
{
  "id": "slide-1",
  "layout": "hero",
  "kicker": "Product",
  "title": "PPT.html",
  "subtitle": "AI writes structure, humans edit, browsers present",
  "body": "",
  "notes": ""
}
```

Fields:

- `id`: stable slide ID such as `slide-1`, `slide-2`.
- `layout`: slide layout name.
- `kicker`: short label; may be empty.
- `title`: main slide title.
- `subtitle`: supporting copy.
- `body`: longer explanation.
- `notes`: private speaker notes.

Writing guidance:

- Keep titles short.
- Avoid long subtitles.
- Put longer explanation in `body` or list fields.
- Keep one main idea per slide.

## 4. Theme and Layout Selection

Supported layouts:

| layout | Purpose | Key Fields |
| --- | --- | --- |
| `hero` | Cover or opening | `title`, `subtitle`, `image` |
| `section` | Section break | `title`, `body` |
| `text` | Body and list | `title`, `body`, `items` |
| `imageRight` | Text left, image right | `title`, `body`, `items`, `image` |
| `imageLeft` | Image left, text right | `title`, `body`, `items`, `image` |
| `compare` | Two-column comparison | `left`, `right` |
| `threeCards` | Three ideas | `cards` |
| `quote` | Quote or statement | `quote`, `author` |
| `timeline` | Process or roadmap | `items` |
| `data` | Key metrics | `metrics` |
| `table` | Plan or comparison table | `table.columns`, `table.rows` |
| `code` | Code display | `code` |
| `ending` | Closing slide | `title`, `subtitle` |

Selection rules:

- Need a strong opening: use `hero`.
- Need explanation: use `text`.
- Need differences: use `compare`.
- Need three selling points: use `threeCards`.
- Need time order: use `timeline`.
- Need numbers: use `data`.
- Need status or plan details: use `table`.

## 5. Common Field Formats

Image:

```json
"image": {
  "src": "https://example.com/image.png",
  "alt": "Product UI screenshot"
}
```

`src` can be a URL or a `data:image/...;base64,...` value. If the image source is unknown, leave it empty and let the human user choose a local image in the editor.

List or timeline:

```json
"items": [
  { "title": "Week 1", "text": "Confirm goals and demo scope" },
  { "title": "Week 2", "text": "Finish prototype and collect feedback" }
]
```

Cards:

```json
"cards": [
  { "title": "Clear Structure", "text": "AI generates JSON, humans keep editing." },
  { "title": "Single File", "text": "One .ppt.html file can be presented." },
  { "title": "Stable Rendering", "text": "Layouts are handled by the renderer." }
]
```

Metrics:

```json
"metrics": [
  { "value": "3x", "label": "Drafting speed", "detail": "From blank page to presentable draft." },
  { "value": "1 file", "label": "Deliverable", "detail": "No separate asset folder required." }
]
```

Comparison:

```json
"left": {
  "title": "Traditional PPT",
  "text": "Complex format\nHard for AI to generate reliably\nExpensive to edit again"
},
"right": {
  "title": "PPT.html",
  "text": "Clear structure\nEasy for AI to generate\nHumans can keep editing"
}
```

Table:

```json
"table": {
  "columns": ["Stage", "Time", "Status"],
  "rows": [
    ["Requirements", "Week 1", "Done"],
    ["Prototype", "Week 2", "In progress"]
  ]
}
```

## 6. Recommended Generation Workflow

1. Understand the user's goal, audience, context, and tone.
2. Create a 5 to 10 slide outline.
3. Choose one layout for each slide.
4. Write short titles and structured fields.
5. Check that each slide has one main idea.
6. Output complete deck JSON.
7. If the user returns a validation report, repair the deck from the report.

Default slide order:

1. `hero`: topic and one-line value.
2. `section` or `text`: background or problem.
3. `compare`: old way vs new way.
4. `threeCards`: solution or capabilities.
5. `data`: key results.
6. `timeline` or `table`: plan.
7. `ending`: summary and next step.

## 7. Repairing Validation Reports

When the user pastes a PPT.html Validation Report:

1. Read `Status`.
2. Fix every `ERROR` first.
3. Fix `WARNING` items next.
4. Handle `TIP` items when useful.
5. Preserve the user's original deck intent.
6. Return the full corrected deck JSON.

Path examples:

- `version`: edit the root `version`.
- `slides[2].layout`: edit the third slide layout.
- `slides[4].metrics`: edit the fifth slide metrics.
- `slides[1].image.src`: add or remove the image source.

Do not:

- Output HTML.
- Output only a partial patch.
- Delete important user content.
- Change `version` to another value.

## 8. Complete Example

```json
{
  "version": "0.1",
  "title": "PPT.html Studio Product Story",
  "theme": "studio",
  "aspectRatio": "16:9",
  "slides": [
    {
      "id": "slide-1",
      "layout": "hero",
      "kicker": "Product",
      "title": "PPT.html Studio",
      "subtitle": "AI writes structure, humans edit, browsers present",
      "notes": "Open by explaining that this is not a PPTX clone; it is a format for AI-era decks."
    },
    {
      "id": "slide-2",
      "layout": "compare",
      "kicker": "Problem",
      "title": "Traditional PPT Does Not Fit AI Well",
      "left": {
        "title": "Traditional PPT",
        "text": "Complex file structure\nFragmented coordinates and styles\nHard for AI to maintain"
      },
      "right": {
        "title": "PPT.html",
        "text": "Clear JSON structure\nTemplates handle layout\nHumans can keep editing"
      }
    },
    {
      "id": "slide-3",
      "layout": "threeCards",
      "kicker": "Workflow",
      "title": "Create a Deck in Three Steps",
      "cards": [
        { "title": "Generate Structure", "text": "AI outputs deck JSON." },
        { "title": "Edit Visually", "text": "Humans adjust content, images, and order." },
        { "title": "Share One File", "text": "Export a playable .ppt.html file." }
      ]
    },
    {
      "id": "slide-4",
      "layout": "data",
      "kicker": "Value",
      "title": "Why It Matters",
      "metrics": [
        { "value": "1 file", "label": "Deliverable", "detail": "No asset folder required." },
        { "value": "4", "label": "Platform builds", "detail": "Linux, macOS arm64, macOS x64, Windows." },
        { "value": "0.1", "label": "Stable format", "detail": "Simple enough for AI to generate and repair." }
      ]
    },
    {
      "id": "slide-5",
      "layout": "ending",
      "title": "Let AI and Humans Edit Decks Together",
      "subtitle": "Next step: create your first .ppt.html from a template"
    }
  ]
}
```

## 9. Reusable Prompts

Generate a new deck:

```text
Generate complete deck JSON for PPT.html Studio.
Requirements:
- version must be "0.1"
- create 6 slides
- use the boardroom theme
- every slide must have id, layout, and title
- prefer hero, compare, threeCards, data, table, ending
- do not output free-form HTML
- do not explain; output JSON only

Topic:
{write topic here}

Audience:
{write audience here}

Tone:
{formal / casual / product launch / teaching}
```

Repair from a validation report:

```text
Below is a PPT.html Validation Report.
Please repair the deck JSON:
- fix ERROR items first
- then fix WARNING items
- keep version as "0.1"
- do not output HTML
- return the complete corrected deck JSON
```

## 10. Common Mistakes Checklist

Before output, check:

- Is `version` exactly `"0.1"`?
- Is `theme` one of `paper`, `launch`, `studio`, `boardroom`?
- Does `slides` contain at least one slide?
- Does every slide have a valid `layout`?
- Does every slide have a `title`?
- Does `threeCards` have no more than 3 cards?
- Does `data` have no more than 3 metrics?
- Does `timeline` have no more than 5 items?
- Do images include `alt` text?
- Did you avoid free-form HTML?

When unsure about layout choice, use `text`; it is the most flexible fallback.
