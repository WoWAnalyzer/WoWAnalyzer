import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'interface/statistics/Statistic';
import { TooltipElement } from 'common/Tooltip';
import { t } from '@lingui/macro';

class RakeUptime extends Analyzer {
  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.RAKE_BLEED.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
      <>
        Your <SpellLink id={SPELLS.RAKE.id} /> uptime can be improved. Unless the current application was buffed by Prowl you should refresh the DoT once it has reached its <TooltipElement content="The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.">pandemic window</TooltipElement>, don't wait for it to wear off.
      </>,
    )
      .icon(SPELLS.RAKE.icon)
      .actual(t({
      id: "druid.feral.suggestions.rake.uptime",
      message: `${formatPercentage(actual)}% uptime`
    }))
      .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.RAKE}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RakeUptime;
