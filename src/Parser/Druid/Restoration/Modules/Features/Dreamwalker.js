import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';

class Dreamwalker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.DREAMWALKER_TRAIT.id] > 0;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (SPELLS.DREAMWALKER.id === spellId) {
      this.healing += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    const dreamwalkerPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DREAMWALKER.id} />}
        value={`${formatPercentage(dreamwalkerPercent)} %`}
        label="Dreamwalker"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);
}

export default Dreamwalker;
