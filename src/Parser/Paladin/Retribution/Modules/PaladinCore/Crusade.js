import React from 'react';

import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import {formatMilliseconds} from 'common/format';

const CAST_BUFFER = 1000;

class Crusade extends Analyzer {
	static dependencies = {
		combatants: Combatants,
	};

	on_initialized() {
		this.active = this.combatants.selected.hasTalent(SPELLS.CRUSADE_TALENT.id);
	}

	crusadeCastTimestamp = 0;
	badFirstGlobal = [];

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.CRUSADE_TALENT.id) {
			return;
		}
		this.crusadeCastTimestamp = event.timestamp;
	}

	on_byPlayer_applybuffstack(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.CRUSADE_TALENT.id) {
			return;
		}
		if(this.crusadeCastTimestamp && event.timestamp < this.crusadeCastTimestamp + CAST_BUFFER) {
			console.log(event.timestamp - this.crusadeCastTimestamp)
			console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time))
			this.badFirstGlobal.push(event.timestamp);
			this.crusadeCastTimestamp = null;
		}
		console.log(this.badFirstGlobal)
	}
}

export default Crusade;