import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const XUENS_BATTLEGEAR_4_PIECE_BUFF_HEALING_INCREASE = 0.12;

class XuensBattlegear extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBuff(SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }

    if (!this.owner.selectedCombatant.hasBuff(SPELLS.DANCE_OF_MISTS.id, event.timestamp)) {
      return;
    }
    
      this.healing += calculateEffectiveHealing(event, XUENS_BATTLEGEAR_4_PIECE_BUFF_HEALING_INCREASE);
  }
  
  // Beacon transfer is included in `ABILITIES_AFFECTED_BY_HEALING_INCREASES`
}

export default XuensBattlegear;
