import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';

/* Add in Statistic box to show average time between RSK casts when Rising Mist is talented.
*/

class TimeBetweenRSKs extends Analyzer {

  totalRSKCasts = 0;
  firstRSKTimestamp = 0;
  lastRSKTimestamp = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RISING_MIST_TALENT.id);
    if(!this.active){
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RISING_SUN_KICK), this.onRSK);
  }

  onRSK(event) {
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
      <TalentStatisticBox
        position={STATISTIC_ORDER.CORE(15)}
        icon={<><SpellIcon id={SPELLS.RISING_SUN_KICK.id} /></>}
        value={this.averageTimeBetweenRSKSeconds}
        label="Average time between Rising Sun Kick casts"
      />
    );
  }
}

export default TimeBetweenRSKs;
