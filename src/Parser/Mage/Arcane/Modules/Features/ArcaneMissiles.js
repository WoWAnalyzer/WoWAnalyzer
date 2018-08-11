import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import { formatPercentage, formatMilliseconds } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';

const debug = false;

class ArcaneMissiles extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
	};

	castWithoutClearcasting = 0;

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_MISSILES.id) {
			return;
		}
		if (!this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE.id)) {
			debug && console.log("Arcane Missiles cast without Clearcasting @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
			this.castWithoutClearcasting += 1;
		}
	}

	get utilization() {
		return 1 - (this.castWithoutClearcasting / this.abilityTracker.getAbility(SPELLS.ARCANE_MISSILES.id).casts);
	}

	get suggestionThresholds() {
    return {
      actual: this.utilization,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.90,
      },
      style: 'percentage',
    };
  }

	suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> without <SpellLink id={SPELLS.CLEARCASTING_ARCANE.id} /> {this.castWithoutClearcasting} times. Arcane Missiles is a very expensive spell (more expensive than a 4 Charge Arcane Blast) and therefore it should only be cast when you have the Clearcasting buff which makes the spell free.</React.Fragment>)
					.icon(SPELLS.ARCANE_MISSILES.icon)
					.actual(`${formatPercentage(this.utilization)}% Uptime`)
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

export default ArcaneMissiles;
