import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';

class ArcaneIntellect extends Analyzer {

	get uptime() {
		return this.selectedCombatant.getBuffUptime(SPELLS.ARCANE_INTELLECT.id) / this.owner.fightDuration;
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
				return suggest(<React.Fragment><SpellLink id={SPELLS.ARCANE_INTELLECT.id} /> was up for {formatPercentage(this.uptime)}% of the fight. Ensure you are casting this before the pull and recasting it every time you are ressurected.</React.Fragment>)
					.icon(SPELLS.ARCANE_INTELLECT.icon)
					.actual(`${formatPercentage(this.uptime)}% Uptime`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
	}

	statistic() {
    return (
			<StatisticBox
  position={STATISTIC_ORDER.CORE(80)}
  icon={<SpellIcon id={SPELLS.ARCANE_INTELLECT.id} />}
  value={`${formatPercentage(this.uptime, 0)} %`}
  label="Arcane Intellect"
  tooltip={`Arcane Intellect was up for ${formatPercentage(this.uptime)}% of the fight. Ensure you are casting this before the pull and recasting it every time you are ressurected.`}
			/>
		);
	}
}

export default ArcaneIntellect;
