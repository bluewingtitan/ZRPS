# ZRPS — Project Guidelines

## Tech Stack

TypeScript + Vite + Tailwind CSS v4, targeting Foundry VTT v14.

## Code Style

**TypeScript first.** The codebase is migrating from JS to TS — touching a `.js` file is the trigger to refactor it to `.ts` in the same change.

**No unnecessary comments.** Don't write comments in TypeScript unless the code cannot be made self-explanatory by restructuring. Prefer clear names, small functions, and obvious structure over inline explanation.

**Flat code.** Maximum 3 levels of nesting. When deeper nesting feels necessary, extract a function or invert the condition first. Deeper nesting is acceptable only when the logic structure genuinely demands it (e.g. nested data traversal).

**Modular and data-driven.** Prefer table-driven lookups, declarative schemas, and composable functions over ad-hoc branches and copy-pasted logic.

## Styling

Use **Tailwind CSS** utility classes for all template HTML (`src/templates/**`). Do not write custom CSS unless Tailwind cannot express it.

## Project Structure

```
src/
  system.json          # Foundry manifest (copied to dist/ verbatim)
  module/              # All TypeScript/JavaScript source
    zrps.ts            # Entry point — hook registration, CONFIG setup
    actor.js           # SimpleActor document class (pending TS migration)
    actor-data.ts      # CharacterData TypeDataModel schema
    actor-sheet.ts     # ZrpsActorSheet (ActorSheetV2)
    item.ts            # SimpleItem document class
    item-data.ts       # ItemData TypeDataModel schema
    item-sheet.ts      # ZrpsItemSheet (ItemSheetV2)
    helper.js          # Shared utilities (pending TS migration)
    macro.js           # Macro entrypoints (pending TS migration)
    token.js           # Token/TokenDocument classes (pending TS migration)
    templates.js       # Handlebars template preloading (pending TS migration)
    constants.js       # System-wide constants (pending TS migration)
  styles/
    zrps.css           # Tailwind CSS entry (compiled by Vite)
  templates/           # Handlebars templates (copied to dist/ verbatim)
    actor-sheet.html
    item-sheet.html
    parts/             # Reusable partial templates
  lang/
    en.json            # Localization strings
dist/                  # Build output — never edit directly
  scripts/zrps.js      # Compiled JS bundle (loaded by Foundry)
  styles/zrps.css      # Compiled CSS
  templates/           # Copied from src/templates/
  lang/                # Copied from src/lang/
  system.json          # Copied from src/
```

## Build

```bash
npm run build    # one-off build → dist/
npm run watch    # rebuild on change
npm run typecheck  # tsc --noEmit, no emit
```

Vite compiles `src/module/zrps.ts` → `dist/scripts/zrps.js` and `src/styles/zrps.css` → `dist/styles/zrps.css`. Static assets (`templates/`, `lang/`, `system.json`) are copied verbatim by `vite-plugin-static-copy`.

For local development, symlink `dist/` into Foundry's `Data/systems/zrps/`.

## Ambiguity

If a task has multiple reasonable approaches with no clearly preferable path, **ask before proceeding** rather than picking arbitrarily.

## Foundry VTT Conventions

See `.github/instructions/foundry-vtt.instructions.md` for data model schemas, sheet patterns, hook registration, and localization key format.
