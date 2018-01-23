import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const COOLDOWN_REDUCTION_MS = 300;

class RaddonsCascadingEyes extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		spellUsable: SpellUsable,
	};

	effectiveEyeBeamReduction = 0;
	wastedEyeBeamReduction = 0;
	counter = 0

	on_initialized() {
		this.active = this.combatants.selected.hasHead(ITEMS.RADDONS_CASCADING_EYES.id);
	}

	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.EYE_BEAM_DAMAGE.id){
			return;
		}
		const eyeBeamIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.EYE_BEAM.id);
		if(eyeBeamIsOnCooldown) {
			const reductionMs = this.spellUsable.reduceCooldown(SPELLS.EYE_BEAM.id, COOLDOWN_REDUCTION_MS);
			this.effectiveEyeBeamReduction += reductionMs;
		}
		else {
			this.wastedEyeBeamReduction += COOLDOWN_REDUCTION_MS;
		}
	}

	item() {
		return {
			item: ITEMS.RADDONS_CASCADING_EYES,
			result: (
				<dfn data-tip={`You wasted ${formatNumber(this.wastedEyeBeamReduction / 1000)} seconds of CDR.<br/>`}>
					reduced <SpellLink id={SPELLS.EYE_BEAM.id} icon/> cooldown by {formatNumber(this.effectiveEyeBeamReduction / 1000)}s in total
				</dfn>
			),
		};
	}
}

export default RaddonsCascadingEyes;