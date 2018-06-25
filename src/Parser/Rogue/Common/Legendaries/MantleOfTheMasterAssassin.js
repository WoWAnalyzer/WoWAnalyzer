import React from 'react';

import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';

class MantleOfTheMasterAssassin extends Analyzer {

  constructor(...args) {
    super(...args);
		this.active = this.selectedCombatant.hasShoulder(ITEMS.MANTLE_OF_THE_MASTER_ASSASSIN.id);
  }
  
	item() {
		return {
			item: ITEMS.MANTLE_OF_THE_MASTER_ASSASSIN,
			result: <React.Fragment>Equipped.</React.Fragment>,
		};
	}

}

export default MantleOfTheMasterAssassin;
