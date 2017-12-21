import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

class BoWProcTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  overwrittenBoWProcs = 0;
  totalBoWProcs = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.BLADE_OF_WRATH_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLADE_OF_WRATH_PROC.id) {
      return;
    }
    this.totalBoWProcs += 1;
    if (this.spellUsable.isOnCooldown(SPELLS.BLADE_OF_JUSTICE.id)) {
      this.spellUsable.endCooldown(SPELLS.BLADE_OF_JUSTICE.id);
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLADE_OF_WRATH_PROC.id) {
      return;
    }
    this.overwrittenBoWProcs += 1;
    this.totalBoWProcs += 1;
  }

  suggestions(when) {
    const missedProcsPercent = this.overwrittenBoWProcs / this.totalBoWProcs;
    when(missedProcsPercent).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You wasted {formatPercentage(missedProcsPercent)}% <SpellLink id={SPELLS.BLADE_OF_WRATH_PROC.id} /> procs</span>)
          .icon(SPELLS.BLADE_OF_WRATH_PROC.icon)
          .actual(`${formatNumber(this.overwrittenBoWProcs)} missed proc(s)`)
          .recommended(`Wasting none is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.1);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BLADE_OF_WRATH_PROC.id} />}
        value={`${formatNumber(this.totalBoWProcs)}`}
        label="Blade of Wrath procs"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default BoWProcTracker;
