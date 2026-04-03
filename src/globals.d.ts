/// <reference path="../node_modules/@league-of-foundry-developers/foundry-vtt-types/src/index-lenient.d.mts" />

export {}; // make this a module so that `declare global` augmentations apply

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface ReadyGame {
    zrps: Record<string, any>;
  }

  // Register zrps settings keys so TypeScript accepts them in game.settings
  interface SettingConfig {
    "zrps.macroShorthand": boolean;
    "zrps.initFormula": string;
  }
}
