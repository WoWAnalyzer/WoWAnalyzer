import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';

import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';

import UptimeBar from 'parser/ui/UptimeBar';

import { t } from '@lingui/macro';

class AgonyUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.AGONY.id) / this.owner.fightDuration;
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
    const text = this.selectedCombatant.hasTalent(SPELLS.WRITHE_IN_AGONY_TALENT.id) ? (
      <>
        Your <SpellLink id={SPELLS.AGONY.id} /> uptime can be improved as it is your main source of
        Soul Shards. Try to pay more attention to your Agony on the boss, especially since you're
        using <SpellLink id={SPELLS.WRITHE_IN_AGONY_TALENT.id} /> talent.
      </>
    ) : (
      <>
        Your <SpellLink id={SPELLS.AGONY.id} /> uptime can be improved as it is your main source of
        Soul Shards. Try to pay more attention to your Agony on the boss, perhaps use some debuff
        tracker.
      </>
    );
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(text)
        .icon(SPELLS.AGONY.icon)
        .actual(
          t({
            id: 'warlock.affliction.suggestions.agony.uptime',
            message: `${formatPercentage(actual)}% Agony uptime`,
          }),
        )
        .recommended(`> ${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.AGONY.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.AGONY.id} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.uptime, 0)} % <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          <UptimeBar
            uptimeHistory={history}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
          />
        </div>
      </div>
    );
  }
}

export default AgonyUptime;
