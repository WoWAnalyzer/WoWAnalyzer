import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText'
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events, { CastEvent } from 'parser/core/Events';

/*
 * Add in Statistic box to show average time between RSK casts when Rising Mist is talented.
 */
class TimeBetweenRSKs extends Analyzer {

  totalRSKCasts: number = 0;
  firstRSKTimestamp: number = 0;
  lastRSKTimestamp: number = 0;

  constructor(options: Options){
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RISING_MIST_TALENT.id);
    if(!this.active){
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RISING_SUN_KICK), this.onRSK);
  }

  onRSK(event: CastEvent) {
    if (this.totalRSKCasts === 0) {
      this.firstRSKTimestamp = event.timestamp;
    } else {
      this.lastRSKTimestamp = event.timestamp;
    }
    this.totalRSKCasts += 1;
  }

  get rskWindow () {
    return this.lastRSKTimestamp - this.firstRSKTimestamp;
  }

  get averageTimeBetweenRSKSeconds () {
    if (this.totalRSKCasts === 0) {
      return 'Rising Sun Kick was not cast';
    } else if (this.totalRSKCasts === 1) {
      return 'Rising Sun Kick was only cast once';
    } else {
      return ((this.rskWindow/1000)/(this.totalRSKCasts-1)).toFixed(2) + `s`;
    }
  }

  statistic() {

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
      <BoringValueText label={<><SpellIcon id={SPELLS.RISING_SUN_KICK.id} /> Average Time Between Rising Sun Kick casts</>}>
          <>
            {this.averageTimeBetweenRSKSeconds} <small>Average Time Between</small>
          </>
        </BoringValueText>
      </Statistic>

    );
  }
}

export default TimeBetweenRSKs;
