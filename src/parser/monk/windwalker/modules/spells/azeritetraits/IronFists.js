import React from 'react';
import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

const ironFistsStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [crit] = calculateAzeriteEffects(SPELLS.IRON_FISTS.id, rank);
  obj.crit += crit;
  return obj;
}, {
    crit: 0,
  });

export const STAT_TRACKER = {
  crit: combatant => ironFistsStats(combatant.traitsBySpellId[SPELLS.IRON_FISTS.id]),
};

/**
 * Fists of Fury grants you 547 critical strike for 10 sec when it hits at least 4 enemies
 *
 * */
class IronFists extends Analyzer {
  critBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.IRON_FISTS.id);

    if (!this.active) {
      return;
    }
    const { crit } = ironFistsStats(this.selectedCombatant.traitsBySpellId[SPELLS.IRON_FISTS.id]);
    this.critBuff = crit;
  }

  get buffTriggerCount() {
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.IRON_FISTS_BUFF.id);
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.IRON_FISTS_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    const averageCrit = this.totalBuffUptime * this.critBuff;
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.IRON_FISTS.id}
        value={(
          <>
            {formatPercentage(this.totalBuffUptime)}% Uptime<br />
            {formatNumber(averageCrit)} Average Crit
          </>
        )}
        tooltip={`You hit 4 or more enemies with your Fists of Fury ${this.buffTriggerCount} times`}
       />
    );
  }
}

export default IronFists;
