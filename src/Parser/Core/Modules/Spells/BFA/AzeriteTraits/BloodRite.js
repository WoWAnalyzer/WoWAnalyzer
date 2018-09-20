import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'Parser/Core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

const bloodRiteStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.BLOOD_RITE.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

export const STAT_TRACKER = {
  haste: combatant => bloodRiteStats(combatant.traitsBySpellId[SPELLS.BLOOD_RITE.id]).haste,
};

/**
 * Blood Rite
 * Gain x haste while active
 *
 * Example report: https://www.warcraftlogs.com/reports/k4bAJZKWVaGt12j9#fight=3&type=auras&source=14
 */
class BloodRite extends Analyzer {
  haste = 0;
  bloodRiteProcs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BLOOD_RITE.id);
    if (!this.active) {
      return;
    }

    const { haste } = bloodRiteStats(this.selectedCombatant.traitsBySpellId[SPELLS.BLOOD_RITE.id]);
    this.haste = haste;
  }

  on_byPlayer_applybuff(event) {
    this.handleBuff(event);
  }

  on_byPlayer_refreshbuff(event) {
    this.handleBuff(event);
  }

  handleBuff(event) {
    if (event.ability.guid !== SPELLS.BLOOD_RITE_BUFF.id) {
      return;
    }

    this.bloodRiteProcs += 1;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BLOOD_RITE_BUFF.id) / this.owner.fightDuration;
  }

  get averageHaste() {
    return (this.haste * this.uptime).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.BLOOD_RITE.id}
        value={`${this.averageHaste} average Haste`}
        tooltip={`
          ${SPELLS.BLOOD_RITE.name} grants <b>${this.haste} haste</b> while active.<br/>
          You had <b>${this.bloodRiteProcs} ${SPELLS.BLOOD_RITE.name} procs</b> resulting in ${formatPercentage(this.uptime)}% uptime.
        `}
      />
    );
  }
}

export default BloodRite;
