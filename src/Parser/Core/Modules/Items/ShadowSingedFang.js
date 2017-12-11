import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';


/*
* Shadow-Singed Fang
* Equip: Your melee and ranged abilities have a chance to increase your Strength or Agility by 5,458 for 12 sec.
*
* Equip: Your autoattacks have a chance to increase your Critical Strike by 2,642 for 12 sec.
*/

class ShadowSingedFang extends Analyzer {
	static dependencies = {
		combatants: Combatants,
	};

	mainStatBuff = 0
	critStatBuff = 0

	mainProc = 0
	critProc = 0

	on_initialized() {
		this.active = this.combatants.selected.hasTrinket(ITEMS.SHADOW_SINGED_FANG.id);
		if (this.active) {
			this.mainStatBuff = calculateSecondaryStatDefault(930, 5458, this.combatants.selected.getItem(ITEMS.SHADOW_SINGED_FANG.id).itemLevel);
			this.critStatBuff = calculateSecondaryStatDefault(930, 2642, this.combatants.selected.getItem(ITEMS.SHADOW_SINGED_FANG.id).itemLevel);
		}
	}

	on_byPlayer_applybuff(event){
		const spellId = event.ability.guid;
		if(spellId === SPELLS.FLAMES_OF_FHARG.id){
			this.mainProc++;
		}
		if(spellId === SPELLS.CORRUPTION_OF_SHATUG.id){
			this.critProc++;
		}
	}

	on_byPlayer_refreshbuff(event){
		const spellId = event.ability.guid;
		if(spellId === SPELLS.FLAMES_OF_FHARG.id){
			this.mainProc++;
		}
		if(spellId === SPELLS.CORRUPTION_OF_SHATUG.id){
			this.critProc++;
		}
	}

	item(){
		const mainUptime = this.combatants.selected.getBuffUptime(SPELLS.FLAMES_OF_FHARG.id) / this.owner.fightDuration;
		const critUptime = this.combatants.selected.getBuffUptime(SPELLS.CORRUPTION_OF_SHATUG.id) / this.owner.fightDuration;

		const averageMain = mainUptime * this.mainStatBuff;
		const averageCrit = critUptime * this.critStatBuff;
		return {
			item: ITEMS.SHADOW_SINGED_FANG,
			result: (
				<div>
					<dfn data-tip={`Proced the main stat buff <b>${this.mainProc}</b> times with <b>${formatPercentage(mainUptime)}</b> % uptime`}>
						{formatNumber(averageMain)} average main stat
					</dfn>
					<br/>
					<dfn data-tip={`Proced the main stat buff <b>${this.critProc}</b> times with <b>${formatPercentage(critUptime)}</b> % uptime`}>
						{formatNumber(averageCrit)} average crit
					</dfn>
				</div>
			),
		};
	}
}

export default ShadowSingedFang;