const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

interface StatEntry {
  key: string;
  label: string;
  value: number;
}

/**
 * Character sheet using the modern ActorSheetV2 + Handlebars stack.
 */
export class ZrpsActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["zrps", "sheet", "actor"],
    position: { width: 600, height: 500 },
    actions: {},
    form: { submitOnChange: true },
  };

  /** @override */
  static PARTS = {
    sheet: {
      template: "systems/zrps/templates/actor-sheet.html",
    },
  };

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(
    options: foundry.applications.api.ApplicationV2.RenderOptions,
  ): Promise<Record<string, unknown>> {
    const context = await super._prepareContext(options);
    // HandlebarsApplicationMixin erases `actor` from the TS type; cast to access it
    const actor = (this as unknown as { actor: foundry.documents.Actor }).actor;
    const system = actor.system as {
      hp: { value: number; max: number };
      st: number;
      dx: number;
      iq: number;
      ht: number;
    };

    const stats: StatEntry[] = [
      { key: "st", label: "ST", value: system.st },
      { key: "dx", label: "DX", value: system.dx },
      { key: "iq", label: "IQ", value: system.iq },
      { key: "ht", label: "HT", value: system.ht },
    ];

    return {
      ...context,
      actor,
      system,
      stats,
    };
  }
}
