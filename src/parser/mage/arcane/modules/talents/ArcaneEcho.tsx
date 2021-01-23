import React from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import { formatNumber } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyDebuffEvent, RemoveDebuffEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { Trans } from '@lingui/macro';

const MIN_MISSILE_THRESHOLD = 3;

class ArcaneEcho extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
	};
	protected abilityTracker!: AbilityTracker;

	castsPerTouch = 0;
	totalCasts = 0;
	noMissileCasts = 0;
	lowMissileCasts = 0;
	touchOfTheMagiApplied = false;

	constructor(options: Options) {
    super(options);
		 this.active = this.selectedCombatant.hasTalent(SPELLS.ARCANE_ECHO_TALENT.id);
		 this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_MISSILES), this.onMissilesCast);
		 this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF), this.onDebuffApplied);
		 this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF), this.onDebuffRemoved);
	}

	onMissilesCast(event: CastEvent) {
		if (!this.touchOfTheMagiApplied) {
			return;
		}
		this.castsPerTouch += 1;
	}

	onDebuffApplied(event: ApplyDebuffEvent) {
		this.touchOfTheMagiApplied = true;
	}

	onDebuffRemoved(event: RemoveDebuffEvent) {
		if (this.castsPerTouch === 0) {
			this.noMissileCasts += 1;
		} else if (this.castsPerTouch < MIN_MISSILE_THRESHOLD) {
			this.lowMissileCasts += 1;
		}
		this.totalCasts += this.castsPerTouch;
		this.castsPerTouch = 0;
		this.touchOfTheMagiApplied = false;
	}

	get averageCastsPerTouch() {
		return this.totalCasts / this.abilityTracker.getAbility(SPELLS.TOUCH_OF_THE_MAGI.id).casts;
	}
	get badTouchUses() {
		return this.noMissileCasts + this.lowMissileCasts;
	}

	get touchUtilization() {
		return this.badTouchUses /  this.abilityTracker.getAbility(SPELLS.TOUCH_OF_THE_MAGI.id).casts;
	}

	get badTouchUsageThreshold() {
    return {
      actual: this.badTouchUses,
      isGreaterThan: {
				average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
	}

	suggestions(when: When) {
		when(this.badTouchUsageThreshold)
			.addSuggestion((suggest, actual, recommended) =>
				suggest(<>You failed to cast enough <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> into <SpellLink id={SPELLS.TOUCH_OF_THE_MAGI.id} /> {this.badTouchUses} times. When using <SpellLink id={SPELLS.ARCANE_ECHO_TALENT.id} /> you should be casting <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> non-stop (Whether you have <SpellLink id={SPELLS.CLEARCASTING_ARCANE.id} /> procs or not) until the <SpellLink id={SPELLS.TOUCH_OF_THE_MAGI.id} /> debuff is removed from the target.</>)
					.icon(SPELLS.ARCANE_MISSILES.icon)
					.actual(<Trans id="mage.arcane.suggestions.arcaneEcho.badTouchUses">{formatNumber(this.badTouchUses)} Bad Touch of the Magi Uses`</Trans>)
					.recommended(`${formatNumber(recommended)} is recommended`));
	}

	statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`You averaged ${formatNumber(this.averageCastsPerTouch)} Arcane Missile casts per use of Touch of the Magi. ${this.noMissileCasts > 0 ? `Additionally, you cast Touch of the Magi ${this.noMissileCasts} times without casting Arcane Missiles into it at all.` : '' } In order to get the most out of Arcane Echo, you should be hard casting Arcane Missiles into Touch of the Magi until the debuff is removed.`}
      >
        <BoringSpellValueText spell={SPELLS.ARCANE_ECHO_TALENT}>
          <>
            <SpellIcon id={SPELLS.ARCANE_MISSILES.id} /> {formatNumber(this.averageCastsPerTouch)} <small>Average casts per Touch of the Magi</small><br />
						<SpellIcon id={SPELLS.TOUCH_OF_THE_MAGI.id} /> {this.touchUtilization} <small>Touch of the Magi Utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneEcho;
