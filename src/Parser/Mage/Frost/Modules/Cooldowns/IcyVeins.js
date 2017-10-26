import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

const FROSTBOLT_CRIT_REDUCTION_MS = 500;

class FrozenOrb extends Analyzer {

	static dependencies = {
		combatants: Combatants,
		spellUsable: SpellUsable,
		abilityTracker: AbilityTracker,
	}

	baseCooldown = 180;
	cooldownReduction = 0;

	on_initialized() {
		this.reductionAmount = FROSTBOLT_CRIT_REDUCTION_MS * this.combatants.selected.traitsBySpellId[SPELLS.FROZEN_VEINS_TRAIT.id];
	}

  on_byPlayer_damage(event) {
		if(event.ability.guid !== SPELLS.FROSTBOLT_DAMAGE.id || event.hitType !== HIT_TYPES.CRIT) {
			return;
		}
		if (this.spellUsable.isOnCooldown(SPELLS.ICY_VEINS.id)) {
			this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.ICY_VEINS.id,(this.reductionAmount));
		}
  }

	suggestions(when) {
		const icyVeinsCasts = this.abilityTracker.getAbility(SPELLS.ICY_VEINS.id).casts;
		const fightDurationSeconds = this.owner.fightDuration / 1000;
		const icyVeinsOnCooldownSeconds = ((icyVeinsCasts * this.baseCooldown) - (this.cooldownReduction / 1000));
		const icyVeinsOnCooldownPercentage = icyVeinsOnCooldownSeconds / fightDurationSeconds;
		when(icyVeinsOnCooldownPercentage).isLessThan(0.95)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span><SpellLink id={SPELLS.ICY_VEINS.id}/> was on Cooldown {formatPercentage(icyVeinsOnCooldownPercentage)}% of the time. Make sure you are casting Icy veins as much as possible. </span>)
					.icon(SPELLS.ICY_VEINS.icon)
					.actual(`${formatPercentage(icyVeinsOnCooldownPercentage)}%`)
					.recommended(`${formatPercentage(recommended)}% is Recommended`)
					.regular(0.9).major(0.8);
			});
	}
}

export default FrozenOrb;
