---
description: "Use when writing Foundry VTT code for the ZRPS system: data models, actor/item document classes, sheets, hooks, localization, or TypeScript patterns. Covers TypeDataModel schemas, ActorSheetV2, hook registration, CONFIG setup, and fvtt-types usage."
applyTo: "src/module/**"
---

# ZRPS — Foundry VTT Coding Conventions

## Data Models (TypeDataModel)

All system data lives under `actor.system` / `item.system` and is defined via `TypeDataModel`.

```ts
import type { NumberField as NF } from "fvtt-types/src/foundry/common/data/fields.mjs";

const { TypeDataModel } = foundry.abstract;
const { NumberField } = foundry.data.fields as any;

const CURRENT_VERSION = 1;

export class MyData extends TypeDataModel {
  static defineSchema() {
    return {
      schemaVersion: new NumberField({
        required: true,
        integer: true,
        initial: CURRENT_VERSION,
        min: 0,
        label: "ZRPS.SchemaVersion",
      }) as NF,
      // ... other fields
    };
  }

  static migrateData(source: MySource): MySource {
    if (source.schemaVersion === undefined || source.schemaVersion < 1) {
      // seed defaults for missing fields
      source.schemaVersion = 1;
    }
    // future migrations go here
    return super.migrateData(source);
  }
}
```

- Always include a `schemaVersion` field (integer, `initial: CURRENT_VERSION`).
- Always implement `migrateData()` even if empty — add a version history comment.
- Cast `foundry.data.fields` as `any` to access field constructors; cast return values to the corresponding fvtt-types type (`NF`, `SF<Schema>`, `StF`, etc.).
- Import types from `fvtt-types/src/foundry/common/data/fields.mjs`.

## Sheets (ActorSheetV2 / ItemSheetV2)

Use the modern `ActorSheetV2` (or `ItemSheetV2`) + `HandlebarsApplicationMixin` stack.

```ts
const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class MyActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["zrps", "sheet", "actor"],
    position: { width: 600, height: 500 },
    actions: {},
    form: { submitOnChange: true },
  };

  static PARTS = {
    sheet: { template: "systems/zrps/templates/my-sheet.html" },
  };

  async _prepareContext(
    options: foundry.applications.api.ApplicationV2.RenderOptions,
  ): Promise<Record<string, unknown>> {
    const context = await super._prepareContext(options);
    // HandlebarsApplicationMixin erases `actor` from the TS type — cast to access it
    const actor = (this as unknown as { actor: foundry.documents.Actor }).actor;
    return { ...context, actor, system: actor.system };
  }
}
```

- Template paths are always `"systems/zrps/templates/<name>.html"`.
- `form: { submitOnChange: true }` is the standard setting for character sheets.
- Cast `this` to access `actor`/`item` when TS erases the property from the mixin type.

## Document Class Registration

Register custom classes in the `init` hook inside `zrps.ts`:

```ts
CONFIG.Actor.documentClass = SimpleActor;
CONFIG.Item.documentClass = SimpleItem;
CONFIG.Token.documentClass = SimpleTokenDocument;
CONFIG.Token.objectClass = SimpleToken;
```

Register sheets with `Actors.registerSheet` / `Items.registerSheet` after the above.

## Hooks

- Use `Hooks.once("init", async () => { ... })` for one-time system initialization.
- Use `Hooks.on(...)` for repeating listeners.
- Never access `game` outside of a hook or async context — use the type-safe accessor:

```ts
function g(): ReadyGame {
  return game as ReadyGame;
}
```

## Localization

- All user-visible strings reference a key from `src/lang/en.json`.
- Key format: `ZRPS.<Category><Name>` — e.g. `ZRPS.StatST`, `ZRPS.ItemWeight`, `ZRPS.SchemaVersion`.
- Add every new key to `en.json` alongside the code change.

## TypeScript / File Structure

- New files in `src/module/` should be `.ts` — only keep `.js` for files not yet migrated.
- Import `fvtt-types` for Foundry API types; use `as any` only when the types library lacks a definition.
- Build output goes to `dist/` via `vite build`. Never edit files in `dist/`.
- The entry point loaded by Foundry is `scripts/zrps.js` (the built output of `src/module/zrps.ts`).
