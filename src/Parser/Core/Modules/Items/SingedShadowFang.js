import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';
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
}