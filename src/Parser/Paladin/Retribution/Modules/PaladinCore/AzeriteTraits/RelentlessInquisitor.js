import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

const relentlessInquisitorStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.RELENTLESS_INQUISITOR.id, rank);
  obj.haste += haste;
  return obj;
}, {
    haste: 0,
  });

export const STAT_TRACKER = {
  haste: combatant => relentlessInquisitorStats(combatant.traitsBySpellId[SPELLS.RELENTLESS_INQUISITOR.id]),
};

/**
 * Spending Holy Power grants you 9 haste for 12 sec per Holy Power spent, stacking up to 20 times. 
 *
 * */
class RelentlessInquisitor extends Analyzer {
  hasteBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.RELENTLESS_INQUISITOR.id);

    if (this.active) {
      const { haste } = relentlessInquisitorStats(this.selectedCombatant.traitsBySpellId[SPELLS.RELENTLESS_INQUISITOR.id]);
      this.hasteBuff = haste;
    }
  }

  averageStatGain() {
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.RELENTLESS_INQUISITOR_BUFF.id) / this.owner.fightDuration;
    return averageStacks * this.hasteBuff;
  }

  totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RELENTLESS_INQUISITOR_BUFF.id) / this.owner.fightDuration;
  }

  buffTriggerCount() {
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.RELENTLESS_INQUISITOR_BUFF.id);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.RELENTLESS_INQUISITOR.id}
        value={(
          <React.Fragment>
            {formatPercentage(this.totalBuffUptime())}% uptime.<br />
            {formatNumber(this.averageStatGain())} average Haste.
          </React.Fragment>
        )}
        tooltip={``}
      />
    );
  }
}

export default RelentlessInquisitor;
