import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
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
    if (this.selectedCombatant.hasBuff(TALENTS.APOTHEOSIS_TALENT.id, event.timestamp)) {
      const isAbilityAffectedByApotheosis =
        ABILITIES_AFFECTED_BY_APOTHEOSIS_TALENT.includes(spellId);
      if (isAbilityAffectedByApotheosis) {
        debug &&
          console.log(
            TALENTS.APOTHEOSIS_TALENT.name,
            'is active, reducing cost (',
            cost,
            ') by 100%',
          );
        cost = 0;
      }
    }

    if (
      spellId === SPELLS.FLASH_HEAL.id &&
      this.selectedCombatant.hasBuff(SPELLS.SURGE_OF_LIGHT_BUFF.id, event.timestamp)
    ) {
      return 0;
    }

    return cost;
  }
}

export default SpellManaCost;
