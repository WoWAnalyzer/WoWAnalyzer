import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

const blightborneInfusionStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [crit] = calculateAzeriteEffects(SPELLS.BLIGHTBORNE_INFUSION.id, rank);
  obj.crit += crit;
  return obj;
}, {
  crit: 0,
});

export const STAT_TRACKER = {
  crit: combatant => blightborneInfusionStats(combatant.traitsBySpellId[SPELLS.BLIGHTBORNE_INFUSION.id]).crit,
};

/**
 * Blightborne Infusion:
 * Your spells and abilities have a chance to draw a Wandering Soul from Thros to serve you for 14 sec.
 * The Soul increases your Critical Strike by 768.
 */
class BlightborneInfusion extends Analyzer {
  crit = 0;
  blightborneInfusionProcs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BLIGHTBORNE_INFUSION.id);
    if (!this.active) {
      return;
    }

    const { crit } = blightborneInfusionStats(this.selectedCombatant.traitsBySpellId[SPELLS.BLIGHTBORNE_INFUSION.id]);
    this.crit = crit;
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.BLIGHTBORNE_INFUSION_BUFF.id) {
      return;
    }
    this.blightborneInfusionProcs += 1;
  }

  on_byPlayer_refreshbuff(event) {
    if (event.ability.guid !== SPELLS.BLIGHTBORNE_INFUSION_BUFF.id) {
      return;
    }
    this.blightborneInfusionProcs += 1;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BLIGHTBORNE_INFUSION_BUFF.id) / this.owner.fightDuration;
  }

  get averageCrit() {
    return (this.crit * this.uptime).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.BLIGHTBORNE_INFUSION.id}
        value={`${this.averageCrit} average crit`}
        tooltip={`
          ${SPELLS.BLIGHTBORNE_INFUSION.name} grants <b>${this.crit} crit</b> while active.<br/>
          You procced <b>${SPELLS.BLIGHTBORNE_INFUSION.name} ${this.blightborneInfusionProcs} times</b> with an uptime of ${formatPercentage(this.uptime)}%.
        `}
      />
    );
  }
}

export default BlightborneInfusion;
