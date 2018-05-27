import SPELLS from 'common/SPELLS';
import CoreSpellManaCost from 'Parser/Core/Modules/SpellManaCost';

// dependencies
import Combatants from 'Parser/Core/Modules/Combatants';

import { ABILITIES_AFFECTED_BY_APOTHEOSIS_TALENT } from '../../Constants';

const debug = false;

class SpellManaCost extends CoreSpellManaCost {
  static dependencies = {
    combatants: Combatants,
  }

  getManaCost(event) {
    const spellId = event.ability.guid;
    let cost = super.getManaCost(event);
    if (cost === 0) {
      return cost;
    }

    // Apotheosis talent reduces the mana cost of Holy Word spells by 100%
    if (this.combatants.selected.hasBuff(SPELLS.APOTHEOSIS_TALENT.id, event.timestamp)) {
      const isAbilityAffectedByApotheosis = ABILITIES_AFFECTED_BY_APOTHEOSIS_TALENT.includes(spellId);
      if (isAbilityAffectedByApotheosis) {
        debug && console.log(SPELLS.APOTHEOSIS_TALENT.name, 'is active, reducing cost (', cost, ') by 100%');
        cost = 0;
      }
    }
    return cost;
  }
}

export default SpellManaCost;
