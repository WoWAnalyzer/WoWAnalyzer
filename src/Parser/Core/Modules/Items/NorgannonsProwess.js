import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
* Norgannon's Prowess
* 
* Equip: Your damaging spells have a chance to increase your Intellect by 3257 for 12 sec.
*
* Norgannon's Command
* When empowered by the Pantheon, you gain 6 charges of Norgannon's Command for 15 sec. Your damaging spells expend a charge to inflict an additional 161332 damage to the target, from a random school of magic.
*
*/

const NORGANNONS_COMMAND_SPELLS = new Set([
	SPELLS.NORGANNONS_FIREBALL.id,
	SPELLS.NORGANNONS_FROSTBOLT.id,
	SPELLS.NORGANNONS_SHADOW_BOLT.id,
	SPELLS.NORGANNONS_ARCANE_MISSLE.id,
	SPELLS.NORGANNONS_DIVINE_SMITE.id,
	SPELLS.NORGANNONS_WRATH.id,
]);

class NorgannonsProwess extends Analyzer {

	static dependencies = {
    combatants: Combatants,
  };

  intProc = 0
  pantheonProc = 0
  damage = 0;

	on_initialized() {
		this.active = this.combatants.selected.hasTrinket(ITEMS.NORGANNONS_PROWESS.id);
	}

	on_byPlayer_applybuff(event) {
		const spellId = event.ability.guid;
		if(spellId === SPELLS.RUSH_OF_KNOWLEDGE.id) {
			this.intProc++;
		}
		if(spellId === SPELLS.NORGANNONS_COMMAND.id) {
			this.pantheonProc++;
		}
	}

	on_byPlayer_refreshbuff(event) {
		const spellId = event.ability.guid;
		if(spellId === SPELLS.RUSH_OF_KNOWLEDGE.id) {
			this.intProc++;
		}
		if(spellId === SPELLS.NORGANNONS_COMMAND.id) {
			this.pantheonProc++;
		}
	}

	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if(!NORGANNONS_COMMAND_SPELLS.has(spellId)) {
			return;
		}
		this.damage += event.amount + (event.absorbed || 0);
	}

	item() {
		const intUptimePercent = this.combatants.selected.getBuffUptime(SPELLS.RUSH_OF_KNOWLEDGE.id) / this.owner.fightDuration;

		return {
			item: ITEMS.NORGANNONS_PROWESS,
			result: (
				<div>
					<dfn data-tip={`Procced the int buff <b>${this.intProc}</b> times`}>
						<span>{formatPercentage(intUptimePercent)} % uptime on <SpellLink id={SPELLS.RUSH_OF_KNOWLEDGE.id}/></span>
					</dfn>
					<br></br>
					<dfn data-tip={`Procced the pantheon buff <b>${this.pantheonProc}</b> times`}>
						<span>{this.owner.formatItemDamageDone(this.damage)} from <SpellLink id={SPELLS.NORGANNONS_COMMAND.id}/></span>
					</dfn>
				</div>
			),
		};
	}
}

export default NorgannonsProwess;