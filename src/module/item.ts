/**
 * Extend the base Item document for the ZRPS system.
 * @extends {Item}
 */
export class SimpleItem extends Item {
  /**
   * Is this Item used as a template for other Items?
   * @type {boolean}
   */
  get isTemplate(): boolean {
    return false;
  }
}

