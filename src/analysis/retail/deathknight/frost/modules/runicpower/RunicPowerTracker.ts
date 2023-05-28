import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, EventType, ResourceChangeEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

const BREATH_COST_PER_TICK = 180;

class RunicPowerTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RUNIC_POWER;

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BREATH_OF_SINDRAGOSA_TALENT_DAMAGE_TICK),
      this.onBreathDamage,
    );
  }

  mostRecentTickTime = 0;

  // The following is adapted from ResourceTracker to handle the specific use case for BoS where
  // a single cast event triggers many ticks of a damage event where each damage tick costs
  // resources
  onCast(event: CastEvent) {
    if (event.ability.guid === talents.BREATH_OF_SINDRAGOSA_TALENT.id) {
      if (!this.spendersObj[talents.BREATH_OF_SINDRAGOSA_TALENT.id]) {
        this.initSpenderAbility(talents.BREATH_OF_SINDRAGOSA_TALENT.id);
      }

      this.spendersObj[talents.BREATH_OF_SINDRAGOSA_TALENT.id].casts += 1;
    } else {
      super.onCast(event);
    }
  }

  onBreathDamage(event: DamageEvent) {
    if (event.timestamp === this.mostRecentTickTime) {
      return;
    }

    const fabricatedSourceId: CastEvent = {
      type: EventType.Cast,
      ability: event.ability,
      timestamp: event.timestamp,
      sourceID: event.sourceID!,
      sourceIsFriendly: event.sourceIsFriendly,
      targetIsFriendly: event.targetIsFriendly,
    };

    event.sourceID = 1;
    const cost = BREATH_COST_PER_TICK;
    this._applySpender(fabricatedSourceId, cost, this.getResource(event));

    this.mostRecentTickTime = event.timestamp;
  }

  /** All RP amounts multiplied by 10 - except gain and waste for some reason */
  getAdjustedGain(event: ResourceChangeEvent): { gain: number; waste: number } {
    const baseGain = super.getAdjustedGain(event);
    return { gain: baseGain.gain * 10, waste: baseGain.waste * 10 };
  }

  // getAdjustedCost(event: CastEvent) {
  //   const cost = this.getResource(event)?.cost;
  //   if (cost) {
  //     return cost / 10;
  //   }
  // }
}

export default RunicPowerTracker;
