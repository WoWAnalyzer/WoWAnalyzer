import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatPercentage } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';

const supremeCommanderStats = traits => traits.reduce((total, rank) => {
  const [ intellect ] = calculateAzeriteEffects(SPELLS.SUPREME_COMMANDER.id, rank);
  return total + intellect;
}, 0);

export const STAT_TRACKER = {
  intellect: combatant => supremeCommanderStats(combatant.traitsBySpellId[SPELLS.SUPREME_COMMANDER.id]),
};

const debug = false;

/*
  Supreme Commander:
    When your Demonic Tyrant expires, consume its life essence, granting you a stack of Demonic Core and increasing your Intellect by X for 15 sec.
 */
class SupremeCommander extends Analyzer {
  intellect = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SUPREME_COMMANDER.id);
    if (!this.active) {
      return;
    }
    this.intellect = supremeCommanderStats(this.selectedCombatant.traitsBySpellId[SPELLS.SUPREME_COMMANDER.id]);
    debug && this.log(`Total bonus from SC: ${this.intellect}`);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SUPREME_COMMANDER_BUFF.id) / this.owner.fightDuration;
  }

  get averageIntellect() {
    return (this.uptime * this.intellect).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.SUPREME_COMMANDER.id}
        value={`${this.averageIntellect} average Intellect`}
        tooltip={`Supreme Commander grants ${this.intellect} Intellect while active. You had ${formatPercentage(this.uptime)} % uptime on the buff.`}
      />
    );
  }
}

export default SupremeCommander;
