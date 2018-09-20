import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import RelentlessInquisitorStackHandler from './RelentlessInquisitorStackHandler';

const relentlessInquisitorStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.RELENTLESS_INQUISITOR.id, rank);
  obj.haste += haste;
  return obj;
}, {
    haste: 0,
  });

export const STAT_TRACKER = {
  haste: combatant => relentlessInquisitorStats(combatant.traitsBySpellId[SPELLS.RELENTLESS_INQUISITOR.id]).haste,
};

/**
 * Spending Holy Power grants you 9 haste for 12 sec per Holy Power spent, stacking up to 20 times. 
 *
 * */
class RelentlessInquisitor extends Analyzer {
  static dependencies = {
    relentlessInquisitorStackHandler: RelentlessInquisitorStackHandler,
  };
  hasteBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.RELENTLESS_INQUISITOR.id);

    if (this.active) {
      const { haste } = relentlessInquisitorStats(this.selectedCombatant.traitsBySpellId[SPELLS.RELENTLESS_INQUISITOR.id]);
      this.hasteBuff = haste;
    }
  }
  get averageStacks() {
    return this.relentlessInquisitorStackHandler.averageStacks;
  }

  get averageStatGain() {
    return this.averageStacks * this.hasteBuff;
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RELENTLESS_INQUISITOR_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.RELENTLESS_INQUISITOR.id}
        value={(
          <React.Fragment>
            {formatPercentage(this.totalBuffUptime)}% uptime.<br />
            {formatNumber(this.averageStatGain)} average Haste.
          </React.Fragment>
        )}
        tooltip={``}
      />
    );
  }
}

export default RelentlessInquisitor;
