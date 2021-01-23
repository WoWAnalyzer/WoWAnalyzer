import React from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { formatPercentage } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { Trans } from '@lingui/macro';
import Enemies from 'parser/shared/modules/Enemies';

const debug = false;

class ArcaneMissiles extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
		enemies: Enemies,
	};
	protected abilityTracker!: AbilityTracker;
	protected enemies!: Enemies;

	hasArcaneEcho: boolean;
	castWithoutClearcasting = 0;

	constructor(options: Options) {
		super(options);
		this.hasArcaneEcho = this.selectedCombatant.hasTalent(SPELLS.ARCANE_ECHO_TALENT.id);
		this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_MISSILES), this.onMissilesCast);
  }

	onMissilesCast(event: CastEvent) {
		const spellId = event.ability.guid;
		const enemy = this.enemies.getEntity(event);
		if (this.hasArcaneEcho && enemy && enemy.hasBuff(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id)) {
			return;
		}

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
			.addSuggestion((suggest, actual, recommended) => suggest(<>You cast <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> improperly {this.castWithoutClearcasting} times. In order to get the most out of <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> you should only cast it if you have <SpellLink id={SPELLS.CLEARCASTING_ARCANE.id} /> or if you are using <SpellLink id={SPELLS.ARCANE_ECHO_TALENT.id} /> and the target has <SpellLink id={SPELLS.TOUCH_OF_THE_MAGI.id} />.</>)
				.icon(SPELLS.ARCANE_MISSILES.icon)
				.actual(<Trans id="mage.arcane.suggestions.arcaneMissiles.clearCasting.uptime">{formatPercentage(this.missilesUtilization)}% Uptime</Trans>)
				.recommended(`${formatPercentage(recommended)}% is recommended`));
	}
}

export default ArcaneMissiles;
