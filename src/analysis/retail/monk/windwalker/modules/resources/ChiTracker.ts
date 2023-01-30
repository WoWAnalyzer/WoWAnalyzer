import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

import SpellChiCost from './SpellChiCost';
import { TALENTS_MONK } from 'common/TALENTS';

class ChiTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
    spellResourceCost: SpellChiCost,
  };

  maxResource = 5;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.CHI;

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.ASCENSION_TALENT)) {
      this.maxResource = 6;
    }
  }
}

export default ChiTracker;
