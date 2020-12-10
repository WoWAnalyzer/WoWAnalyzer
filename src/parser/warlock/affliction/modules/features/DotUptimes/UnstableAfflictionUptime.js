import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events from 'parser/core/Events';

import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import UptimeBar from 'interface/statistics/components/UptimeBar';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class UnstableAfflictionUptime extends Analyzer {

  static dependencies = {
    enemies: Enemies,
  };

  buffedTime = 0;
  damage = 0;
  _buffStart = 0;
  _count = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.UNSTABLE_AFFLICTION), this.onUAapply);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.UNSTABLE_AFFLICTION), this.onUAremove);
  }

  onUAapply(event) {
    this._buffStart = event.timestamp;
  }

  onUAremove(event) {
    this.buffedTime += event.timestamp - this._buffStart;
  }


  get uptime() {
    return this.buffedTime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
     isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(
          <>
            Your <SpellLink id={SPELLS.UNSTABLE_AFFLICTION.id} /> uptime can be improved. Try to pay more attention to your Unstable Affliction on the boss, perhaps use some debuff tracker.
          </>,
        )
          .icon(SPELLS.UNSTABLE_AFFLICTION.icon)
          .actual(i18n._(t('warlock.affliction.suggestions.unstableAffliction.uptime')`${formatPercentage(actual)}% Unstable Affliction uptime.`))
          .recommended(`> ${formatPercentage(recommended)}% is recommended`));
  }

  subStatistic() {
    const history = this.enemies.getCombinedDebuffHistory([SPELLS.UNSTABLE_AFFLICTION.id]);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.UNSTABLE_AFFLICTION.id} />
        </div>
        <div
            className="flex-sub value"
            style={{
              width: 140,
              paddingRight: 8, // to compensate for the asterisk and align % values
            }}
          >
            {formatPercentage(this.uptime, 0)} % <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          <UptimeBar
            uptimeHistory={history}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
            style={{ height: '100%' }}
          />
        </div>
      </div>
    );
  }
}

export default UnstableAfflictionUptime;
