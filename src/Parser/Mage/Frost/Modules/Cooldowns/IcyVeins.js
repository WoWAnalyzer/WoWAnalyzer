import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Module from 'Parser/Core/Module';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const FROSTBOLT_CRIT_REDUCTION_MS = 500;

class FrozenOrb extends Module {

	static dependencies = {
		combatants: Combatants,
		spellUsable: SpellUsable,
	}

	baseCooldown = 180;
	cooldownReduction = 0;
	icyVeinsCasts = 0;

  on_byPlayer_damage(event) {
		if(event.ability.guid !== SPELLS.FROSTBOLT_DAMAGE.id || event.hitType !== HIT_TYPES.CRIT) {
			return;
		}
		const frozenVeinsRanks = this.combatants.selected.traitsBySpellId[SPELLS.FROZEN_VEINS_TRAIT.id];
		if (this.spellUsable.isOnCooldown(SPELLS.ICY_VEINS.id)) {
			this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.ICY_VEINS.id,(FROSTBOLT_CRIT_REDUCTION_MS * frozenVeinsRanks));
		}
  }

	on_byPlayer_cast(event) {
		if (event.ability.guid !== SPELLS.ICY_VEINS.id) {
			return;
		}
		this.icyVeinsCasts += 1;
	}

	suggestions(when) {
		const fightDurationSeconds = this.owner.fightDuration / 1000;
		const icyVeinsUptimeSeconds = ((this.icyVeinsCasts * this.baseCooldown) - (this.cooldownReduction / 1000));
		const icyVeinsUptimePercentage = icyVeinsUptimeSeconds / fightDurationSeconds;
		when(icyVeinsUptimePercentage).isLessThan(0.95)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span><SpellLink id={SPELLS.ICY_VEINS.id}/> was on Cooldown {formatPercentage(icyVeinsUptimePercentage)}% of the time. Make sure you are casting Icy veins as much as possible. </span>)
					.icon(SPELLS.ICY_VEINS.icon)
					.actual(`${formatPercentage(icyVeinsUptimePercentage)}%`)
					.recommended('95% is Recommended')
					.regular(0.9).major(0.8);
			});
	}
}

export default FrozenOrb;
