import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { getName } from 'parser/core/modules/features/STAT';

export const azeriteStats = (traits, traitId) => Object.values(traits).reduce((obj, rank) => {
  const [stat] = calculateAzeriteEffects(traitId, rank);
  obj.stat += stat;
  return obj;
}, {
  stat: 0,
});

class GenericStatProc extends Analyzer {
  procs = 0;
  procValue = 0;
  statId = null;
  traitId = null;
  buffId = null;

  constructor(traitId, buffId, statId, ...args) {
    super(...args);

    this.traitId = traitId;
    this.buffId = buffId;
    this.statId = statId;

    if (this.traitId == null || this.buffId == null || this.statId == null) {
      this.active = false;
      return;
    }

    this.active = this.selectedCombatant.hasTrait(this.traitId);
    if (!this.active) {
      return;
    }

    this.procValue = azeriteStats(this.selectedCombatant.traitsBySpellId[this.traitId], this.traitId).stat;
  }

  on_byPlayer_applybuff(event) {
    this.handleBuff(event);
  }

  on_byPlayer_refreshbuff(event) {
    this.handleBuff(event);
  }

  handleBuff(event) {
    if (event.ability.guid !== this.buffId) {
      return;
    }

    this.procs += 1;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(this.buffId) / this.owner.fightDuration;
  }

  get averageStat() {
    return (this.procValue * this.uptime).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={this.traitId}
        value={`${this.averageStat} average ${getName(this.statId)}`}
        tooltip={`
          ${SPELLS[this.traitId].name} grants <b>${this.procValue} ${getName(this.statId)}</b> while active.<br/>
          You had <b>${this.procs} ${SPELLS[this.traitId].name} procs</b> resulting in ${formatPercentage(this.uptime)}% uptime.
        `}
      />
    );
  }
}

export default GenericStatProc;
