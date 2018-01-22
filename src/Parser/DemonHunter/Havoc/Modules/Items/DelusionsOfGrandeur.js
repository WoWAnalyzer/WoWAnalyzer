import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/formatNumber';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Wrapper from 'common/Wrapper';

/*
* Equip: The remaining cooldown on Metamorphosis is reduced by 1 sec for every 30 Fury you spend.
*/

const COOLDOWN_REDUCTION_MS = 1000/30;

class DelusionsOfGrandeur extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		SpellUsable: SpellUsable,
	}

	on_initialized() {
		this.active = this.combatants.selected.hasShoulder(ITEMS.DELUSIONS_OF_GRANDEUR.id);
	}
}