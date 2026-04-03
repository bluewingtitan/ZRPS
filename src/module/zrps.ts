/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 */

// Import Modules
import { SimpleActor } from "./actor";
import { SimpleItem } from "./item";
import { ZrpsItemSheet } from "./item-sheet";
import { ItemData } from "./item-data";
import { ZrpsActorSheet } from "./actor-sheet";
import { CharacterData } from "./actor-data";
import { preloadHandlebarsTemplates } from "./templates";
import { createZrpsMacro } from "./macro";
import { SimpleToken, SimpleTokenDocument } from "./token";

/** Type-safe accessor for the `game` global (only call inside Foundry hooks). */
function g(): ReadyGame {
  return game as ReadyGame;
}

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/**
 * Init hook.
 */
Hooks.once("init", async function () {
  console.log(`Initializing ZRPS System`);

  /**
   * Set an initiative formula for the system. This will be updated later.
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2,
  };

  g().zrps = {
    SimpleActor,
    createZrpsMacro,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = SimpleActor;
  CONFIG.Item.documentClass = SimpleItem;
  CONFIG.Token.documentClass = SimpleTokenDocument;
  CONFIG.Token.objectClass = SimpleToken;

  // Register system data models
  CONFIG.Actor.dataModels.character = CharacterData;
  CONFIG.Item.dataModels.item = ItemData;

  // Register sheet application classes
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("zrps", ZrpsActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "ZRPS.SheetCharacter",
  });
  foundry.documents.collections.Items.unregisterSheet(
    "core",
    foundry.appv1.sheets.ItemSheet,
  );
  foundry.documents.collections.Items.registerSheet("zrps", ZrpsItemSheet, {
    makeDefault: true,
  });

  // Register system settings
  g().settings.register("zrps", "macroShorthand", {
    name: "SETTINGS.SimpleMacroShorthandN",
    hint: "SETTINGS.SimpleMacroShorthandL",
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
  });

  // Register initiative setting.
  g().settings.register("zrps", "initFormula", {
    name: "SETTINGS.SimpleInitFormulaN",
    hint: "SETTINGS.SimpleInitFormulaL",
    scope: "world",
    type: String,
    default: "1d20",
    config: true,
    onChange: (formula) => _simpleUpdateInit(formula, true),
  });

  // Retrieve and assign the initiative formula setting.
  const initFormula = g().settings.get("zrps", "initFormula") as string;
  _simpleUpdateInit(initFormula);

  /**
   * Update the initiative formula.
   * @param {string} formula - Dice formula to evaluate.
   * @param {boolean} notify - Whether or not to post nofications.
   */
  function _simpleUpdateInit(formula: string, notify: boolean = false): void {
    const isValid = Roll.validate(formula);
    if (!isValid) {
      if (notify)
        ui.notifications!.error(
          `${g().i18n.localize("SIMPLE.NotifyInitFormulaInvalid")}: ${formula}`,
        );
      return;
    }
    CONFIG.Combat.initiative.formula = formula;
  }

  /**
   * Slugify a string.
   */
  Handlebars.registerHelper("slugify", function (value) {
    return value.slugify({ strict: true });
  });

  // Preload template partials
  await preloadHandlebarsTemplates();
});

/**
 * Macrobar hook.
 */
Hooks.on("hotbarDrop", (bar, data, slot) => createZrpsMacro(data, slot));

/**
 * Adds the actor template context menu.
 */
Hooks.on("getActorDirectoryEntryContext", (html, options) => {
  // Define an actor as a template.
  options.push({
    name: g().i18n.localize("SIMPLE.DefineTemplate"),
    icon: '<i class="fas fa-stamp"></i>',
    condition: (li) => {
      const actor = g().actors!.get(li.data("documentId"));
      return !actor!.isTemplate;
    },
    callback: (li) => {
      const actor = g().actors!.get(li.data("documentId"));
      actor!.setFlag("zrps", "isTemplate", true);
    },
  });

  // Undefine an actor as a template.
  options.push({
    name: g().i18n.localize("SIMPLE.UnsetTemplate"),
    icon: '<i class="fas fa-times"></i>',
    condition: (li) => {
      const actor = g().actors!.get(li.data("documentId"));
      return actor!.isTemplate;
    },
    callback: (li) => {
      const actor = g().actors!.get(li.data("documentId"));
      actor!.setFlag("zrps", "isTemplate", false);
    },
  });
});

/**
 * Adds the item template context menu.
 */
Hooks.on("getItemDirectoryEntryContext", (html, options) => {
  // Define an item as a template.
  options.push({
    name: g().i18n.localize("SIMPLE.DefineTemplate"),
    icon: '<i class="fas fa-stamp"></i>',
    condition: (li) => {
      const item = g().items!.get(li.data("documentId"));
      return !item!.isTemplate;
    },
    callback: (li) => {
      const item = g().items!.get(li.data("documentId"));
      item!.setFlag("zrps", "isTemplate", true);
    },
  });

  // Undefine an item as a template.
  options.push({
    name: g().i18n.localize("SIMPLE.UnsetTemplate"),
    icon: '<i class="fas fa-times"></i>',
    condition: (li) => {
      const item = g().items!.get(li.data("documentId"));
      return item!.isTemplate;
    },
    callback: (li) => {
      const item = g().items!.get(li.data("documentId"));
      item!.setFlag("zrps", "isTemplate", false);
    },
  });
});
