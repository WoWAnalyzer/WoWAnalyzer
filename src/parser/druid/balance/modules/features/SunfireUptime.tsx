import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import { t } from '@lingui/macro';

class SunfireUptime extends Analyzer {
  get suggestionThresholds() {
    const sunfireUptime = this.enemies.getBuffUptime(SPELLS.SUNFIRE.id) / this.owner.fightDuration;
    return {
      actual: sunfireUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.SUNFIRE.id} /> uptime can be improved. Try to pay more attention to your Sunfire on the boss.</>)
      .icon(SPELLS.SUNFIRE.icon)
      .actual(t({
      id: "druid.balance.suggestions.sunfire.uptime",
      message: `${formatPercentage(actual)}% Sunfire uptime`
    }))
      .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    const sunfireUptime = this.enemies.getBuffUptime(SPELLS.SUNFIRE.id) / this.owner.fightDuration;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.SUNFIRE}>
          <>
            <UptimeIcon /> {formatPercentage(sunfireUptime)} % <small>uptime</small>
          </>
        </BoringSpellValueText>

      </Statistic>
    );
  }
}

export default SunfireUptime;
