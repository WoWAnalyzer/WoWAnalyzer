import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

const BREATH_COST_PER_TICK = 160;
const HYPOTHERMIC_PRESENCE_COST_REDUCTION = .35;

class RunicPowerTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RUNIC_POWER;

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BREATH_OF_SINDRAGOSA_TALENT_DAMAGE_TICK), this.onBreathDamage);
  }

  mostRecentTickTime = 0;
  private _totalHypothermicPresenceReduction = 0;

  get totalHypothermicPresenceReduction() {
    return Math.round(this._totalHypothermicPresenceReduction / 10);
  }

  // The following is adapted from ResourceTracker to handle the specific use case for BoS where
  // a single cast event triggers many ticks of a damage event where each damage tick costs
  // resources
  onCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id) {
      if (!this.spendersObj[SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id]) {
        this.initSpenderAbility(SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id);
      }
      
      this.spendersObj[SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id].casts += 1;
    }

    else {
      super.onCast(event);
    }
  }

  onBreathDamage(event: DamageEvent) {
    if (event.timestamp === this.mostRecentTickTime) {
      return;
    }

    // need to make a fake cast to satisfy TypeScript expecting a cast event in triggerSpendEvent
    const fakeCast: CastEvent = {
      type: EventType.Cast,
      timestamp: event.timestamp,
      sourceID: event.sourceID!,
      targetID: event.targetID,
      ability: event.ability,
      sourceIsFriendly: event.sourceIsFriendly,
      targetIsFriendly: event.targetIsFriendly,
    }    

    let cost = this.getHypothermicPresenceReduction(BREATH_COST_PER_TICK, event.timestamp);

    cost = cost / 10;

    this.spendersObj[SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id].spentByCast.push(cost);
    if(cost > 0) {
      this.spendersObj[SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id].spent += cost;
    }

    this.current -= cost;

    this.resourceUpdates.push({
      timestamp: event.timestamp,
      current: this.current,
      waste: 0,
      generated: 0,
      used: cost,
    });

    this.triggerSpendEvent(cost, fakeCast);

    this.mostRecentTickTime = event.timestamp;
  }

  getHypothermicPresenceReduction(cost: number, timestamp: number) {
    
    if (this.selectedCombatant.hasBuff(SPELLS.HYPOTHERMIC_PRESENCE_TALENT.id, timestamp)) {
      const newCost = cost * (1 - HYPOTHERMIC_PRESENCE_COST_REDUCTION);
      this._totalHypothermicPresenceReduction += (cost - newCost);
      cost = newCost;
    }

    return cost;
  }

  getReducedCost(event: CastEvent) {
    const cost = this.getResource(event)?.cost;
    if (cost) {
      const reducedCost = this.getHypothermicPresenceReduction(cost, event.timestamp);
      return reducedCost / 10;
    }
  }
}

export default RunicPowerTracker;
