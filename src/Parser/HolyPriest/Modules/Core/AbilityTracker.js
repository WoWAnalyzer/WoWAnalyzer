import SPELLS from 'common/SPELLS';

import CoreAbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import { ABILITIES_AFFECTED_BY_APOTHEOSIS_TALENT } from './../../Constants';

const debug = false;

class AbilityTracker extends CoreAbilityTracker {

  getManaCost(event) {
    const spellId = event.ability.guid;
    let cost = super.getManaCost(event);
    if (cost === 0) {
      return cost;
    }

    // Apotheosis talent reduces the mana cost of Holy Word spells by 100%
    if (this.owner.selectedCombatant.hasBuff(SPELLS.APOTHEOSIS_TALENT.id, event.timestamp)) {
      const isAbilityAffectedByApotheosis = ABILITIES_AFFECTED_BY_APOTHEOSIS_TALENT.indexOf(spellId) !== -1;
      if (isAbilityAffectedByApotheosis) {
        debug && console.log(SPELLS.APOTHEOSIS_TALENT.name, 'is active, reducing cost (', cost, ') by 100%');
        cost = 0;
      }
    }
    return cost;
  }
}
export default AbilityTracker;
