import type { NumberField as NF, StringField as StF } from "fvtt-types/src/foundry/common/data/fields.mjs";

const { TypeDataModel } = foundry.abstract;
const { NumberField, StringField } = foundry.data.fields as any;

/** Current schema version. Bump this when fields are added or renamed. */
const CURRENT_VERSION = 1;

/** Shape of a raw item source document before migration. */
interface ItemSource {
  schemaVersion?: number;
  weight?: number;
  description?: string;
  [key: string]: unknown;
}

/**
 * Data model for the "item" item type.
 * Defines the schema that lives under item.system for all items.
 */
export class ItemData extends TypeDataModel {
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
      weight: new NumberField({
        required: true,
        initial: 0,
        min: 0,
        label: "ZRPS.ItemWeight",
      }) as NF,
      description: new StringField({
        required: false,
        initial: "",
        label: "ZRPS.ItemDescription",
      }) as StF,
    };
  }

  /**
   * Migrate source data from prior schema versions to the current one.
   *
   * Version history:
   *   (none) → 1 : Initial structured schema. Pre-migration items had free-form
   *                attributes; we seed all missing fields with their defaults.
   */
  static migrateData(source: ItemSource): ItemSource {
    if (source.schemaVersion === undefined || source.schemaVersion < 1) {
      source.weight      ??= 0;
      source.description ??= "";
      source.schemaVersion = 1;
    }

    // Future migrations go here:
    // if (source.schemaVersion < 2) { ... source.schemaVersion = 2; }

    return super.migrateData(source);
  }
}
