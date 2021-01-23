import React from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { formatNumber } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, FightEndEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { Trans } from '@lingui/macro';

class ArcaneOrb extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
	};
	protected abilityTracker!: AbilityTracker;

	totalHits = 0;
	badCasts = 0;
	orbCast = false;

	constructor(options: Options) {
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

	get averageHitsPerCast() {
		return this.totalHits / this.abilityTracker.getAbility(SPELLS.ARCANE_ORB_TALENT.id).casts;
	}

	get missedOrbsThresholds() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
				average: 0,
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
	}

	suggestions(when: When) {
		when(this.missedOrbsThresholds)
			.addSuggestion((suggest, actual, recommended) =>
				suggest(<>You cast <SpellLink id={SPELLS.ARCANE_ORB_TALENT.id} /> {this.badCasts} times without hitting anything. While it is acceptable to use this ability on Single Target encounters, you need to ensure you are aiming the ability so that it will at least hit one target.</>)
					.icon(SPELLS.ARCANE_ORB_TALENT.icon)
					.actual(<Trans id="mage.arcane.suggestions.arcaneOrb.badCasts">{formatNumber(this.badCasts)} Missed Orbs</Trans>)
					.recommended(`${formatNumber(recommended)} is recommended`));
	}

	statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`You averaged ${formatNumber(this.averageHitsPerCast)} hits per cast of Arcane Orb. ${this.badCasts > 0 ? `Additionally, you cast Arcane Orb ${this.badCasts} times without hitting anything.` : '' } Casting Arcane Orb when it will only hit one target is still beneficial and acceptable, but if you can aim it so that it hits multiple enemies then you should.`}
      >
        <BoringSpellValueText spell={SPELLS.ARCANE_ORB_TALENT}>
          <>
            {formatNumber(this.averageHitsPerCast)} <small>Average hits per cast</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneOrb;
