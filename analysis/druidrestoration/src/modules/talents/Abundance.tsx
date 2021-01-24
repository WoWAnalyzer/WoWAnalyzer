import React from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { SpellIcon } from 'interface';
import BoringValue from 'parser/ui/BoringValueText';

const MS_BUFFER = 200;
const ABUNDANCE_MANA_REDUCTION = 0.06;
const ABUNDANCE_INCREASED_CRIT = 0.06;

/*
  For each Rejuvenation you have active, Regrowth's cost is reduced by 6% and critical effect chance is increased by 6%.
 */
class Abundance extends Analyzer {
  manaSavings: number[] = [];
  critGains: number[] = [];
  stacks: number[] = [];
  manaCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ABUNDANCE_TALENT.id);
    if(!this.active){
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onCast);
  }

  onCast(event: CastEvent) {
    const abundanceBuff = this.selectedCombatant.getBuff(SPELLS.ABUNDANCE_BUFF.id, event.timestamp, MS_BUFFER);
    if (abundanceBuff == null) {
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
    const avgManaSavingsPercent = (this.manaSavings.reduce(function(a, b) {
      return a + b;
    }, 0) / this.manaSavings.length) || 0;
    const avgCritGains = (this.critGains.reduce(function(a, b) {
      return a + b;
    }, 0) / this.critGains.length) || 0;
    const avgStacks = (this.stacks.reduce(function(a, b) {
      return a + b;
    }, 0) / this.stacks.length) || 0;
    const avgManaSaings = SPELLS.REGROWTH.manaCost * avgManaSavingsPercent;

    // TODO translate these values into healing/throughput.
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(20)}
        size="flexible"
        tooltip={(
          <>
            Average mana reductions gained was {formatPercentage(avgManaSavingsPercent)}% or {formatNumber(avgManaSaings)} mana per cast.<br />
            Total mana saved was {(avgManaSaings * this.manaSavings.length).toFixed(0)} <br />
            Average crit gain was {formatPercentage(avgCritGains)}%.
          </>
        )}
      >
        <BoringValue label={<><SpellIcon id={SPELLS.ABUNDANCE_TALENT.id} /> Average Abundance stacks</>}>
          <>
            {avgStacks.toFixed(2)}
          </>
        </BoringValue>
      </Statistic>
    );
  }
}

export default Abundance;
