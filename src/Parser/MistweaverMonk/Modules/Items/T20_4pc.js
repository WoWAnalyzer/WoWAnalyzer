import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';

import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const XUENS_BATTLEGEAR_4_PIECE_BUFF_HEALING_INCREASE = 0.12;

class T20_4pc extends Module {
  healing = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasBuff(SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id);
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

  item() {
    const t20_4pcHealingPercentage = this.owner.getPercentageOfTotalHealingDone(this.healing);
    return {
      id: `spell-${SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id} />,
      title: <SpellLink id={SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id} />,
      result: (
        <dfn data-tip={`The actual effective healing contributed by the Tier 20 4 piece effect.<br />Buff Uptime: ${((this.owner.selectedCombatant.getBuffUptime(SPELLS.DANCE_OF_MISTS.id)/this.owner.fightDuration)*100).toFixed(2)}%`}>
          {((t20_4pcHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.healing / this.owner.fightDuration * 1000)} HPS
        </dfn>
      ),
    };
  }
}

export default T20_4pc;
