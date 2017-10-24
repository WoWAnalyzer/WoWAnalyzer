import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const TWIST_OF_FATE_HEALING_INCREASE = 0.2;

class TwistOfFate extends Module {
  healing = 0;
  damage = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasTalent(SPELLS.TWIST_OF_FATE_TALENT.id) || this.owner.modules.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HIGH_PRIEST.id);
  }

  on_byPlayer_damage(event) {
    if (!this.owner.modules.combatants.selected.hasBuff(SPELLS.TWIST_OF_FATE_BUFF.id, event.timestamp)) {
      return;
    }

    const raw = event.amount + (event.absorbed || 0);
    this.damage += raw - raw / 1.2;
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
    if (!this.owner.modules.combatants.selected.hasBuff(SPELLS.TWIST_OF_FATE_BUFF.id, event.timestamp)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, TWIST_OF_FATE_HEALING_INCREASE);
  }
}

export default TwistOfFate;
