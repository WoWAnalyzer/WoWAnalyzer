import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import getDamageBonusStacked from '../PaladinCore/getDamageBonusStacked';

const SHARPENED_EDGE_INCREASE = 0.06;
/**
 * Sharpened Blade (Artifact Trait)
 * Increase the crit chance of Crusaders Strike/Zeal by 6%
 */

 class SharpenedEdge extends Module {
 	static dependencies = {
 		combatants: Combatants,
 	};

 	rank = 0;
 	damage = 0;

 	on_initialized() {
 		this.rank = this.combatants.selected.traitsBySpellId[SPELLS.SHARPENED_EDGE.id];
 		this.active = this.rank > 0;
 	}

 	on_byPlayer_damage(event) {

 	}

 	subStatistic() {
 		return (
 			<div className='flex'>
 				<div className='flex-main'>
 					<SpellLink id={SPELLS.SHARPENED_EDGE.id}>
 						<SpellIcon id={SPELLS.SHARPENED_EDGE.id} noLink /> Sharpened Edge
 					</SpellLink>
 				</div>
 				<div className='flex-sub text-right'>
 					{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %
 				</div>
 			</div>
 		);
 	}
 }

 export default SharpenedEdge;