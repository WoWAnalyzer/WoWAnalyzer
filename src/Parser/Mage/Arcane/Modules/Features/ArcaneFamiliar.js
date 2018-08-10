import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';

class ArcaneFamiliar extends Analyzer {

	constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ARCANE_FAMILIAR_TALENT.id);
  }

	get uptime() {
		return this.selectedCombatant.getBuffUptime(SPELLS.ARCANE_FAMILIAR_BUFF.id) / this.owner.fightDuration;
	}

	get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 1,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

	suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>Your <SpellLink id={SPELLS.ARCANE_FAMILIAR_TALENT.id} /> was up for {formatPercentage(this.uptime)}% of the fight. If your Arcane Familiar dies, make sure you recast it. If you are having trouble keeping the Arcane Familiar up for the entire fight, consider taking a different talent.</React.Fragment>)
					.icon(SPELLS.ARCANE_FAMILIAR_TALENT.icon)
					.actual(`${formatPercentage(this.uptime)}% Uptime`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
	}

	statistic() {
    return (
			<StatisticBox
  icon={<SpellIcon id={SPELLS.ARCANE_FAMILIAR_TALENT.id} />}
  value={`${formatPercentage(this.uptime, 0)} %`}
  label="Arcane Familiar Uptime"
  tooltip={`Your Arcane Familiar was up for ${formatPercentage(this.uptime)}% of the fight. If your Arcane Familiar dies, make sure you recast it. If you are having trouble keeping the Arcane Familiar up for the entire fight, consider taking a different talent.`}
			/>
		);
	}
	statisticOrder = STATISTIC_ORDER.CORE(12);
}

export default ArcaneFamiliar;
