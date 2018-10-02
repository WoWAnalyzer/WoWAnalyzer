import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

const synergisticGrowthStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [mastery] = calculateAzeriteEffects(SPELLS.SYNERGISTIC_GROWTH.id, rank);
  obj.mastery += mastery;
  return obj;
}, {
  mastery: 0,
});

export const STAT_TRACKER = {
  mastery: combatant => synergisticGrowthStats(combatant.traitsBySpellId[SPELLS.SYNERGISTIC_GROWTH.id]).mastery,
};

/**
 * Synergistic Growth
 * Gain x mastery while active
 *
 * Example report: /report/4qXRxW1fYLPaJgMA/7-Mythic+Zul+-+Wipe+1+(1:25)/8-Monkacarl
 */
class SynergisticGrowth extends Analyzer {
  mastery = 0;
  procs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SYNERGISTIC_GROWTH.id);
    if (!this.active) {
      return;
    }

    const { mastery } = synergisticGrowthStats(this.selectedCombatant.traitsBySpellId[SPELLS.SYNERGISTIC_GROWTH.id]);
    this.mastery = mastery;
  }

  on_byPlayer_applybuff(event) {
    this.handleBuff(event);
  }

  on_byPlayer_refreshbuff(event) {
    this.handleBuff(event);
  }

  handleBuff(event) {
    if (event.ability.guid !== SPELLS.SYNERGISTIC_GROWTH_BUFF.id) {
      return;
    }

    this.procs += 1;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SYNERGISTIC_GROWTH_BUFF.id) / this.owner.fightDuration;
  }

  get averageMastery() {
    return (this.mastery * this.uptime).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.SYNERGISTIC_GROWTH.id}
        value={`${this.averageMastery} average Mastery`}
        tooltip={`
          ${SPELLS.SYNERGISTIC_GROWTH.name} grants <b>${this.mastery} mastery</b> while active.<br/>
          You had <b>${this.procs} ${SPELLS.SYNERGISTIC_GROWTH.name} procs</b> resulting in ${formatPercentage(this.uptime)}% uptime.
        `}
      />
    );
  }
}

export default SynergisticGrowth;
