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
    // I noticed that if UA gets pre-cast, we don't get the UA apply event?
    this.buffedTime += event.timestamp - Math.max(this._buffStart, this.owner.fight.start_time);
  }


  get uptime() {
    return this.buffedTime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    // raises the thresholds by 5% if player has Cascading Calamity trait
    const cascadingCalamityBonus = this.selectedCombatant.hasTrait(SPELLS.CASCADING_CALAMITY.id) ? 0.05 : 0;
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.7 + cascadingCalamityBonus,
        average: 0.6 + cascadingCalamityBonus,
        major: 0.5 + cascadingCalamityBonus,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(
          <>
            Your <SpellLink id={SPELLS.UNSTABLE_AFFLICTION.id} /> uptime is too low. Try spacing out your UAs a little more so that you get the most out of the internal 10% damage bonus, unless you're pooling for <SpellLink id={SPELLS.SUMMON_DARKGLARE.id} /> or focusing priority targets.
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
