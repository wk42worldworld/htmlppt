# AI Authoring Guide

This guide is for AI models, agents, scripts, and developers. The goal is to generate deck JSON that PPT.html Studio can read reliably.

## Core Rules

- Do not generate free-form HTML.
- Generate JSON that follows `schema/ppt-html-v0.1.schema.json`.
- Every slide must include `layout` and `title`.
- Keep text concise; let the renderer handle layout.
- Images may use URLs or `data:image/...;base64,...`.

## Minimal Structure

```json
{
  "version": "0.1",
  "title": "Product Story",
  "theme": "launch",
  "aspectRatio": "16:9",
  "slides": [
    {
      "id": "slide-1",
      "layout": "hero",
      "kicker": "Product",
      "title": "PPT.html",
      "subtitle": "AI writes structure, humans edit, browsers present"
    }
  ]
}
```

## Recommended Workflow

1. Generate a 5 to 10 slide outline from the user's goal.
2. Choose one layout for each slide.
3. Fill titles, concise copy, lists, or data.
4. Output complete JSON. Do not add extra prose outside the code block.
5. The user can paste the JSON into the `AI JSON` panel.
6. After the user clicks `Check`, repair `ERROR` items first, then `WARNING` and `TIP` items.

## Common Layouts

- `hero`: cover slide
- `section`: section break
- `text`: body and list
- `imageRight` / `imageLeft`: image and text
- `compare`: two-column comparison
- `threeCards`: three ideas
- `timeline`: process or roadmap
- `data`: three key metrics
- `table`: table
- `code`: code
- `ending`: closing slide

## Comparison Slide Example

```json
{
  "id": "slide-2",
  "layout": "compare",
  "kicker": "Why now",
  "title": "Traditional PPT vs PPT.html",
  "left": {
    "title": "Traditional PPT",
    "text": "Complex format\nHard for AI to generate reliably\nExpensive to edit again"
  },
  "right": {
    "title": "PPT.html",
    "text": "Clear structure\nEasy for AI to generate\nHumans can keep editing"
  }
}
```

## Repairing From a Validation Report

When the user pastes a PPT.html Validation Report:

- Keep `version` as `"0.1"`.
- Do not convert the deck into free-form HTML.
- Follow paths such as `slides[2].layout` or `slides[4].metrics`.
- Return the full corrected deck JSON.
