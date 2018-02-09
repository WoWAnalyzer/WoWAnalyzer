import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
 * This is an 'abstract' implementation of a framework for tracking resource generating/spending.
 * Extend it by following the instructions in the TODO comments below
 */
class ResourceTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  generated = 0;
  wasted = 0;
  spent = 0;
  spendersCasts = 0;
  current = 0;

  // stores resource gained/spent/wasted by ability ID
  buildersObj = {};
  spendersObj = {};

  // TODO set this to the resource you wish to track on_initialized.. see the appropriate objects in common/RESOURCE_TYPES
  resource;

  // TODO a classes 'main' resource passes the max along with events, but for other resources this may need to be defined
  maxResource;

  // TODO if the tracked resource naturally regenerates (like Energy), set this to true and set the parameters of the regeneration in the below fields
  naturallyRegenerates = false;
  baseRegenRate; // TODO resource's base regeneration rate in points per second
  isRegenHasted; // TODO iff true, regeneration rate will be scaled with haste

  // TODO if you wish an ability to show in results even if it wasn't used, add it using these functions on_initialized
  initBuilderAbility(spellId) {
    this.buildersObj[spellId] = { generated: 0, wasted: 0, casts: 0 };
  }
  initSpenderAbility(spellId) {
    this.spendersObj[spellId] = { spent: 0, spentByCast: [], casts: 0 };
  }

  //Builders
  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;

    if(event.resourceChangeType !== this.resource.id) {
        return;
    }

    const waste = event.waste;
    const gain = event.resourceChange - waste;
    this._applyBuilder(spellId, this.getResource(event), gain, waste);
  }

  // TODO if a resource gain isn't showing as an energize in events, handle it manually by calling this
  /**
   * FIXME solve with a normalizer instead?
   * Applies an energize of the tracked resource type.
   * @param {number} spellId - The spellId to attribute the resource gain to
   * @param {number} amount - The raw amount of resources to gain
   */
  processInvisibleEnergize(spellId, amount) {
    const maxGain = this.maxResource - this.current;
    const gain = Math.min(amount, maxGain);
    const waste = Math.max(amount - maxGain, 0);
    this._applyBuilder(spellId, null, gain, waste);
  }

  _applyBuilder(spellId, currentAfterGain, gain, waste) {
    if (!(spellId in this.buildersObj)) {
        this.initBuilderAbility(spellId);
    }

    this.buildersObj[spellId].wasted += waste;
    this.buildersObj[spellId].generated += gain;
    this.buildersObj[spellId].casts += 1;
    this.wasted += waste;
    this.generated += gain;

    if (currentAfterGain !== null && currentAfterGain !== undefined) {
      this.current = currentAfterGain;
    } else {
      this.current += gain;
    }
  }

  //Spenders
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(!this.shouldProcessCastEvent(event)) {
        return;
    }
    const eventResource = this.getResource(event);
    const cost = this.getReducedCost(event);

    if (!(spellId in this.spendersObj)) {
      this.initSpenderAbility(spellId);
    }

    if (!cost || cost === 0) {
      return;
    }

    this.spendersObj[spellId].casts += 1;
    this.spendersCasts += 1;
    this.spendersObj[spellId].spentByCast.push(cost);
    if(cost > 0)
    {
      this.spendersObj[spellId].spent += cost;
      this.spent += cost;
    }

    //Re-sync current amount, to update not-tracked gains.
    this.current = eventResource.amount - cost;

    this.triggerSpendEvent(cost, event);
  }

  // TODO if your spec has an ability cost reduction that doesn't show in events, handle it manually by overriding here
  getReducedCost(event) {
    return this.getResource(event).cost;
  }

  triggerSpendEvent(spent, event) {
    this.owner.triggerEvent('spendresource', {
      timestamp: event.timestamp,
      type: 'spendresource',
      sourceID: event.sourceID,
      targetID: event.targetID,
      reason: event,
      resourceChange: spent,
      resourceChangeType: this.resource.id,
      ability: event.ability,
    });
  }

  shouldProcessCastEvent(event) {
    return !!this.getResource(event);
  }

  getResource(event) {
    if(!event.classResources) {
      return null;
    } else {
      return event.classResources.find(r=>r.type === this.resource.id);
    }
  }
}

export default ResourceTracker;
