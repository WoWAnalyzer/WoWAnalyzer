import React from 'react';

import Wrapper from 'common/Wrapper';
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

  get missedProcsPercent() {
    return this.overwrittenBoWProcs / this.totalBoWProcs;
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
      return suggest(<Wrapper>You wasted {formatNumber(this.overwrittenBoWProcs)} <SpellLink id={SPELLS.BLADE_OF_WRATH_PROC.id} icon/> proc(s)</Wrapper>)
        .icon(SPELLS.BLADE_OF_WRATH_PROC.icon)
        .actual(`${formatPercentage(this.missedProcsPercent)}% proc(s) missed`)
        .recommended(`Wasting <${formatPercentage(1 - recommended)}% is recommended.`);
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
