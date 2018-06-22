import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const ART_OF_WAR_DURATION = 10000;

class AoWProcTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  consumedAoWProcs = 0;
  wastedAoWProcs = 0;
  totalAoWProcs = 0;
  lastAoWProcTime = null;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLADE_OF_WRATH_PROC.id) {
      return;
    }
    this.totalAoWProcs += 1;
    if (this.spellUsable.isOnCooldown(SPELLS.BLADE_OF_JUSTICE.id)) {
      this.spellUsable.endCooldown(SPELLS.BLADE_OF_JUSTICE.id);
      this.lastAoWProcTime = event.timestamp;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLADE_OF_WRATH_PROC.id) {
      return;
    }
    this.wastedAoWProcs += 1;
    this.totalAoWProcs += 1;
  }

  get consumedProcsPercent() {
    return this.consumedAoWProcs / this.totalAoWProcs;
  }

  get suggestionThresholds() {
    return {
      actual: this.consumedProcsPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.BLADE_OF_JUSTICE.id !== spellId) {
      return;
    }
    if (this.lastAoWProcTime !== event.timestamp) {
      if (this.lastAoWProcTime === null) {
        return;
      }
      const AoWTimeframe = this.lastAoWProcTime + ART_OF_WAR_DURATION;
      if (event.timestamp <= AoWTimeframe) {
        this.consumedAoWProcs += 1;
        this.lastAoWProcTime = null;
      }
    }
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>You used {formatPercentage(this.consumedProcsPercent)}% of your <SpellLink id={SPELLS.ART_OF_WAR.id} icon /> procs</React.Fragment>)
        .icon(SPELLS.ART_OF_WAR.icon)
        .actual(`${formatPercentage(this.consumedProcsPercent)}% proc(s) used`)
        .recommended(`Using >${formatPercentage(recommended)}% is recommended.`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ART_OF_WAR.id} />}
        value={`${formatPercentage(this.consumedProcsPercent)}%`}
        label="Art of War procs used"
        tooltip={`You got ${this.totalAoWProcs} Art of War procs and used ${this.consumedAoWProcs} of them`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default AoWProcTracker;
