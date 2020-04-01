import React from 'react';

import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import { calculateAzeriteEffects } from 'common/stats';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import HasteIcon from 'interface/icons/Haste';


const mistyPeaksStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.MISTY_PEAKS.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

/**
 * Misty Peaks
 * When your Renewing Mists heals an ally, you have a chance to gain X Haste for 10 sec.
 */

class MistyPeaks extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  haste = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.MISTY_PEAKS.id);
    if (!this.active) {
      return;
    }

    const { haste } = mistyPeaksStats(this.selectedCombatant.traitsBySpellId[SPELLS.MISTY_PEAKS.id]);
    this.haste = haste;

    this.statTracker.add(SPELLS.MISTY_PEAKS.id, {
      haste,
    });
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.MISTY_PEAKS_BUFF.id) / this.owner.fightDuration;
  }

  get averageHaste() {
    return (this.haste * this.uptime).toFixed(0);
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <>
            <b>{this.haste}</b> haste per proc at {formatPercentage(this.uptime)}% uptime.
          </>
        )}
      >
        <div className="pad">
        <label><SpellLink id={SPELLS.MISTY_PEAKS.id} /></label>
        <div className="value">
          <HasteIcon /> {this.averageHaste} <small>average Haste gained</small>
        </div>
      </div>
    </AzeritePowerStatistic>
    );
  }
}

export default MistyPeaks;
