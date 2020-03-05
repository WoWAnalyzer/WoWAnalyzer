import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';

/* Add in Statistic box to show average time between RSK casts when Rising Mist is talented.
*/

class TimeBetweenRSKs extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  totalRSKCasts = 0;
  rskEvents = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RISING_MIST_TALENT.id);
    if(!this.active){
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RISING_SUN_KICK), this.onRSK);
  }

  onRSK(event) {
    const spellId = event.ability.guid;
    if (SPELLS.RISING_SUN_KICK.id !== spellId) {
      return;
    }
    this.totalRSKCasts += 1;
    this.rskEvents.push(event.timestamp);
  }

  get lastRSKTimestamp() {
    return this.rskEvents[this.totalRSKCasts-1];
  }

  get rskWindow () {
    return this.lastRSKTimestamp - this.owner.fight.start_time;
  }

  statistic() {

    return (
      <TalentStatisticBox
        position={STATISTIC_ORDER.CORE(10)}
        icon={<><SpellIcon id={SPELLS.RISING_SUN_KICK.id} /></>}
        value={((this.rskWindow/1000)/this.totalRSKCasts).toFixed(2) + `s`}
        label="Average time between Rising Sun Kick casts"
      />
    );
  }
}

export default TimeBetweenRSKs;
