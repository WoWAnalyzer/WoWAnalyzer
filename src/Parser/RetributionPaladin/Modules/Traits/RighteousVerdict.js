import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import GetDamageBonusStacked from '../PaladinCore/GetDamageBonusStacked';

const RIGHTEOUS_VERDICT_INCREASE = 0.08;
/**
 * Righteous Verdict (Artifact Trait)
 * After spending Holy Power the damage of your next
 * Blade of justice/Divine Hammers by 8%.
 */

 class RighteousVerdict extends Module {
 	static dependencies = {
 		combatants: Combatants,
 	};

 	rank = 0;
 	damage = 0;

 	on_initialized() {
 		this.rank = this.combatants.selected.traitsBySpellId[SPELLS.RIGHTEOUS_VERDICT.id];
 		this.active = this.rank > 0;
 	}

 	on_byPlayer_damage(event) {
 		if(!this.combatants.selected.hasBuff(SPELLS.RIGHTEOUS_VERDICT_BUFF.id)){
 			return;
 		}
 		if(event.ability.guid === SPELLS.BLADE_OF_JUSTICE.id || event.ability.guid === SPELLS.DIVINE_HAMMER_HIT.id){
 			this.damage += GetDamageBonusStacked(event, RIGHTEOUS_VERDICT_INCREASE, this.rank);
 		}
 	}

 	subStatistic() {
 		return (
 			<div className='flex'>
 				<div className='flex-main'>
 					<SpellLink id={SPELLS.RIGHTEOUS_VERDICT.id}>
 						<SpellIcon id={SPELLS.RIGHTEOUS_VERDICT.id} noLink /> Righteous Verdict
 					</SpellLink>
 				</div>
 				<div className='flex-sub text-right'>
 					{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %
 				</div>
 			</div>
 		);
 	}
 }

 export default RighteousVerdict;