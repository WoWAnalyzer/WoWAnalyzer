import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const DIVINITY_HEALING_INCREASE = 0.15;

class Divinity extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.DIVINITY_TALENT.id);
    }
  }

  on_byPlayer_heal(event) {
    this.parseHeal(event);
  }

  on_byPlayer_absorbed(event) {
    this.parseHeal(event);
  }

  parseHeal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }

    if (!this.owner.selectedCombatant.hasBuff(SPELLS.DIVINITY_BUFF.id, event.timestamp)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, DIVINITY_HEALING_INCREASE);
  }
}

export default Divinity;
