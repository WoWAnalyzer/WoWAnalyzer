import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

const DURATION = 30000;

class Efflorescence extends Analyzer {

  precastUptime = 0;
  castUptime = 0;
  castTimestamps = []; // TODO this array not really used yet, but I plan to use it to catch early refreshes


  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.EFFLORESCENCE_CAST.id) {
      return;
    }

    if (this.lastCastTimestamp !== null) {
      this.castUptime += Math.min(DURATION, event.timestamp - this.lastCastTimestamp);
    }
    this.castTimestamps.push(event.timestamp);
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.EFFLORESCENCE_HEAL.id) {
      return;
    }
    // if efflo heals before the first cast, we assume it was from a precast
    if (this.castTimestamps.length === 0) {
      this.precastUptime = event.timestamp - this.owner.fight.start_time;
    }
  }

  get lastCastTimestamp() {
    return this.castTimestamps.length === 0 ? null : this.castTimestamps[this.castTimestamps.length - 1];
  }

  get uptime() {
    // uptime from a cast is only tallied in 'castUptime' on the *next* cast, so the most recent cast must be handled special
    const activeUptime = this.lastCastTimestamp === null ? 0 : Math.min(DURATION, this.owner.currentTimestamp - this.lastCastTimestamp);
    return this.precastUptime + this.castUptime + activeUptime;
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.90,
        average: 0.50,
        major: 0.25,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> uptime can be improved.</span>)
          .icon(SPELLS.EFFLORESCENCE_CAST.icon)
          .actual(`${formatPercentage(this.uptimePercent)}% uptime`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`);
      });

    // TODO suggestion for early refreshes
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EFFLORESCENCE_CAST.id} />}
        value={`${formatPercentage(this.uptimePercent)} %`}
        label="Efflorescence Uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(12);

}

export default Efflorescence;
