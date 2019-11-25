import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class Consecration extends Analyzer {
  _hitsTaken = 0;
  _hitsMitigated = 0;

  on_toPlayer_damage(event) {
    this._hitsTaken += 1;
    if(this.selectedCombatant.hasBuff(SPELLS.CONSECRATION_BUFF.id)) {
      this._hitsMitigated += 1;
    }
  }

  get pctHitsMitigated() {
    return this._hitsMitigated / this._hitsTaken;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.pctHitsMitigated,
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
          return suggest('Your Consecration usage can be improved. Maintain it to reduce all incoming damage and refresh it during rotational downtime.')
            .icon(SPELLS.CONSECRATION_CAST.icon)
            .actual(`${formatPercentage(actual)}% of hits were mitigated by Consecration `)
            .recommended(`>${formatPercentage(recommended)}% is recommended`);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CONSECRATION_CAST.id} />}
        value={`${formatPercentage(this.pctHitsMitigated)} %`}
        label="Hits Mitigated w/ Consecration"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default Consecration;
