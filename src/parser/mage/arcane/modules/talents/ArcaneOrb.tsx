import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, FightEndEvent } from 'parser/core/Events';

class ArcaneOrb extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
	};
	protected abilityTracker!: AbilityTracker;

	totalHits = 0;
	badCasts = 0;
	orbCast = false;

	constructor(options: any) {
    super(options);
	   this.active = this.selectedCombatant.hasTalent(SPELLS.ARCANE_ORB_TALENT.id);
		 this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_ORB_TALENT), this.onOrbCast);
		 this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_ORB_DAMAGE), this.onOrbDamage);
		 this.addEventListener(Events.fightend, this.onFightEnd);
  }

	onOrbDamage(event: DamageEvent) {
		this.totalHits += 1;
		this.orbCast = false;
	}

	onOrbCast(event: CastEvent) {
		if (this.orbCast) {
			this.badCasts += 1;
		}
		this.orbCast = true;
	}

	onFightEnd(event: FightEndEvent) {
		if (this.orbCast) {
			this.badCasts += 1;
		}
	}

	get averageHitPerCast() {
		return this.totalHits / this.abilityTracker.getAbility(SPELLS.ARCANE_ORB_TALENT.id).casts;
	}

	get arcaneOrbHitThresholds() {
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

	suggestions(when: any) {
		when(this.arcaneOrbHitThresholds)
			.addSuggestion((suggest: any, actual: any, recommended: any) => {
				return suggest(<>On average, your <SpellLink id={SPELLS.ARCANE_ORB_TALENT.id} /> hit ${formatNumber(this.averageHitPerCast)} times per cast. While it is beneficial to cast this even if it will only hit one mob, the talent is suited more towards AOE than Single Target. So if the fight is primarily Single Target, consider taking a different talent.</>)
					.icon(SPELLS.ARCANE_ORB_TALENT.icon)
					.actual(`${formatNumber(this.averageHitPerCast)} Hits Per Cast`)
					.recommended(`${formatNumber(recommended)} is recommended`);
			});
	}

	statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`You averaged ${formatNumber(this.averageHitPerCast)} hits per cast of Arcane Orb. ${this.badCasts > 0 ? `Additionally, you cast Arcane Orb ${this.badCasts} times without hitting anything.` : '' } Casting Arcane Orb when it will only hit one target is still beneficial, but you should prioritize using it when it will hit multiple targets to get the full effect of the talent. If it is a Single Target fight or you are unable to hit more than 1 target on average, then you should consider taking a different talent.`}
      >
        <BoringSpellValueText spell={SPELLS.ARCANE_FAMILIAR_TALENT}>
          <>
            {formatNumber(this.averageHitPerCast)} <small>Average hits per cast</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneOrb;
