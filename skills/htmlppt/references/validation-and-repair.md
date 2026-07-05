# Validation And Repair

Use the project validator as the source of truth:

```bash
npm run deck:validate -- deck.json
npm run deck:validate -- deck.ppt.html --json
```

## Repair Order

1. Fix `ERROR` items first.
2. Fix important `WARNING` items next.
3. Treat `TIP` items as quality improvements, not blockers.

Always preserve the deck's intent and human edits while repairing.

## Common Errors

- Missing or wrong `version`: set it to `"0.1"`.
- Empty or missing `slides`: create at least one slide.
- Unsupported `layout`: replace with a supported layout.
- Invalid chart kind: use `bar`, `line`, or `donut`.
- Invalid transition: use `none`, `fade`, `slide`, `push`, `zoom`, or slide-level `inherit`.

## Repair Output

Return the complete repaired deck JSON. Do not return:

- Only the changed fragment.
- A patch unless the user explicitly asks for a patch.
- Free-form HTML or CSS.
- A prose explanation mixed into the JSON block.

## Agent-Friendly JSON Report

Use `--json` when another agent needs structured data:

```bash
npm run deck:validate -- deck.json --json
```

The report includes:

- `ok`: whether the deck passed the selected gate.
- `validation.errors`, `validation.warnings`, `validation.tips`.
- `externalAssets`: media references that are not embedded Data URI assets.
- A small deck summary.

Use `--strict-assets` when the final artifact must not reference external media.
