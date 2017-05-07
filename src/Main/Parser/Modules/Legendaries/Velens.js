import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Main/Parser/Module';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'Main/Parser/Constants';
import calculateEffectiveHealing from 'Main/Parser/calculateEffectiveHealing';

const LEGENDARY_VELENS_HEAL_SPELL_ID = 235967;
const LEGENDARY_VELENS_HEALING_INCREASE = 0.15;

class Velens extends Module {
  healing = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1 && spellId !== LEGENDARY_VELENS_HEAL_SPELL_ID) {
      return;
    }

    if (spellId === LEGENDARY_VELENS_HEAL_SPELL_ID) {
      // This is the overhealing part of Velen's Future Sight, just include its amount and we're done
      this.healing += event.amount;
      return;
    }

    if (!this.owner.selectedCombatant.hasBuff(SPELLS.VELENS_FUTURE_SIGHT.id, event.timestamp)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, LEGENDARY_VELENS_HEALING_INCREASE);
  }

  // Beacon transfer is included in `ABILITIES_AFFECTED_BY_HEALING_INCREASES`
}

export default Velens;
