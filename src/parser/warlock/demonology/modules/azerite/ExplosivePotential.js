import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatPercentage } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';

const explosivePotentialStats = traits => traits.reduce((total, rank) => {
  const [ haste ] = calculateAzeriteEffects(SPELLS.EXPLOSIVE_POTENTIAL.id, rank);
  return total + haste;
}, 0);

export const STAT_TRACKER = {
  haste: combatant => explosivePotentialStats(combatant.traitsBySpellId[SPELLS.EXPLOSIVE_POTENTIAL.id]),
};

const debug = false;

/*
  Explosive Potential:
    When your Implosion consumes 3 or more Imps, gain X Haste for 15 sec.
 */
class ExplosivePotential extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  haste = 0;
  procs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.EXPLOSIVE_POTENTIAL.id);
    if (!this.active) {
      return;
    }
    this.haste = explosivePotentialStats(this.selectedCombatant.traitsBySpellId[SPELLS.EXPLOSIVE_POTENTIAL.id]);
    debug && this.log(`Total bonus from EP: ${this.haste}`);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EXPLOSIVE_POTENTIAL_BUFF), this.countProc);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.EXPLOSIVE_POTENTIAL_BUFF), this.countProc);
  }

  countProc() {
    this.procs += 1;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.EXPLOSIVE_POTENTIAL_BUFF.id) / this.owner.fightDuration;
  }

  get averageHaste() {
    return (this.uptime * this.haste).toFixed(0);
  }

  statistic() {
    const implosion = this.abilityTracker.getAbility(SPELLS.IMPLOSION_CAST.id);
    const casts = (implosion && implosion.casts) || 0;
    return (
      <TraitStatisticBox
        trait={SPELLS.EXPLOSIVE_POTENTIAL.id}
        value={`${this.averageHaste} average Haste`}
        tooltip={`Explosive Potential grants ${this.haste} Haste while active. You had ${formatPercentage(this.uptime)} % uptime on the buff.<br />
                You procced the buff ${this.procs} out of ${casts} times.`}
      />
    );
  }
}

export default ExplosivePotential;
