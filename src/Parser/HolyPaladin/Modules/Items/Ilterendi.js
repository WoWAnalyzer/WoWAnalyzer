import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const LEGENDARY_ILTERENDI_BUFF_SPELL_ID = 207589;
const LEGENDARY_ILTERENDI_HEALING_INCREASE = 0.15;

class Ilterendi extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasFinger(ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }
    if (!this.owner.selectedCombatant.hasBuff(LEGENDARY_ILTERENDI_BUFF_SPELL_ID, event.timestamp)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, LEGENDARY_ILTERENDI_HEALING_INCREASE);
  }

  // Beacon transfer is included in `ABILITIES_AFFECTED_BY_HEALING_INCREASES`
}

export default Ilterendi;
