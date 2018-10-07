import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer from 'parser/core/Analyzer';

/**
 * This analyzer adds the cost of a specific resource type to cast events, and allows that cost to
 * be adjusted from what's given in the combat log. Typically the combat log doesn't apply resource
 * cost reductions so we need to check for conditions and apply it ourselves. Using SpellResourceCost
 * allows you to apply that reduction just once and have the information available wherever the cast
 * event gets processed.
 * 
 * If you're dealing with mana you should use parser/core/Modules/SpellManaCost instead.
 * 
 * An example implementation can be found at parser/Druid/Feral/Modules/Features/SpellEnergyCost
 * Check the "IMPLEMENTME" comments for what typically needs to be customised.
 */
class SpellResourceCost extends Analyzer {
  // IMPLEMENTME set to one of game/RESOURCE_TYPES
  static resourceType = null;

  constructor(...args) {
    super(...args);
    if (!this.constructor.resourceType || !RESOURCE_TYPES[this.constructor.resourceType.id]) {
      throw new Error('Attempting to use SpellResourceCost without providing a valid resourceType.');
    }
  }

  on_byPlayer_cast(event) {
    if (!event.resourceCost) {
      event.resourceCost = {};
    }
    event.resourceCost[this.constructor.resourceType.id] = this.getResourceCost(event);

    if (!event.rawResourceCost) {
      event.rawResourceCost = {};
    }
    event.rawResourceCost[this.constructor.resourceType.id] = this.getRawResourceCost(event);
  }

  getCostFromEventObject(event) {
    if (!event.classResources) {
      return 0;
    }
    return event.classResources
      .filter(resource => resource.type === this.constructor.resourceType.id)
      .reduce((totalCost, resource) => totalCost + (resource.cost || 0), 0);
  }

  /**
   * IMPLEMENTME
   * "Raw" resource cost is how much the spell costs before any savings are applied. Typically it'll
   * be equal to the cost given in the spell's tooltip.
   * The majority of resource types don't need anything to be set up here as the log values can be used.
   * If the cast event in the combat log doesn't provide the raw resource cost, you can add it.
   * If the cost is provided in a modified state (e.g. 10x the actual value) you can correct that.
   * @param {object} event cast event which consumes resources
   */
  getRawResourceCost(event) {
    return this.getCostFromEventObject(event);
  }

  /**
   * IMPLEMENTME
   * Apply any resource cost adjustments here.
   * @param {object} event cast event which consumes resources
   */
  getResourceCost(event) {
    return this.getRawResourceCost(event);
  }
}

export default SpellResourceCost;
