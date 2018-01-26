import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
* Aman'Thul's Vision
* Equip: Your spells and abilities have a chance to grant you 2200 Speed, Avoidance, and Leech for 12 sec.
* Aman'Thul's Grandeur
* When empowered by the Pantheon, your Main Stat is increased by 6700 for 15 sec.
*
*/

const MAIN_STAT_BUFF = 6700;
const TERTIARY_STAT_BUFF = 2200;

class AmanthulsVision extends Analyzer {
	static dependencies = {
		combatants: Combatants,
	};

	panthProc = 0
	tertProc = 0

	on_initialized() {
		this.active = this.combatants.selected.hasTrinket(ITEMS.AMANTHULS_VISION.id);
	}

	on_byPlayer_applybuff(event) {
		const spellId = event.ability.guid;
		if(spellId === SPELLS.GLIMPSE_OF_ENLIGHTENMENT.id){
			this.tertProc++;
		}
		if(spellId === SPELLS.AMANTHULS_GRANDEUR.id){
			this.panthProc++;
		}
	}

	on_byPlayer_refreshbuff(event) {
		const spellId = event.ability.guid;
		if(spellId === SPELLS.GLIMPSE_OF_ENLIGHTENMENT.id){
			this.tertProc++;
		}
		if(spellId === SPELLS.AMANTHULS_GRANDEUR.id){
			this.panthProc++;
		}
	}

	item() {
		const tertUptime = this.combatants.selected.getBuffUptime(SPELLS.GLIMPSE_OF_ENLIGHTENMENT.id) / this.owner.fightDuration;
		const mainUptime = this.combatants.selected.getBuffUptime(SPELLS.AMANTHULS_GRANDEUR.id) / this.owner.fightDuration;

		const averageMain = mainUptime * MAIN_STAT_BUFF;
		const averageTert = tertUptime * TERTIARY_STAT_BUFF;
		return {
			item: ITEMS.AMANTHULS_VISION,
			result: (
				<div>
					<dfn data-tip={`Procced the pantheon buff <b>${this.panthProc}</b> times with <b>${formatPercentage(mainUptime)}</b>% uptime.`}>
						{formatNumber(averageMain)} average {this.combatants.selected.spec.primaryStat}
					</dfn>
					<br/>
					<dfn data-tip={`Procced the tertiary buff <b>${this.tertProc}</b> times with <b>${formatPercentage(tertUptime)}</b>% uptime.`}>
						{formatNumber(averageTert)} average <SpellLink id={SPELLS.LEECH.id}/>, <SpellLink id={SPELLS.AVOIDANCE.id}/>, and <SpellLink id={SPELLS.SPEED.id}/>
					</dfn>
				</div>
			),
		};
	}
}

export default AmanthulsVision;