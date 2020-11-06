import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Events, { EventType, ClassResources, EnergizeEvent, CastEvent, HealEvent, SpendResourceEvent } from 'parser/core/Events';
import { Resource } from 'game/RESOURCE_TYPES';

export type BuilderObj = {
  generated: number,
  wasted: number,
  casts: number,
}

export type SpenderObj = {
  spent: number,
  spentByCast: number[],
  casts: number,
}

type ResourceUpdate = {
  timestamp: number | undefined,
  current: number,
  waste: number,
  generated: number,
  used: number,
}

/**
 * This is an 'abstract' implementation of a framework for tracking resource generating/spending.
 * Extend it by following the instructions in the TODO comments below
 */
class ResourceTracker extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    // Optional dependency for the `resourceCost` prop of events
    // spellResourceCost: SpellResourceCost,
  };

  protected eventEmitter!: EventEmitter;

  current = 0;
  resourceUpdates: ResourceUpdate[] = [];

  // stores resource gained/spent/wasted by ability ID
  buildersObj: {[index: number]: BuilderObj} = {};
  spendersObj: {[index: number]: SpenderObj} = {};

  // TODO set this to the resource you wish to track constructor.. see the appropriate objects in game/RESOURCE_TYPES
  resource!: Resource;

  // TODO a classes 'main' resource passes the max along with events, but for other resources this may need to be defined
  maxResource!: number;

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.energize.to(SELECTED_PLAYER), this.onEnergize);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  // FIXME implement natural regen
  // TODO if the tracked resource naturally regenerates (like Energy), set this to true and set the parameters of the regeneration in the below fields
  // naturallyRegenerates = false;
  // baseRegenRate; // TODO resource's base regeneration rate in points per second
  // isRegenHasted; // TODO iff true, regeneration rate will be scaled with haste

  // TODO if you wish an ability to show in results even if it wasn't used, add it using these functions constructor
  initBuilderAbility(spellId: number) {
    this.buildersObj[spellId] = { generated: 0, wasted: 0, casts: 0 };
  }
  initSpenderAbility(spellId: number) {
    this.spendersObj[spellId] = { spent: 0, spentByCast: [], casts: 0 };
  }

  // BUILDERS - Handled on energize, using the 'resourceChange' field
  onEnergize(event: EnergizeEvent) {
    const spellId = event.ability.guid;

    if(event.resourceChangeType !== this.resource.id) {
        return;
    }

    const waste = event.waste;
    const gain = event.resourceChange - waste;
    this._applyBuilder(spellId, gain, waste, this.getResource(event), event.timestamp);
  }

  // FIXME Track resource drains too, so that the 'current' value can be more accurate

  // TODO if a resource gain isn't showing as an energize in events, handle it manually by calling this
  /**
   * FIXME solve with a normalizer instead?
   * Applies an energize of the tracked resource type.
   * @param {number} spellId - The spellId to attribute the resource gain to
   * @param {number} amount - The raw amount of resources to gain
   */
  processInvisibleEnergize(spellId: number, amount: number) {
    const maxGain = this.maxResource !== undefined ? this.maxResource - this.current : amount;
    const gain = Math.min(amount, maxGain);
    const waste = Math.max(amount - maxGain, 0);
    this._applyBuilder(spellId, gain, waste);
  }

  _applyBuilder(spellId: number, gain: number, waste: number,  resource?: ClassResources, timestamp?: number) {
    if (!this.buildersObj[spellId]) {
        this.initBuilderAbility(spellId);
    }

    this.buildersObj[spellId].wasted += waste;
    this.buildersObj[spellId].generated += gain;
    this.buildersObj[spellId].casts += 1;

    // resource.amount for an energize is the amount AFTER the energize
    if (resource !== null && resource !== undefined && resource.amount !== undefined) {
      this.current = resource.amount;
      if (resource.max !== undefined) {
        this.maxResource = resource.max; // track changes in max resource, which can happen due to procs / casts
      }
    } else {
      this.current += gain;
    }

    this.resourceUpdates.push({
      timestamp: timestamp,
      current: this.current,
      waste: waste,
      generated: gain,
      used: 0,
    });
  }

  // SPENDERS - Handled on cast, using the 'classResources' field
  onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    if(!this.shouldProcessCastEvent(event)) {
        return;
    }
    const eventResource = this.getResource(event);

    if(!eventResource){
      return;
    }

    if (eventResource.max) {
      this.maxResource = eventResource.max; // track changes in max resource, which can happen due to procs / casts
    }
    const cost = this.getReducedCost(event);

    if (!this.spendersObj[spellId]) {
      this.initSpenderAbility(spellId);
    }

    if (!cost || cost === 0) {
      return;
    }

    this.spendersObj[spellId].casts += 1;
    this.spendersObj[spellId].spentByCast.push(cost);
    if(cost > 0) {
      this.spendersObj[spellId].spent += cost;
    }

    //Re-sync current amount, to update not-tracked gains.
    this.current = eventResource.amount - cost;

    this.resourceUpdates.push({
      timestamp: event.timestamp,
      current: this.current,
      waste: 0,
      generated: 0,
      used: eventResource.amount,
    });

    this.triggerSpendEvent(cost, event);
  }

  // TODO if your spec has an ability cost reduction that doesn't show in events, handle it manually by overriding here. Or extend SpellResourceCost and apply the discount there.
  getReducedCost(event: CastEvent) {
    if (event.resourceCost && event.resourceCost[this.resource.id] !== undefined) {
      return event.resourceCost[this.resource.id];
    }
    return this.getResource(event)?.cost;
  }

  getResource(event: CastEvent | HealEvent | EnergizeEvent ) {
    if(!event.classResources) {
      return undefined;
    } else {
      return event.classResources.find(r => r.type === this.resource.id);
    }
  }  

  triggerSpendEvent(spent: number, event: CastEvent) {

    const fabricatedEvent: SpendResourceEvent = {
      type: EventType.SpendResource,
      timestamp: event.timestamp,
      sourceID: event.sourceID,
      targetID: event.targetID,
      resourceChange: spent,
      resourceChangeType: this.resource.id,
      ability: event.ability,
      __fabricated: true,
    };

    this.eventEmitter.fabricateEvent(fabricatedEvent, event);
  }

  shouldProcessCastEvent(event: CastEvent) {
    return Boolean(this.getResource(event));
  }

  getGeneratedBySpell(spellId: number) {
    return (this.buildersObj[spellId] && this.buildersObj[spellId].generated) || 0;
  }

  getWastedBySpell(spellId: number) {
    return (this.buildersObj[spellId] && this.buildersObj[spellId].wasted) || 0;
  }

  getBuilderCastsBySpell(spellId: number) {
    return (this.buildersObj[spellId] && this.buildersObj[spellId].casts) || 0;
  }

  get generated() {
    return Object.values(this.buildersObj).reduce((acc, spell) => acc + spell.generated, 0);
  }

  get wasted() {
    return Object.values(this.buildersObj).reduce((acc, spell) => acc + spell.wasted, 0);
  }

  get spent() {
    return Object.values(this.spendersObj).reduce((acc, spell) => acc + spell.spent, 0);
  }

  get spendersCasts() {
    return Object.values(this.spendersObj).reduce((acc, spell) => acc + spell.casts, 0);
  }
}

export default ResourceTracker;
