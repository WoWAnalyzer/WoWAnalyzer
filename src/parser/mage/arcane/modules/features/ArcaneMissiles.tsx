import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const debug = false;

class ArcaneMissiles extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
	};
	protected abilityTracker!: AbilityTracker;

	castWithoutClearcasting = 0;

	constructor(options: Options) {
    super(options);
			this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.ARCANE_MISSILES, SPELLS.ARCANE_BARRAGE]), this.onCast);
  }

	onCast(event: CastEvent) {
		const spellId = event.ability.guid;
		if (spellId === SPELLS.ARCANE_MISSILES.id && !this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE.id)) {
			debug && this.log('Arcane Missiles cast without Clearcasting');
			this.castWithoutClearcasting += 1;
		}
	}

	get missilesUtilization() {
		return 1 - (this.castWithoutClearcasting / (this.abilityTracker.getAbility(SPELLS.ARCANE_MISSILES.id).casts));
	}

	get arcaneMissileUsageThresholds() {
    return {
      actual: this.missilesUtilization,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.90,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
	}

	suggestions(when: When) {
		when(this.arcaneMissileUsageThresholds)
			.addSuggestion((suggest, actual, recommended) => suggest(<>You cast <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> without <SpellLink id={SPELLS.CLEARCASTING_ARCANE.id} /> {this.castWithoutClearcasting} times. Arcane Missiles is a very expensive spell (more expensive than a 4 Charge Arcane Blast) and therefore it should only be cast when you have the Clearcasting buff which makes the spell free.</>)
					.icon(SPELLS.ARCANE_MISSILES.icon)
					.actual(i18n._(t('mage.arcane.suggestions.arcaneMissiles.clearCasting.uptime')`${formatPercentage(this.missilesUtilization)}% Uptime`))
					.recommended(`${formatPercentage(recommended)}% is recommended`));
	}
}

export default ArcaneMissiles;
