import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

class AoWProcTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  overwrittenAoWProcs = 0;
  totalAoWProcs = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLADE_OF_WRATH_PROC.id) {
      return;
    }
    this.totalAoWProcs += 1;
    if (this.spellUsable.isOnCooldown(SPELLS.BLADE_OF_JUSTICE.id)) {
      this.spellUsable.endCooldown(SPELLS.BLADE_OF_JUSTICE.id);
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLADE_OF_WRATH_PROC.id) {
      return;
    }
    this.overwrittenAoWProcs += 1;
    this.totalAoWProcs += 1;
  }

  get missedProcsPercent() {
    return this.overwrittenAoWProcs / this.totalAoWProcs;
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.missedProcsPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>You wasted {formatNumber(this.overwrittenAoWProcs)} <SpellLink id={SPELLS.ART_OF_WAR.id} icon /> proc(s)</React.Fragment>)
        .icon(SPELLS.ART_OF_WAR.icon)
        .actual(`${formatPercentage(this.missedProcsPercent)}% proc(s) missed`)
        .recommended(`Wasting <${formatPercentage(1 - recommended)}% is recommended.`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ART_OF_WAR.id} />}
        value={`${formatNumber(this.totalAoWProcs)}`}
        label="Blade of Wrath procs"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default AoWProcTracker;
