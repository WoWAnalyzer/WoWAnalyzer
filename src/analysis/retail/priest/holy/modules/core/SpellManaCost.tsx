import SPELLS from 'common/SPELLS';
import { CastEvent } from 'parser/core/Events';
import CoreSpellManaCost from 'parser/shared/modules/SpellManaCost';

import { ABILITIES_AFFECTED_BY_APOTHEOSIS_TALENT } from '../../constants';

const debug = false;

class SpellManaCost extends CoreSpellManaCost {
  getResourceCost(event: CastEvent) {
    const spellId = event.ability.guid;
    let cost = super.getResourceCost(event);
    if (cost === 0) {
      return cost;
    }

    // Apotheosis talent reduces the mana cost of Holy Word spells by 100%
    if (this.selectedCombatant.hasBuff(SPELLS.APOTHEOSIS_TALENT.id, event.timestamp)) {
      const isAbilityAffectedByApotheosis = ABILITIES_AFFECTED_BY_APOTHEOSIS_TALENT.includes(
        spellId,
      );
      if (isAbilityAffectedByApotheosis) {
        debug &&
          console.log(
            SPELLS.APOTHEOSIS_TALENT.name,
            'is active, reducing cost (',
            cost,
            ') by 100%',
          );
        cost = 0;
      }
    }
    return cost;
  }
}

export default SpellManaCost;
