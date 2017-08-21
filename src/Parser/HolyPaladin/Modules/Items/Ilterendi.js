import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const LEGENDARY_ILTERENDI_BUFF_SPELL_ID = 207589;
const LEGENDARY_ILTERENDI_HEALING_INCREASE = 0.15;

class Ilterendi extends Module {
  healing = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasFinger(ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id);
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

  item() {
    return {
      item: ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON,
      result: this.owner.formatItemHealingDone(this.healing),
    };
  }
  suggestions(when) {
    when(this.owner.getPercentageOfTotalHealingDone(this.healing)).isLessThan(0.045)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your usage of <ItemLink id={ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id} /> can be improved. Try to line up <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} /> and <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> with the buff or consider using an easier legendary.</span>)
          .icon(ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.icon)
          .actual(`${this.owner.formatItemHealingDone(this.healing)} healing contributed`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.005).major(recommended - 0.015);
      });
  }
}

export default Ilterendi;
