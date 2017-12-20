import React from 'react';

import ITEMS from 'common/ITEMS';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';
import Wrapper from 'common/Wrapper';

class ShadowSatyrsWalk extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

	on_initialized(){
		this.active = this.combatants.selected.hasFeet(ITEMS.SHADOW_SATYRS_WALK.id);
  }
  
	item() {
		return {
			item: ITEMS.SHADOW_SATYRS_WALK,
			result: <Wrapper>Equipped.</Wrapper>,
		};
	}

}

export default ShadowSatyrsWalk;