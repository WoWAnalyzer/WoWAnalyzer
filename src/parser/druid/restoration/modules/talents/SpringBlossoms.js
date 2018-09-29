import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Mastery from '../core/Mastery';

class SpringBlossoms extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  constructor(...args) {
    super(...args);
    const hasSpringBlossoms = this.selectedCombatant.hasTalent(SPELLS.SPRING_BLOSSOMS_TALENT.id);
    this.active = hasSpringBlossoms;
  }

  get directPercent() {
    return this.owner.getPercentageOfTotalHealingDone(this.mastery.getDirectHealing(SPELLS.SPRING_BLOSSOMS.id));
  }

  get masteryPercent() {
    return this.owner.getPercentageOfTotalHealingDone(this.mastery.getMasteryHealing(SPELLS.SPRING_BLOSSOMS.id));
  }

  get totalPercent() {
    return this.directPercent + this.masteryPercent;
  }

  get suggestionThresholds() {
    return {
      actual: this.totalPercent,
      isLessThan: {
        minor: 0.07,
        average: 0.05,
        major: 0.03,
      },
      style: 'percentage',
    };
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SPRING_BLOSSOMS.id} />}
        value={`${formatPercentage(this.totalPercent)} %`}
        label="Spring Blossoms Healing"
        tooltip={`This is the sum of the direct healing from Spring Blossoms and the healing enabled by Spring Blossom's extra mastery stack.
            <ul>
            <li>Direct: <b>${formatPercentage(this.directPercent)}%</b></li>
            <li>Mastery: <b>${formatPercentage(this.masteryPercent)}%</b></li>
            </ul>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your healing from <SpellLink id={SPELLS.SPRING_BLOSSOMS.id} /> could be improved.
          Either your efflorescence uptime could be improved or the encounter doesn't fit this talent very well.</span>)
          .icon(SPELLS.SPRING_BLOSSOMS.icon)
          .actual(`${formatPercentage(this.totalPercent)}% healing`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`);
      });
  }
}

export default SpringBlossoms;
