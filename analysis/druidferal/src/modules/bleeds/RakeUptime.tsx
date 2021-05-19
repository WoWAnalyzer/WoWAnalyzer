import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import React from 'react';

import uptimeBarSubStatistic from '../core/UptimeBarSubStatistic';

class RakeUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.RAKE_BLEED.id) / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.RAKE_BLEED.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.RAKE.id} /> uptime can be improved. Unless the current
          application was buffed by Prowl you should refresh the DoT once it has reached its{' '}
          <TooltipElement content="The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.">
            pandemic window
          </TooltipElement>
          , don't wait for it to wear off.
        </>,
      )
        .icon(SPELLS.RAKE.icon)
        .actual(
          t({
            id: 'druid.feral.suggestions.rake.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      SPELLS.RAKE_BLEED.id,
      this.uptime,
      this.uptimeHistory,
    );
  }
}

export default RakeUptime;
