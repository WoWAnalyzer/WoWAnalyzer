import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import ItemHealingDone from 'Main/ItemHealingDone';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const XUENS_BATTLEGEAR_4_PIECE_BUFF_HEALING_INCREASE = 0.12;

class T20_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }

    if (!this.combatants.selected.hasBuff(SPELLS.DANCE_OF_MISTS.id, event.timestamp)) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, XUENS_BATTLEGEAR_4_PIECE_BUFF_HEALING_INCREASE);
  }

  item() {
    return {
      id: `spell-${SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id} />,
      title: <SpellLink id={SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id} />,
      result: (
        <dfn data-tip={`The actual effective healing contributed by the Tier 20 4 piece effect.<br />Buff Uptime: ${((this.combatants.selected.getBuffUptime(SPELLS.DANCE_OF_MISTS.id) / this.owner.fightDuration) * 100).toFixed(2)}%`}>
          <ItemHealingDone amount={this.healing} />
        </dfn>
      ),
    };
  }
}

export default T20_4set;
