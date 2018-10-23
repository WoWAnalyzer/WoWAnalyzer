import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import ExecuteRange from '../../core/Execute/ExecuteRange';

class RendUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    executeRange: ExecuteRange,
  };

  constructor(...args) {
      super(...args);
      this.active = this.selectedCombatant.hasTalent(SPELLS.REND_TALENT.id);
  }

  get uptime() {
      if (this.executeRange.isTargetInExecuteRange(this.enemies)) {
        return this.enemies.getBuffUptime(SPELLS.REND_TALENT.id) / this.owner.fightDuration;
      } else {
          return null;
      }
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.8,
        average: 0.75,
        major: 0.7,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <>
            Your <SpellLink id={SPELLS.REND_TALENT.id} /> uptime can be improved. If you choose this talent, you better use it ! 
          </>
        )
          .icon(SPELLS.REND_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Rend uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.REND_TALENT.id} /> uptime</>}
        value={`${formatPercentage(this.uptime)} %`}
      />
    );
  }
}

export default RendUptime;