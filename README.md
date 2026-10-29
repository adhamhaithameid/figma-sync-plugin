# SIS Sync — Figma plugin

The design-to-code and code-to-design channel for the SIS design system.

This plugin builds the native Figma design system — foundation pages, core
components with variants, dark-mode mirrors — directly from the canonical SIS
token values, exports a structural baseline for design-to-code comparison, and
diffs Figma against a saved baseline to produce the code-update work list.

## Install

1. Figma desktop → **Plugins → Development → Import plugin from manifest…**
2. Select `manifest.json` from this folder.
3. Run via **Plugins → Development → SIS Sync**.

`code.js` and `ui.html` load from this folder, so edits here appear on the next
plugin run.

## Actions

| Action | What it does |
|---|---|
| Build foundations | Generates the Foundations page: color ramps, type scale, spacing, radius, elevation, motion — every swatch labeled with its token name and hex value. |
| Build components | Generates/updates the Core Components page: Button (6 states), TextField (4 states), Badge (5 tones) as component sets with variants, plus Card, Checkbox, Switch, Progress, Avatar, Spinner, Pagination. |
| Dark mirrors | Generates the dark-theme mirror of every color-bearing component below the light set. |
| Copy baseline | Serializes every component (name, size, fills, texts) to JSON. Save it as `qa/figma-baseline.json` in the SIS-Product-Design repo and commit. |
| Compare with baseline | Paste the committed baseline; the plugin reports added, removed, and changed components with fill, size, and text diffs. The report is the code-update work list. |

## The workflow

1. Agent updates the design in Figma via this plugin (or Adham edits by hand).
2. Copy the new baseline, commit it.
3. Agent runs **Compare** against the committed baseline and updates
   `packages/react` through the normal gates (TDD, axe, visual baselines).
4. Agent rebuilds components in Figma and re-exports the baseline.

The committed baseline is the last design state the code was verified against.

## Related

- Token source: `foundations/` in the
  [SIS-Product-Design repository](https://github.com/Organization-name-temp/SIS-Product-Design)
- Channel documentation: `docs/figma-workflow.md` in the same repository
- Token values are baked into `code.js` at generation time; regenerate after
  token changes.
