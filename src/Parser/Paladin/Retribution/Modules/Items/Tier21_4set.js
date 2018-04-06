import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class Tier21_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  holyPowerGained = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RET_PALADIN_T21_4SET_BONUS.id);
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RET_PALADIN_T21_4SET_BONUS_BUFF.id) {
      return;
    }
    this.holyPowerGained += 1;
  }

  item() {
    return {
      id: `spell-${SPELLS.RET_PALADIN_T21_4SET_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.RET_PALADIN_T21_4SET_BONUS.id} />,
      title: <SpellLink id={SPELLS.RET_PALADIN_T21_4SET_BONUS.id} icon={false} />,
      result: (
        <dfn data-tip={`Total Holy Power Gained: ${formatNumber(this.holyPowerGained)}`}>
          {formatNumber(this.holyPowerGained / this.owner.fightDuration * 60000)} Holy Power gained per minute.
        </dfn>
      ),
    };
  }
}

export default Tier21_4set;
