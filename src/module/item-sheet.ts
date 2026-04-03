const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Item sheet using the modern ItemSheetV2 + Handlebars stack.
 */
export class ZrpsItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["zrps", "sheet", "item"],
    position: { width: 480, height: 400 },
    actions: {},
    form: { submitOnChange: true },
  };

  /** @override */
  static PARTS = {
    sheet: {
      template: "systems/zrps/templates/item-sheet.html",
    },
  };

  /** @override */
  async _prepareContext(
    options: foundry.applications.api.ApplicationV2.RenderOptions,
  ): Promise<Record<string, unknown>> {
    const context = await super._prepareContext(options);
    // HandlebarsApplicationMixin erases `item` from the TS type; cast to access it
    const item = (this as unknown as { item: foundry.documents.Item }).item;
    const system = item.system as {
      weight: number;
      description: string;
    };

    return {
      ...context,
      item,
      system,
    };
  }
}

