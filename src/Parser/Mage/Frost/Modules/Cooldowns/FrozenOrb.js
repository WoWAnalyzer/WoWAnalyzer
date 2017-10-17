import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Module from 'Parser/Core/Module';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const BLIZZARD_REDUCTION_MS = 500;
const BRAIN_FREEZE_REDUCTION_MS = 5000;

class FrozenOrb extends Module {

	static dependencies = {
		combatants: Combatants,
		spellUsable: SpellUsable,
	}

	baseCooldown = 60;
	cooldownReduction = 0;
	frozenOrbCasts = 0;

  on_byPlayer_damage(event) {
		if(event.ability.guid !== SPELLS.BLIZZARD_DAMAGE.id) {
			return;
		}
		if (this.spellUsable.isOnCooldown(SPELLS.FROZEN_ORB.id)) {
			this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id,BLIZZARD_REDUCTION_MS);
		}
  }

	on_toPlayer_applybuff(event) {
		if (event.ability.guid !== SPELLS.BRAIN_FREEZE.id) {
			return;
		}
		if (this.combatants.selected.hasBuff(SPELLS.FROST_MAGE_T20_4SET_BONUS_BUFF.id) && this.spellUsable.isOnCooldown(SPELLS.FROZEN_ORB.id)) {
			this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id,BRAIN_FREEZE_REDUCTION_MS);
		}
	}

	on_byPlayer_cast(event) {
		if (event.ability.guid !== SPELLS.FROZEN_ORB.id) {
			return;
		}
		this.frozenOrbCasts += 1;
	}

	suggestions(when) {
		const fightDurationSeconds = this.owner.fightDuration / 1000;
		const frozenOrbUptimeSeconds = ((this.frozenOrbCasts * this.baseCooldown) - (this.cooldownReduction / 1000));
		const frozenOrbUptimePercentage = frozenOrbUptimeSeconds / fightDurationSeconds;
		when(frozenOrbUptimePercentage).isLessThan(0.95)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span><SpellLink id={SPELLS.FROZEN_ORB.id}/> was on Cooldown {formatPercentage(frozenOrbUptimePercentage)}% of the time. Make sure you are casting Frozen Orb as much as possible. </span>)
					.icon(SPELLS.FROZEN_ORB.icon)
					.actual(`${formatPercentage(frozenOrbUptimePercentage)}%`)
					.recommended('95% is Recommended')
					.regular(0.9).major(0.8);
			});
	}
}

export default FrozenOrb;
