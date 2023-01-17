import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { CastEvent } from 'parser/core/Events';
import SpellResourceCost from 'parser/shared/modules/SpellResourceCost';

class SpellChiCost extends SpellResourceCost {
  static resourceType = RESOURCE_TYPES.CHI;

  protected getRawResourceCost(event: CastEvent) {
    let cost = super.getRawResourceCost(event);

    // Blackout Kick costs 3 chi when learned, but is reduced in cost during levelling
    if (event.ability.guid === SPELLS.BLACKOUT_KICK.id) {
      cost = 1;
    }

    return cost;
  }
}

export default SpellChiCost;
