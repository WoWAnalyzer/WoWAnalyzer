import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';

class ArcaneOrb extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
	};
	
	totalHits = 0;
	badCasts = 0;
	orbCast = true;

	constructor(...args) {
    super(...args);
	   this.active = this.selectedCombatant.hasTalent(SPELLS.ARCANE_ORB_TALENT.id) && !this.selectedCombatant.hasShoulder(ITEMS.MANTLE_OF_THE_FIRST_KIRIN_TOR.id);
  }

	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_ORB_DAMAGE.id) {
			return;
		}
		this.totalHits += 1;
		this.orbCast = false;
	}

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_ORB_TALENT.id) {
			return;
		}
		if (this.orbCast) {
			this.badCasts += 1;
		}
		this.orbCast = true;
	}

	on_finished() {
		if (this.orbCast) {
			this.badCasts += 1;
		}
	}

	get averageHitPerCast() {
		return this.totalHits / this.abilityTracker.getAbility(SPELLS.ARCANE_ORB_TALENT.id).casts;
	}

	get averageHitThresholds() {
    return {
      actual: this.averageHitPerCast,
      isLessThan: {
        minor: 2,
        average: 1.5,
        major: 1,
      },
      style: 'number',
    };
	}

	suggestions(when) {
		when(this.averageHitThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>On average, your <SpellLink id={SPELLS.ARCANE_ORB_TALENT.id} /> hit ${formatNumber(this.averageHitPerCast,2)} times per cast. While it is beneficial to cast this even if it will only hit one mob, the talent is suited more towards AOE than Single Target. So if the fight is primarily Single Target, consider taking a different talent.</React.Fragment>)
					.icon(SPELLS.ARCANE_ORB_TALENT.icon)
					.actual(`${formatNumber(this.averageHitPerCast)} Hits Per Cast`)
					.recommended(`${formatNumber(recommended)} is recommended`);
			});
	}

	statistic() {
    return (
			<StatisticBox
  icon={<SpellIcon id={SPELLS.ARCANE_ORB_TALENT.id} />}
  value={`${formatNumber(this.averageHitPerCast,2)}`}
  label="Arcane Orb hits per cast"
  tooltip={`You averaged ${formatNumber(this.averageHitPerCast,2)} hits per cast of Arcane Orb. ${this.badCasts > 0 ? `Additionally, you cast Arcane Orb ${this.badCasts} times without hitting anything.` : '' } Casting Arcane Orb when it will only hit one target is still beneficial, but you should prioritize using it when it will hit multiple targets to get the full effect of the talent. If it is a Single Target fight or you are unable to hit more than 1 target on average, then you should consider taking a different talent.`}
			/>
		);
	}
	statisticOrder = STATISTIC_ORDER.CORE(12);
}

export default ArcaneOrb;
