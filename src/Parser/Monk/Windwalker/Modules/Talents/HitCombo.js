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

import Analyzer from 'Parser/Core/Analyzer';


class HitCombo extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };


  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HIT_COMBO_TALENT.id);
  }

  get suggestionThresholds() {
    const hitComboUptime = this.combatants.selected.getBuffUptime(SPELLS.HIT_COMBO_BUFF.id) / this.owner.fightDuration;
    return {
      actual: hitComboUptime,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.90,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const hitComboUptime = this.combatants.selected.getBuffUptime(SPELLS.HIT_COMBO_BUFF.id) / this.owner.fightDuration;

    when(this.suggestionThresholds).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You let your <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> buff drop by casting a spell twice in a row. Dropping this buff is a large DPS decrease so be mindful of the spells being cast.</span>)
          .icon(SPELLS.HIT_COMBO_TALENT.icon)
          .actual(`${formatPercentage(hitComboUptime)} % uptime`)
          .recommended(`>${formatPercentage(recommended)} % is recommended`);
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
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default HitCombo;
