import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class Ossuary extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  dsWithOS = 0;
  dsWithoutOS = 0;
  OSSUARY_RP_SAVE = 5;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.OSSUARY_TALENT.id);
  }

  get uptime() {
    return this.combatants.getBuffUptime(SPELLS.OSSUARY.id) / this.owner.fightDuration;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.DEATH_STRIKE.id) return;

    if (this.combatants.selected.hasBuff(SPELLS.OSSUARY.id)) {
      this.dsWithOS += 1;
    } else {
      this.dsWithoutOS += 1;
    }
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.94,
        average: 0.84,
        major: .74,
      },
      style: 'percentage',
    };
  }
  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.OSSUARY_TALENT.id} />}
        value={`${ this.dsWithoutOS } / ${ this.dsWithOS + this.dsWithoutOS }`}
        label="Death Strikes without Ossuary"
        tooltip={`${ this.dsWithoutOS } / ${ this.dsWithOS + this.dsWithoutOS } Death Strike casted without Ossuary.<br>
        ${ this.dsWithoutOS * this.OSSUARY_RP_SAVE } RP wasted by casting them without Ossuary up.<br>
        ${ this.dsWithOS * this.OSSUARY_RP_SAVE } RP saved by casting them with Ossuary up.<br>
        ${formatPercentage(this.uptime)}% uptime.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Ossuary;
