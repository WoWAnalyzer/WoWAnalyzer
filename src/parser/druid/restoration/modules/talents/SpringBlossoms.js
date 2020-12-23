import React from 'react';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringValue from 'interface/statistics/components/BoringValueText';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';

import { t } from '@lingui/macro';

import Mastery from '../core/Mastery';

class SpringBlossoms extends Analyzer {
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

  static dependencies = {
    mastery: Mastery,
  };

  constructor(...args) {
    super(...args);
    const hasSpringBlossoms = this.selectedCombatant.hasTalent(SPELLS.SPRING_BLOSSOMS_TALENT.id);
    this.active = hasSpringBlossoms;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(20)}
        tooltip={(
          <>
            This is the sum of the direct healing from Spring Blossoms and the healing enabled by Spring Blossom's extra mastery stack.
            <ul>
              <li>Direct: <strong>{formatPercentage(this.directPercent)}%</strong></li>
              <li>Mastery: <strong>{formatPercentage(this.masteryPercent)}%</strong></li>
            </ul>
          </>
        )}
      >
        <BoringValue label={<><SpellIcon id={SPELLS.SPRING_BLOSSOMS.id} /> Spring Blossoms healing</>}>
          <>
            {formatPercentage(this.totalPercent)} %
          </>
        </BoringValue>
      </Statistic>
    );
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Your healing from <SpellLink id={SPELLS.SPRING_BLOSSOMS.id} /> could be improved.
          Either your efflorescence uptime could be improved or the encounter doesn't fit this talent very well.</span>)
        .icon(SPELLS.SPRING_BLOSSOMS.icon)
        .actual(t({
      id: "druid.restoration.suggestions.springBlossoms.efficiency",
      message: `${formatPercentage(this.totalPercent)}% healing`
    }))
        .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`));
  }
}

export default SpringBlossoms;
