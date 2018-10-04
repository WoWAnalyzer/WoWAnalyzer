import React from 'react';
import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
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

  get suggestionThresholds() {
    return {
      actual: this.averageStacks,
      isLessThan: {
        minor: 16,
        average: 14,
        major: 12,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>You had a low average of <SpellLink id={SPELLS.RELENTLESS_INQUISITOR.id} /> stacks. You can use spells like <SpellLink id={SPELLS.DIVINE_STORM.id} /> or <SpellLink id={SPELLS.INQUISITION_TALENT.id} /> while out of range to refresh the buff, or consider using another trait if you're dropping the buff often because of fight mechanics</React.Fragment>)
        .icon(SPELLS.RELENTLESS_INQUISITOR.icon)
        .actual(`${formatNumber(actual)} average stacks`)
        .recommended(`as close to 20 as possible is recommended`);
    });
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
        tooltip={`You had an average of ${formatNumber(this.averageStacks)} stacks throughout the fight`}
      />
    );
  }
}

export default RelentlessInquisitor;
