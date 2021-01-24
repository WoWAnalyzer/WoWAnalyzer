import React from 'react';

import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { SpellLink, SpellIcon } from 'interface';

import UptimeBar from 'parser/ui/UptimeBar';

import { t } from '@lingui/macro';
import COVENANTS from 'game/shadowlands/COVENANTS';

class ScouringTitheUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.SCOURING_TITHE.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.8,
        average: 0.75,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.SCOURING_TITHE.id} /> uptime can be improved. Try to pay more
          attention to your Scouring Tithe on the boss, its cooldown is reset when the enemy
          survives.
        </>,
      )
        .icon(SPELLS.SCOURING_TITHE.icon)
        .actual(
          t({
            id: 'warlock.affliction.suggestions.scouring_tithe.uptime',
            message: `${formatPercentage(actual)}% Scouring Tithe uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.SCOURING_TITHE.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.SCOURING_TITHE.id} />
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

export default ScouringTitheUptime;
