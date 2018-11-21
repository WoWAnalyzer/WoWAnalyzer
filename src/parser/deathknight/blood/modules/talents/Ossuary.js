import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

const OSSUARY_RUNICPOWER_REDUCTION = 5;

class Ossuary extends Analyzer {
  dsWithOS = 0;
  dsWithoutOS = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.OSSUARY_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.OSSUARY.id) / this.owner.fightDuration;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.DEATH_STRIKE.id) return;

    if (this.selectedCombatant.hasBuff(SPELLS.OSSUARY.id)) {
      this.dsWithOS += 1;
    } else {
      this.dsWithoutOS += 1;
    }
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest('Your Ossuary uptime can be improved. Try to always be above 5 stacks of Bone Shield when you have the talent selected.')
            .icon(SPELLS.OSSUARY.icon)
            .actual(`${formatPercentage(actual)}% Ossuary uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`);
        });
  }

  statistic() {

    return (
      <TalentStatisticBox
        talent={SPELLS.OSSUARY_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(3)}
        value={`${ this.dsWithoutOS } / ${ this.dsWithOS + this.dsWithoutOS }`}
        label="Death Strikes without Ossuary"
        tooltip={`
          ${ this.dsWithoutOS * OSSUARY_RUNICPOWER_REDUCTION } RP wasted by casting them without Ossuary up.<br>
          ${ this.dsWithOS * OSSUARY_RUNICPOWER_REDUCTION } RP saved by casting them with Ossuary up.<br>
          ${formatPercentage(this.uptime)}% uptime.
        `}
      />
    );
  }
}

export default Ossuary;
