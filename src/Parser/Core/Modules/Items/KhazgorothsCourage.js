import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
* Khaz'Goroths Courage -
* Equip: Your damaging attacks have a chance to make your weapon glow hot with the fire of Khaz'goroth's forge, causing your autoattacks to do (1 * Mainhand weapon base speed * 46809) additional Fire damage for 12 sec.
* When empowered by the Pantheon, your Critical Strike, Haste, Mastery, or Versatility is increased by 4219 for 15 sec. Khaz'goroth always empowers your highest stat.
*/

class KhazgorothsCourage extends Analyzer {
	static dependencies = {
		combatants: Combatants,
	}

	damagProcs = 0
	pantheonProcs = 0
	damage = 0
	uptime = 0

	on_initialized() {
		this.active = this.combatants.selected.hasTrinket(ITEMS.KHAZGOROTHS_COURAGE.id);
	}

	on_byPlayer_applybuff(event) {
		const spellId = event.ability.guid;
		if (spellId === SPELLS.WORLDFORGERS_FLAME_BUFF.id) {
			this.damageProcs++;
		}
		if (spellId === SPELLS.KHAZGOROTHS_SHAPING.id) {
			this.pantheonProcs++;
		}
	}

	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if (spellId === SPELLS.WORLDFORGERS_FLAME_DAMAGE.id) {
			this.damage += event.amount + (event.absorbed || 0);
		}
	}

	item() {
		return {
			item: ITEMS.KHAZGOROTHS_COURAGE,
			result: (
				<dfn data-tip={`Procced the damage buff <b>${this.damageProcs}</b> times. Then pantheon buff procced<b>${this.pantheonProcs}</b> times.`}>
					{this.owner.formatItemDamageDone(this.damage)}
				</dfn>
			),
		};
	}
}

export default KhazgorothsCourage;