import React from 'react';
import { formatThousands, formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class HealingReceived extends Analyzer {
  HealingReceivedExternal = 0;
  HealingReceivedSelf = 0;
  constructor(...args) {
    super(...args);
    // Disabling this module i don't think its right and it might add confusion.
    this.active = false;
  }

  on_toPlayer_heal(event) {
    if (event.sourceID === this.owner.playerId) {
      this.HealingReceivedSelf += event.amount;
    } else {
      this.HealingReceivedExternal += event.amount;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={(
          <img
            src="/img/healing.png"
            style={{ border: 0 }}
            alt="Healing"
          />
        )}
        value={`${formatNumber((this.HealingReceivedExternal) / this.owner.fightDuration * 1000)} HPS`}
        label="External healing received"
        tooltip={`Healing received:
        <ul>
          <li>From self: ${formatThousands(this.HealingReceivedSelf)}</li>
          <li>From external sources: ${formatThousands(this.HealingReceivedExternal)}</li>
        </ul>
        The total healing received was ${formatThousands(this.HealingReceivedSelf + this.HealingReceivedExternal)}`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default HealingReceived;
