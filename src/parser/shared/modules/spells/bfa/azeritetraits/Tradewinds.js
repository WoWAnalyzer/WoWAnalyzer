import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

/**
 * Your spells and abilities have a chance to grant you 583 Mastery for 15 sec. 
 * When this effect expires it jumps once to a nearby ally, granting them 115 Mastery for 8 sec.
 */
class Tradewinds extends Analyzer {
  proccedBuffs = 0;
  refreshedBuffs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.TRADEWINDS.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.TRADEWINDS.id) {
      return;
    }

    this.proccedBuffs++;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.TRADEWINDS.id) {
      return;
    }

    this.refreshedBuffs++;
  }
  get totalBuffs() {
    return this.proccedBuffs + this.refreshedBuffs;
  }

  get procsPerMinute() {
    return this.totalBuffs / (this.owner.fightDuration / 60000);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.TRADEWINDS.id}
        value={`${this.procsPerMinute.toFixed(2)} procs per minute`}
        tooltip={`Procced <b>${formatNumber(this.totalBuffs)}</b> times,
                  <b>${formatNumber(this.refreshedBuffs)}</b> were refreshes.
                `}
      />
    );
  }
}

export default Tradewinds;
