import React from 'react';

import Icon from 'common/Icon';
import { formatMilliseconds, formatNumber, formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

class CancelledCasts extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  castsStarted = 0;
  castsFinished = 0;
  beginCastTimestamp = 0;
  castTimestamp = 0;

  static CANCELABLE_ABILITIES = [
  ];

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (!this.constructor.CANCELABLE_ABILITIES.includes(spellId)) {
      return;
    }
    this.beginCastTimestamp = event.timestamp;
    this.castsStarted += 1;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const castTimestamp = event.timestamp;
    const castTime = castTimestamp - this.beginCastTimestamp;
    if (!this.constructor.CANCELABLE_ABILITIES.includes(spellId)) {
      return;
    }
    if (castTime < 100) {
      this.castsStarted -= 1;
    } else {
      this.castsFinished += 1;
    }
  }

  get cancelledCasts() {
    return this.castsStarted - this.castsFinished;
  }

  on_finished() {
    debug && console.log(formatMilliseconds(this.owner.fightDuration), 'Casts Started:', `${formatNumber(this.castsStarted)}`);
    debug && console.log(formatMilliseconds(this.owner.fightDuration), 'Casts Completed:', `${formatNumber(this.castsFinished)}`);
  }

  statistic() {
    const cancelledPercentage = this.cancelledCasts / this.castsStarted;

    return (
      <StatisticBox
        icon={<Icon icon="inv_misc_map_01" alt="Cancelled Casts" />}
        value={`${formatPercentage(cancelledPercentage)} %`}
        label="Casts Cancelled"
        tooltip={`You cast ${this.castsStarted} spells.
          <ul>
            <li>${this.castsFinished} casts were completed</li>
            <li>${this.cancelledCasts} casts were cancelled</li>
          </ul>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default CancelledCasts;
