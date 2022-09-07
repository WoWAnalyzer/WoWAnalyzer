import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';

// Casting Eye Beam at over 50 when you have the Blind Fury talent is considered a waste.
const BLIND_FURY_WASTE_CUTOFF = 50;

class FuryTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
    spellUsable: SpellUsable,
  };

  waste = 0;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.FURY;
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const blindFuryId = SPELLS.BLIND_FURY_TALENT.id;
    const classResource = event.classResources?.[0];
    //TODO: Account for Eye Beam clipping
    // Blind Fury resource gain does not have an energize event so it is handled here
    if (
      spellId === SPELLS.EYE_BEAM.id &&
      this.selectedCombatant.hasTalent(blindFuryId) &&
      classResource
    ) {
      this.waste = classResource.amount - BLIND_FURY_WASTE_CUTOFF;
      if (this.waste <= 0) {
        this.waste = 0;
      }
      const AMOUNT = classResource.max - classResource.amount + this.waste;
      this.processInvisibleEnergize(blindFuryId, AMOUNT);
    }
    super.onCast(event);
  }
}

export default FuryTracker;
