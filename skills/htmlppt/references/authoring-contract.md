# PPT.html Authoring Contract

The deck JSON is the editable source. A standalone `.ppt.html` wraps that JSON with renderer CSS and JavaScript for playback.

## Top-Level Deck

Required fields:

- `version`: must be `"0.1"`.
- `title`: a human-readable presentation title.
- `slides`: a non-empty array.

Recommended fields:

- `theme`: `paper`, `launch`, `studio`, or `boardroom`.
- `transition`: `none`, `fade`, `slide`, `push`, or `zoom`.
- `aspectRatio`: `"16:9"`.

## Slide Rules

Every slide should have:

- `id`: stable id such as `slide-1`.
- `layout`: one supported layout.
- `title`: short title for thumbnails and navigation.
- Optional `subtitle`, `body`, `notes`, `transition`.

Supported layouts:

- `hero`, `section`, `text`
- `imageRight`, `imageLeft`, `imageFull`, `imageBackground`
- `compare`, `threeCards`, `quote`, `timeline`, `data`
- `chart`, `video`, `audio`, `table`, `code`, `ending`

Use one main idea per slide. Split dense content into multiple slides.

## Canvas And Object Preservation

Human editing may create:

- `canvas`: per-path geometry overrides.
- `styles`: per-path style overrides.
- `textBoxes`: explicit overlay text boxes.
- `objects`: inserted modules such as image, video, chart, table, cards, metrics, timeline, quote, code, compare, and shape.

When editing an existing deck, preserve these fields by default. If changing only copy or data, keep object ids and geometry stable. Avoid replacing a full slide when a field-level edit is enough.

## Media

Media `src` values may be:

- Data URI: best for final single-file delivery.
- Reachable URL: acceptable draft input, but final export should embed assets.
- Empty string: acceptable when the human should choose a local file in the editor.

Do not write `/tmp/...`, local Downloads paths, private file paths, or guessed filenames into `src`.

## Output Shape

For chat or agent output, return complete JSON:

```json
{
  "version": "0.1",
  "title": "Demo",
  "theme": "launch",
  "transition": "fade",
  "aspectRatio": "16:9",
  "slides": []
}
```

Do not append explanation text after JSON unless the user asks for explanation.
