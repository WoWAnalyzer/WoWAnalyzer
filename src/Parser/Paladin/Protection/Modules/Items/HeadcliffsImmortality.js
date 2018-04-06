import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage } from 'common/format';

const DR_IN_CONSEC = 4;

/**
 * Gain 4% DR while standing in Consecration
*/
class HeadcliffsImmortality extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.HEATHCLIFFS_IMMORTALITY.id);
  }

  get uptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.IMMORTAL_OBJECT.id) / this.owner.fightDuration;
  }

  item() {
		return {
			item: ITEMS.HEATHCLIFFS_IMMORTALITY,
			result: (
				<dfn data-tip={`${ formatPercentage(this.uptime)}% uptime`}>
					average { (this.uptime * DR_IN_CONSEC).toFixed(2) }% DR
				</dfn>
			),
		};
	}
}

export default HeadcliffsImmortality;
