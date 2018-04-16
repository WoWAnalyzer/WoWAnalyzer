import React from 'react';

import ITEMS from 'common/ITEMS';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';
import Wrapper from 'common/Wrapper';

class DreadlordsDeceit extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

	on_initialized(){
		this.active = this.combatants.selected.hasBack(ITEMS.THE_DREADLORDS_DECEIT.id);
  }
  
	item() {
		return {
			item: ITEMS.THE_DREADLORDS_DECEIT,
			result: <Wrapper>Equipped.</Wrapper>,
		};
	}

}

export default DreadlordsDeceit;