import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import CoreSpellManaCost from 'parser/shared/modules/SpellManaCost';
import {
  CURRENT_CONTROL_MANA_REDUCTION,
  CURRENT_CONTROL_AFFECTED_SPELLS,
  ASCENDANCE_MANA_REDUCTION,
} from 'src/analysis/retail/shaman/restoration/constants';

/**
 * Current Control: reduces the mana cost of Healing Wave by 15% and the mana cost of
 * Chain Heal by 15%.
 *
 * Ascendance: reduces the mana cost of Healing Wave and Chain Heal by 25% while the buff
 * is active (from Ascendance itself or a Deeply Rooted Elements proc).
 *
 * As of 12.1, the two reductions stack multiplicatively and the result is rounded down once.
 *
 * The combat log reports the true (reduced) cost, but SpellManaCost prefers the hardcoded
 * tooltip cost from SPELLS/TALENTS, so the reduction has to be applied here.
 */

class SpellManaCost extends CoreSpellManaCost {
  protected hasCurrentControl = false;
  protected canHaveAscendanceBuff = false;

  constructor(options: Options) {
    super(options);
    this.hasCurrentControl = this.selectedCombatant.hasTalent(TALENTS.CURRENT_CONTROL_TALENT);
    this.canHaveAscendanceBuff =
      this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_RESTORATION_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT);
  }

  getResourceCost(event: CastEvent) {
    const cost = super.getResourceCost(event);
    if (!cost) {
      return cost;
    }

    if (!CURRENT_CONTROL_AFFECTED_SPELLS.includes(event.ability.guid)) {
      return cost;
    }

    let multiplier = 1;

    if (this.hasCurrentControl) {
      multiplier *= 1 - CURRENT_CONTROL_MANA_REDUCTION;
    }

    if (
      this.canHaveAscendanceBuff &&
      this.selectedCombatant.hasBuff(SPELLS.ASCENDANCE_RESTORATION_BUFF.id, event.timestamp)
    ) {
      multiplier *= 1 - ASCENDANCE_MANA_REDUCTION;
    }

    // mana costs are rounded down
    return Math.floor(cost * multiplier);
  }
}

export default SpellManaCost;
