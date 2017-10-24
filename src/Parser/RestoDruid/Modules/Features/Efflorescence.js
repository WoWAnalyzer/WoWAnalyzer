import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import SuggestionThresholds from '../../SuggestionThresholds';

const debug = false;

class Efflorescence extends Analyzer {

  lastCast = null;
  totalUptime = 0;
  counter = 0;
  firstEffloTickTimestamp = null;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.EFFLORESCENCE_CAST.id !== spellId) {
      return;
    }
    debug && console.log(`Enter efflo #: ${this.counter}`);
    if (this.lastCast) {
      debug && console.log(`Difference: ${event.timestamp - this.lastCast}`);
      this.totalUptime += Math.min((event.timestamp - this.lastCast), 30000);
      debug && console.log(`Total uptime: ${this.totalUptime}`);
    }

    // Check if the player had a pre-casted efflorescence
    // If the last cast is bigger than the firstEffloTick it means we precast efflorescence.
    if (this.firstEffloTickTimestamp !== null && event.timestamp > this.firstEffloTickTimestamp) {
      const firstTick = event.timestamp - this.firstEffloTickTimestamp;
      debug && console.log(`The player had a precasted efflo which gained him ${firstTick}`);
      this.totalUptime += Math.min(firstTick, 30000);
    }
    this.lastCast = event.timestamp;

    // First tick has been depleted
    this.firstEffloTickTimestamp = this.owner.fight.end_time;

    debug && console.log(`Uptime: ${this.totalUptime}`);
    this.counter += 1;
  }

  // Incase the player pre-cast efflorescence before the encounter, we need
  // to take that into consideration by saving the first efflorescence heal tick.
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (SPELLS.EFFLORESCENCE_HEAL.id !== spellId) {
      return;
    }
    if (this.firstEffloTickTimestamp === null) {
      this.firstEffloTickTimestamp = event.timestamp;
    }
  }

  on_finished() {
    // We need to take the last cast into consideration as well.
    const lastTick = this.owner.fight.end_time - this.lastCast;
    this.totalUptime += Math.min(lastTick, 30000);
    debug && console.log(`Last tick: ${lastTick}`);
    debug && console.log(`Total uptime: ${this.totalUptime}`);
  }

  suggestions(when) {
    const uptimePercent = this.totalUptime / this.owner.fightDuration;

    when(uptimePercent).isLessThan(SuggestionThresholds.EFFLORESCENCE_UPTIME.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> uptime can be improved.</span>)
          .icon(SPELLS.EFFLORESCENCE_CAST.icon)
          .actual(`${formatPercentage(uptimePercent)}% uptime`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(SuggestionThresholds.EFFLORESCENCE_UPTIME.regular).major(SuggestionThresholds.EFFLORESCENCE_UPTIME.major);
      });
  }

  statistic() {
    const uptimePercent = this.totalUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EFFLORESCENCE_CAST.id} />}
        value={`${formatPercentage(uptimePercent)} %`}
        label="Efflorescence Uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(12);

}

export default Efflorescence;
