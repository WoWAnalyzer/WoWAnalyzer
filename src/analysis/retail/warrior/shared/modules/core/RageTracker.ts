import TALENTS from 'common/TALENTS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { RAGE_SCALE_FACTOR } from '../normalizers/rage/constants';
import SPELLS from 'common/SPELLS/warrior';

class RageTracker extends ResourceTracker {
  maxResource = 100;
  private furyApexRampageCostReduction = 0;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RAGE;

    // Add 30 rage for each rank of Overwhelming Rage, adjust for scale factor
    this.maxResource += this.selectedCombatant.getTalentRank(TALENTS.OVERWHELMING_RAGE_TALENT) * 30;
    this.furyApexRampageCostReduction =
      this.selectedCombatant.getTalentRank(TALENTS.RAMPAGING_BERSERKER_2_FURY_TALENT) * 150; // fury apex reduces rampage rage cost by 15 rage per rank
  }
  getAdjustedGain(event: ResourceChangeEvent): { gain: number; waste: number } {
    const baseGain = super.getAdjustedGain(event);
    return { gain: baseGain.gain * RAGE_SCALE_FACTOR, waste: baseGain.waste * RAGE_SCALE_FACTOR };
  }

  getAdjustedCost(event: CastEvent): number | undefined {
    let baseCost = super.getAdjustedCost(event) ?? 0;

    if (event.ability.guid === SPELLS.RAMPAGE.id) {
      if (this.selectedCombatant.hasBuff(SPELLS.RECKLESSNESS.id)) {
        baseCost -= this.furyApexRampageCostReduction;
      }
    }

    return baseCost ? baseCost * RAGE_SCALE_FACTOR : undefined;
  }
}

export default RageTracker;
