import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

class ChiTracker extends ResourceTracker {
  maxResource = 5;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.CHI;

    if (this.selectedCombatant.hasTalent(SPELLS.ASCENSION_TALENT.id)) {
      this.maxResource = 6;
    }
  }

  getReducedCost(event: CastEvent) {
    let cost = this.getResource(event)?.cost;
    if (!cost) {
      return 0;
    }
    const spellId = event.ability.guid;

    // Blackout Kick costs 3 chi when learned, but is reduced in cost during levelling
    if (spellId === SPELLS.BLACKOUT_KICK.id) {
      cost = 1;
    }
    return cost;
  }
}

export default ChiTracker;
