import TALENTS from 'common/TALENTS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { RAGE_SCALE_FACTOR } from '../normalizers/rage/constants';

class RageTracker extends ResourceTracker {
  maxResource = 100;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RAGE;

    // Add 15 rage for each rank of Overwhelming Rage, adjust for scale factor
    this.maxResource += this.selectedCombatant.getTalentRank(TALENTS.OVERWHELMING_RAGE_TALENT) * 15;
  }
  getAdjustedGain(event: ResourceChangeEvent): { gain: number; waste: number } {
    const baseGain = super.getAdjustedGain(event);
    return { gain: baseGain.gain * RAGE_SCALE_FACTOR, waste: baseGain.waste * RAGE_SCALE_FACTOR };
  }

  getAdjustedCost(event: CastEvent): number | undefined {
    const baseCost = super.getAdjustedCost(event);
    return baseCost ? baseCost * RAGE_SCALE_FACTOR : undefined;
  }
}

export default RageTracker;
