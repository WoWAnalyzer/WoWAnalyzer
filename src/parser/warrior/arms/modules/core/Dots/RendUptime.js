import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { t } from '@lingui/macro';
import { ThresholdStyle } from 'parser/core/ParseResults';

/**
 * Example report: /report/gXbFvNaJTBf39jYV/1-LFR+Taloc+-+Kill+(4:06)/4-Dimentionz
 */

class RendUptime extends Analyzer {
  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.REND_TALENT.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.7,
        average: 0.65,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    enemies: Enemies,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.REND_TALENT.id);
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.REND_TALENT.id} /> uptime can be improved. If you choose this talent, you better use it !</>)
      .icon(SPELLS.REND_TALENT.icon)
      .actual(t({
      id: "warrior.arms.suggestions.rend.uptime",
      message: `${formatPercentage(actual)}% Rend uptime`
    }))
      .recommended(`>${formatPercentage(recommended)}% is recommended`));
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
