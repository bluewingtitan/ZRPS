import type { NumberField as NF, SchemaField as SF, DataSchema as DF } from "fvtt-types/src/foundry/common/data/fields.mjs";

import type TActor from "fvtt-types/src/foundry/client/documents/actor.mjs"

const { TypeDataModel, fields } = foundry.abstract;
const { NumberField, SchemaField } = foundry.data.fields as any;

/** Current schema version. Bump this when fields are added or renamed. */
const CURRENT_VERSION = 1;

interface HpSchema extends DF {
  value: NF;
  max: NF;
}

/** Shape of a character document (assumes migration) */
interface CharacterShape {
  schemaVersion: number;
  hp: { value: number; max: number };
  st: number;
  dx: number;
  iq: number;
  ht: number;
  [key: string]: unknown;
}

/**
 * Data model for the "character" actor type.
 * Defines the schema that lives under actor.system for all characters.
 */
export class CharacterData extends TypeDataModel {
  static defineSchema() {
    return {
      /** Tracks which migration pass last touched this document. */
      schemaVersion: new NumberField({
        required: true,
        integer: true,
        initial: CURRENT_VERSION,
        min: 0,
        label: "ZRPS.SchemaVersion",
      }) as NF,
      hp: new SchemaField({
        value: new NumberField({ required: true, integer: true, initial: 10, min: 0 }) as NF,
        max:   new NumberField({ required: true, integer: true, initial: 10, min: 0 }) as NF,
      }) as SF<HpSchema>,
      st: new NumberField({ required: true, integer: true, initial: 10, min: 1, label: "ZRPS.StatST" }) as NF,
      dx: new NumberField({ required: true, integer: true, initial: 10, min: 1, label: "ZRPS.StatDX" }) as NF,
      iq: new NumberField({ required: true, integer: true, initial: 10, min: 1, label: "ZRPS.StatIQ" }) as NF,
      ht: new NumberField({ required: true, integer: true, initial: 10, min: 1, label: "ZRPS.StatHT" }) as NF,
    };
  }

  /**
   * Migrate source data from prior schema versions to the current one.
   *
   * Version history:
   *   (none) → 1 : Initial structured schema. Pre-migration actors had free-form
   *                attributes; we seed all missing stat fields with their defaults.
   */
  static migrateData(source: CharacterShape): CharacterShape {
    // Version absent means the actor predates the structured schema.
    if (source.schemaVersion === undefined || source.schemaVersion < 1) {
      source.hp  ??= { value: 10, max: 10 };
      source.hp.value ??= 10;
      source.hp.max   ??= 10;
      source.st ??= 10;
      source.dx ??= 10;
      source.iq ??= 10;
      source.ht ??= 10;
      source.schemaVersion = 1;
    }

    // Future migrations go here:
    // if (source.schemaVersion < 2) { ... source.schemaVersion = 2; }

    return super.migrateData(source);
  }

  get t_(): CharacterShape{
    return this as unknown as CharacterShape
  }

  get parent_(): TActor{
    return (this as any).parent as TActor;
  }
}
