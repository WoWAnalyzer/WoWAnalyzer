import React from 'react';
import StatisticBox from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

const MS_BUFFER=200;
const ABUNDANCE_MANA_REDUCTION = 0.06;
const ABUNDANCE_INCREASED_CRIT = 0.06;


/*
  For each Rejuvenation you have active, Regrowth's cost is reduced by 6% and critical effect chance is increased by 6%.
 */
class Abundance extends Analyzer {
  manaSavings = [];
  critGains = [];
  stacks = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ABUNDANCE_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onCast);
  }


  onCast(event) {
    const abundanceBuff = this.selectedCombatant.getBuff(SPELLS.ABUNDANCE_BUFF.id, event.timestamp, MS_BUFFER);
    if(abundanceBuff == null) {
      return;
    }

    if (!this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id) && !this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      this.manaSavings.push(abundanceBuff.stacks * ABUNDANCE_MANA_REDUCTION > 1 ? 1 : abundanceBuff.stacks * ABUNDANCE_MANA_REDUCTION);
      this.manaCasts += 1;
    }

    this.critGains.push((abundanceBuff.stacks * ABUNDANCE_INCREASED_CRIT) > 1 ? 1 : abundanceBuff.stacks * ABUNDANCE_INCREASED_CRIT);
    this.stacks.push(abundanceBuff.stacks);
  }

  statistic() {
    const avgManaSavingsPercent = (this.manaSavings.reduce(function(a, b) { return a + b; }, 0) / this.manaSavings.length) || 0;
    const avgCritGains = (this.critGains.reduce(function(a, b) { return a + b; }, 0) / this.critGains.length) || 0;
    const avgStacks = (this.stacks.reduce(function(a, b) { return a + b; }, 0) / this.stacks.length) || 0;
    const avgManaSaings = SPELLS.REGROWTH.manaCost * avgManaSavingsPercent;

    // TODO translate these values into healing/throughput.
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ABUNDANCE_TALENT.id} />}
        value={`${avgStacks.toFixed(2)}  Avg. stacks`}
        label="Abundance"
        tooltip={(
          <>
            Average mana reductions gained was {formatPercentage(avgManaSavingsPercent)}% or {formatNumber(avgManaSaings)} mana per cast.<br />
            Maximum mana saved was {avgManaSaings * this.manaSavings.length} <br />
            Average crit gain was {formatPercentage(avgCritGains)}%.
          </>
        )}
      />
    );
  }
}

export default Abundance;
