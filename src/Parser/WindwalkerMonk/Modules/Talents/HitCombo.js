/* TODO:
 * Track number of times the buff drops
 * Track what spell / point in fight the buff dropped
*/
import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';

import Combatants from 'Parser/Core/Modules/Combatants';

import Module from 'Parser/Core/Module';


class HitCombo extends Module {
  static dependencies = {
    combatants: Combatants,
  };


  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HIT_COMBO_TALENT.id);
  }


  suggestions(when) {
    const hitComboUptime = this.combatants.selected.getBuffUptime(SPELLS.HIT_COMBO_BUFF.id) / this.owner.fightDuration;

    when(hitComboUptime).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You let your <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> buff drop by casting a spell twice in a row. Dropping this buff is a large DPS decrease so be mindful of the spells being cast.</span>)
          .icon(SPELLS.HIT_COMBO_TALENT.icon)
          .actual(`${formatPercentage(hitComboUptime)} % uptime`)
          .recommended(`>${formatPercentage(recommended)} % is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.2);
      });
  }


  statistic() {
    const hitComboUptime = this.combatants.selected.getBuffUptime(SPELLS.HIT_COMBO_BUFF.id) / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HIT_COMBO_TALENT.id} />}
        value={`${formatPercentage(hitComboUptime)} %`}
        label={(
          <dfn>
            Hit Combo Uptime
          </dfn>
        )}
      />
      );
    }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(61);
}

export default HitCombo;