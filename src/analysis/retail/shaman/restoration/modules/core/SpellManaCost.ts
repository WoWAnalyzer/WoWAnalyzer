import TALENTS from 'common/TALENTS/shaman';
import { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import CoreSpellManaCost from 'parser/shared/modules/SpellManaCost';
import {
  CURRENT_CONTROL_MANA_REDUCTION,
  CURRENT_CONTROL_AFFECTED_SPELLS,
} from 'src/analysis/retail/shaman/restoration/constants';

/**
 * Current Control: reduces the mana cost of Healing Wave by 15% and the mana cost of
 * Chain Heal by 15%.
 *
 * The combat log reports the true (reduced) cost, but SpellManaCost prefers the hardcoded
 * tooltip cost from SPELLS/TALENTS, so the reduction has to be applied here.
 */

class SpellManaCost extends CoreSpellManaCost {
  protected hasCurrentControl = false;

  constructor(options: Options) {
    super(options);
    this.hasCurrentControl = this.selectedCombatant.hasTalent(TALENTS.CURRENT_CONTROL_TALENT);
  }

  getResourceCost(event: CastEvent) {
    const cost = super.getResourceCost(event);
    if (!cost) {
      return cost;
    }

    if (this.hasCurrentControl && CURRENT_CONTROL_AFFECTED_SPELLS.includes(event.ability.guid)) {
      // mana costs are rounded down
      return Math.floor(cost * (1 - CURRENT_CONTROL_MANA_REDUCTION));
    }

    return cost;
  }
}

export default SpellManaCost;
