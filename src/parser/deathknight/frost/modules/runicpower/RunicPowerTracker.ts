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

  onBreathDamage(event: DamageEvent) {
    if (event.timestamp === this.mostRecentTickTime) {
      return;
    }

    const spellId = event.ability.guid;

    const fakeCast: CastEvent = {
      type: EventType.Cast,
      timestamp: event.timestamp,
      sourceID: event.sourceID!,
      targetID: event.targetID,
      ability: event.ability,
      sourceIsFriendly: event.sourceIsFriendly,
      targetIsFriendly: event.targetIsFriendly,
    }    

    let cost = this.selectedCombatant.hasBuff(SPELLS.HYPOTHERMIC_PRESENCE_TALENT.id, event.timestamp) ? BREATH_COST_PER_TICK * (1 - HYPOTHERMIC_PRESENCE_COST_REDUCTION) : BREATH_COST_PER_TICK

    cost = cost / 10;

    if (!this.spendersObj[spellId]) {
      this.initSpenderAbility(spellId);
    }

    this.spendersObj[spellId].spentByCast.push(cost);
    if(cost > 0) {
      this.spendersObj[spellId].spent += cost;
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

  getReducedCost(event: CastEvent) {
    const cost = this.getResource(event)?.cost;
    if (cost) {
      return cost / 10;
    }
  }
}

export default RunicPowerTracker;
