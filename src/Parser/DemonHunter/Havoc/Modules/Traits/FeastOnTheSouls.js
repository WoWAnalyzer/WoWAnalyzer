import React from 'react';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber } from 'common/format';

/**
* Feast on the Souls
* When you consume a Soul Fragment, the remaining cooldown on Eye Beam and Chaos Nova is reduced by 5 sec.
**/

const FEAST_ON_THE_SOULS_CDR = 5000;

class FeastOnTheSouls extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		spellUsable: SpellUsable,
	}

	on_initialized() {
		this.active = this.combatants.selected.traitsBySpellId[SPELLS.FEAST_ON_THE_SOULS.id] > 0;
	}

	totalCooldownReduction = 0;
	totalCooldownReductionWasted = 0;


	//This one works if they have this talent but the on heal event doesnt pick up every consome soul so we do both
	on_byPlayer_energize(event) {
		if(!this.combatants.selected.hasTalent(SPELLS.DEMONIC_APPETITE_TALENT.id)){
			return;
		}
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.DEMONIC_APPETITE_FURY.id) {
			return;
		}
		if(!this.spellUsable.isOnCooldown(SPELLS.EYE_BEAM.id)){
			this.totalCooldownReductionWasted += FEAST_ON_THE_SOULS_CDR;
			return;
		}
		const reduction = this.spellUsable.reduceCooldown(SPELLS.EYE_BEAM.id, FEAST_ON_THE_SOULS_CDR);
	
		this.totalCooldownReductionWasted += FEAST_ON_THE_SOULS_CDR - reduction;
		this.totalCooldownReduction += reduction;
	}

	on_byPlayer_heal(event) {
		if(this.combatants.selected.hasTalent(SPELLS.DEMONIC_APPETITE_TALENT.id)){
			return;
		}
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.CONSUME_SOUL.id) {
			return;
		}
		if(!this.spellUsable.isOnCooldown(SPELLS.EYE_BEAM.id)){
			this.totalCooldownReductionWasted += FEAST_ON_THE_SOULS_CDR;
			return;
		}
		const reduction = this.spellUsable.reduceCooldown(SPELLS.EYE_BEAM.id, FEAST_ON_THE_SOULS_CDR);

		this.totalCooldownReductionWasted += FEAST_ON_THE_SOULS_CDR - reduction;
		this.totalCooldownReduction += reduction;
	}

	on_finished() {
		this.active = this.totalCooldownReduction > 0 || this.totalCooldownReductionWasted > 0;
	}

	statistic() {
		return (
			<StatisticBox
  icon={<SpellIcon id={SPELLS.FEAST_ON_THE_SOULS.id}/>}
  value={`${formatNumber(this.totalCooldownReduction / 1000)} seconds`}
  label={<React.Fragment>Cooldown Reduction on <SpellLink id={SPELLS.EYE_BEAM.id} icon/></React.Fragment>}
  tooltip={`You wasted ${formatNumber(this.totalCooldownReductionWasted / 1000)} seconds of cooldown reduction`}
			/>
		);
	}
	statisticOrder = STATISTIC_ORDER.OPTIONAL(60);
}

export default FeastOnTheSouls;
