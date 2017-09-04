import React from 'react';

import { formatThousands, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';

import CoreHealingDone from 'Parser/Core/Modules/HealingDone';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class HealingDone extends CoreHealingDone {
  on_toPlayer_absorbed(event) {
    // This is the same correction as damage taken for Brewmaster monks
    // When stagger removes damage from an attack it is not a true heal but just delays the damage to be taken by a dot
    // this needs to be subtrached from the damage taken but also the healing done.

    const spellId = event.ability.guid;
    if (spellId === SPELLS.STAGGER.id) {
      this._subtractHealing(event.timestamp, 0, event.amount, 0);
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
        value={`${formatNumber(this.total.effective / this.owner.fightDuration * 1000)} HPS`}
        label="Healing done"
        tooltip={`The total healing done was ${formatThousands(this.total.effective)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default HealingDone;
