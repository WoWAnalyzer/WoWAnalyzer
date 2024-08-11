import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { ResourceChangeEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ASTRAL_POWER_SCALE_FACTOR } from 'analysis/retail/druid/balance/constants';

export const PERFECT_ASP_WASTED = 0;
export const GOOD_ASP_WASTED = 0.05;
export const OK_ASP_WASTED = 0.15;

class AstralPowerTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.ASTRAL_POWER;
  }

  get wastedPerformance(): QualitativePerformance {
    const percentWasted = this.percentWasted;
    if (percentWasted <= PERFECT_ASP_WASTED) {
      return QualitativePerformance.Perfect;
    }
    if (percentWasted <= GOOD_ASP_WASTED) {
      return QualitativePerformance.Good;
    }
    if (percentWasted <= OK_ASP_WASTED) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  /** All AsP amounts multiplied by 10 - except gain and waste for some reason */
  getAdjustedGain(event: ResourceChangeEvent): { gain: number; waste: number } {
    const baseGain = super.getAdjustedGain(event);
    return {
      gain: baseGain.gain / ASTRAL_POWER_SCALE_FACTOR,
      waste: baseGain.waste / ASTRAL_POWER_SCALE_FACTOR,
    };
  }

  // TODO reactivate WoE handling when/if needed
  // Split Warrior of Elune Astral Power bonus into it's own entry.
  // onEnergize(event: ResourceChangeEvent) {
  // const spellId = event.ability.guid;
  // if (
  //   spellId !== SPELLS.STARFIRE.id ||
  //   !this.selectedCombatant.hasBuff(TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT.id)
  // ) {
  //   super.onEnergize(event);
  //   return;
  // }
  // if (event.resourceChangeType !== this.resource.id) {
  //   return;
  // }
  // const gain = event.resourceChange;
  // const eluneRaw = gain - gain / (1 + WARRIOR_OF_ELUNE_MULTIPLIER);
  // const eluneWaste = Math.min(event.waste, eluneRaw);
  // const baseWaste = event.waste - eluneWaste;
  // const baseGain = gain - eluneRaw - baseWaste;
  // const eluneGain = eluneRaw - eluneWaste;
  // this._applyBuilder(spellId, baseGain, baseWaste, event.timestamp, this.getResource(event));
  // this._applyBuilder(
  //   TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT.id,
  //   eluneGain,
  //   eluneWaste,
  //   event.timestamp,
  //   this.getResource(event),
  // );
  // }

  // getAdjustedCost(event: CastEvent) {
  //   const resource = this.getResource(event);
  //   if (!resource || !resource.cost) {
  //     return 0;
  //   }
  //   const cost = resource.cost / 10;
  //   return cost;
  // }
}

export default AstralPowerTracker;
