import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class MarkOfBlood extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.MARK_OF_BLOOD_TALENT.id);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.MARK_OF_BLOOD_TALENT.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<React.Fragment>Your <SpellLink id={SPELLS.MARK_OF_BLOOD_TALENT.id} /> uptime can be improved.</React.Fragment>)
            .icon(SPELLS.MARK_OF_BLOOD_TALENT.icon)
            .actual(`${formatPercentage(actual)}% Mark Of Blood Uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MARK_OF_BLOOD_TALENT.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Mark Of Blood Uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default MarkOfBlood;
