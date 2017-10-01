import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

import Combatants from 'Parser/Core/Modules/Combatants';

class Ironbark extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  prevented = 0;
  casts = 0;
  hasStonebark = false;

  on_initialized() {
    this.hasStonebark = this.combatants.selected.hasTalent(SPELLS.STONEBARK_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(spellId === SPELLS.IRONBARK.id) {

    }

    const spellId = event.ability.guid;
    if (SPELLS.DREAMWALKER.id === spellId) {
      this.healing += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    const dreamwalkerPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);

    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DREAMWALKER.id} />}
        value={`${formatPercentage(dreamwalkerPercent)} %`}
        label="Dreamwalker"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);

}

export default Ironbark;
