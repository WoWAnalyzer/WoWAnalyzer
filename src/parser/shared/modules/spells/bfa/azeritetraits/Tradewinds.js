import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

const tradewindsStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [mastery] = calculateAzeriteEffects(SPELLS.TRADEWINDS.id, rank);
  obj.mastery += mastery;
  return obj;
}, {
  mastery: 0,
});

export const STAT_TRACKER = {
  mastery: combatant => {
    return tradewindsStats(combatant.traitsBySpellId[SPELLS.TRADEWINDS.id]).mastery;
  },
};

/**
 * Your spells and abilities have a chance to grant you 583 Mastery for 15 sec. 
 * When this effect expires it jumps once to a nearby ally, granting them 115 Mastery for 8 sec.
 */
class Tradewinds extends Analyzer {
  mastery = 0;
  procs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.TRADEWINDS.id);

    if (!this.active) {
      return;
    }

    const { mastery } = tradewindsStats(this.selectedCombatant.traitsBySpellId[SPELLS.TRADEWINDS.id]);
    this.mastery = mastery;
  }

  on_byPlayer_applybuff(event) {
    this.handleBuff(event);
  }

  on_byPlayer_refreshbuff(event) {
    this.handleBuff(event);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.TRADEWINDS.id) / this.owner.fightDuration;
  }

  get averageMastery() {
    return (this.mastery * this.uptime).toFixed(0);
  }

  handleBuff(event) {
    if (event.ability.guid !== SPELLS.TRADEWINDS.id) {
      return;
    }

    if (event.type === "applybuff" || event.type === "refreshbuff") {
      this.procs++;
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.TRADEWINDS.id}
        value={`${this.averageMastery} average Mastery`}
        tooltip={`
        ${SPELLS.TRADEWINDS.name} grants <b>${this.mastery} mastery</b> while active.<br/>
        You had <b>${this.procs} ${SPELLS.TRADEWINDS.name} procs</b> resulting in ${formatPercentage(this.uptime)}% uptime.
        `}
      />
    );
  }
}

export default Tradewinds;
